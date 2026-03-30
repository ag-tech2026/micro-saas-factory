import type { ProcessedInput } from "./preprocess";
import type { CoreMessage } from "ai";

export function buildMessages(processed: ProcessedInput): CoreMessage[] {
  if (processed.imageUrls && processed.imageUrls.length > 0) {
    return [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze the attached image and produce a structured analysis according to the JSON schema.",
          },
          ...processed.imageUrls.map((url) => ({
            type: "image" as const,
            image: url,
          })),
        ],
      },
    ];
  }

  if (processed.text) {
    return [
      {
        role: "user",
        content: processed.text,
      },
    ];
  }

  throw new Error("buildMessages: no image URLs or text in ProcessedInput");
}
