import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { eq, sql } from "drizzle-orm";
import { NonRetriableError } from "inngest";
import { db } from "@/lib/db";
import { analysis, user } from "@/lib/schema";
import { buildMessages } from "@/product/buildMessages";
import { productConfig } from "@/product/config";
import { preprocess } from "@/product/preprocess";
import { prompt } from "@/product/prompt";
import { outputSchema } from "@/product/schema";
import { inngest } from "./client";
import { sendAnalysisCompleteEmail } from "@/lib/email";

const { creditsPerAnalysis } = productConfig.credits;
const productName = process.env.NEXT_PUBLIC_APP_URL?.split('//')[1]?.split('.')[0] || 'Micro SaaS';

export const processAnalysis = inngest.createFunction(
  {
    id: "process-analysis",
    retries: 3,
  },
  { event: "analysis/upload.completed" },
  async ({ event, step }) => {
    const { analysisId, inputUrl, inputType } = event.data;

    if (!analysisId) {
      throw new NonRetriableError("Missing analysisId in event data");
    }

    // Update status to processing
    await step.run("update-status-processing", async () => {
      const result = await db
        .update(analysis)
        .set({ status: "processing", updatedAt: new Date() })
        .where(eq(analysis.id, analysisId))
        .returning();

      if (result.length === 0) {
        throw new NonRetriableError(`Analysis ${analysisId} not found in database`);
      }

      return result[0];
    });

    try {
      const analysisResult = await step.run("analyze-with-ai", async () => {
        // Pre-process input into a format the AI can consume
        const processed = await preprocess({ type: inputType as any, url: inputUrl });

        // Build messages from processed input
        const messages = buildMessages(processed);

        const result = await generateObject({
          model: openrouter("openai/gpt-4o"),
          schema: outputSchema,
          system: prompt,
          messages,
          temperature: 0,
          topP: 1,
          presencePenalty: 0,
          frequencyPenalty: 0,
        });

        return result.object;
      });

      await step.run("save-analysis-result", async () => {
        await db
          .update(analysis)
          .set({ result: JSON.stringify(analysisResult), status: "complete", updatedAt: new Date() })
          .where(eq(analysis.id, analysisId));
      });

      // Send completion email (fire-and-forget)
      await step.run("send-analysis-complete-email", async () => {
        try {
          const analysisRecord = await db.select().from(analysis).where(eq(analysis.id, analysisId)).limit(1);
          if (analysisRecord.length > 0) {
            const userId = analysisRecord[0].userId;
            const userRecord = await db.select().from(user).where(eq(user.id, userId)).limit(1);
            if (userRecord.length > 0 && userRecord[0].email) {
              await sendAnalysisCompleteEmail(
                userRecord[0].email,
                userRecord[0].name,
                productName,
                analysisId
              );
            }
          }
        } catch (emailErr) {
          console.error('Failed to send analysis complete email (non-fatal):', emailErr);
          // Don't throw — email failure shouldn't fail the analysis
        }
      });

      return { success: true, analysisId };
    } catch (error) {
      // Refund credits and mark failed
      await step.run("refund-credit-on-failure", async () => {
        await db
          .update(user)
          .set({ credits: sql`${user.credits} + ${creditsPerAnalysis}` })
          .where(eq(user.id, event.data.userId));

        await db
          .update(analysis)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(analysis.id, analysisId));
      });

      throw error;
    }
  }
);
