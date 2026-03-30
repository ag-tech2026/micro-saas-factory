export type InputType =
  | "file_image"
  | "file_pdf"
  | "file_csv"
  | "file_audio"
  | "text"
  | "form"
  | "url"
  | "multi_file";

export type AnalysisTone = "friendly_coach" | "professional" | "clinical";

export const productConfig = {
  name: "Poker AI Review",
  tagline: "Upload a hand screenshot. Get instant GTO analysis.",
  targetUser: "poker players of all skill levels",
  logoEmoji: "♠",
  primaryColor: "#6d28d9",
  nav: {
    actionLabel: "Analyze Hand",
  },

  input: {
    type: "file_image" as InputType,
    accept: "image/jpeg,image/png",
    label: "Upload your poker screenshot",
    exampleInputDescription: "a Rush & Cash hand showing a preflop raise and call with JJ",
  },

  credits: {
    freeCredits: 3,
    creditsPerAnalysis: 1,
    packSize: 50,
    packPrice: "$9",
    // polarProductId comes from process.env.POLAR_PRODUCT_ID
  },

  analysis: {
    tone: "friendly_coach" as AnalysisTone,
    whatItAnalyzes: "poker hand screenshots for GTO-based strategic analysis",
  },
};
