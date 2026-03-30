import { headers } from "next/headers";
import { Polar } from "@polar-sh/sdk";
import { auth } from "@/lib/auth";
import { productConfig } from "@/product/config";

const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN! });

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkout = await polar.checkouts.create({
    products: [process.env.POLAR_PRODUCT_ID!],
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=success`,
    metadata: {
      userId: session.user.id,
      packSize: String(productConfig.credits.packSize),
    },
    customerEmail: session.user.email,
  });

  return Response.json({ url: checkout.url }, { status: 200 });
}
