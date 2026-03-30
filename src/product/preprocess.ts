import type { InputType } from "./config";

export interface ProductInput {
  type: InputType;
  url?: string;
  text?: string;
  formData?: Record<string, string>;
}

export interface ProcessedInput {
  text?: string;
  imageUrls?: string[];
  rawData?: unknown;
}

export async function preprocess(input: ProductInput): Promise<ProcessedInput> {
  switch (input.type) {
    case "file_image":
      // Direct pass-through — image URL is ready for vision model
      return { imageUrls: input.url ? [input.url] : [] };

    case "text":
    case "form":
      return { text: input.text ?? JSON.stringify(input.formData ?? {}) };

    // Other input types (file_pdf, file_csv, file_audio, url, multi_file)
    // are stubs — implement when building products that use them
    case "file_pdf":
    case "file_csv":
    case "file_audio":
    case "url":
    case "multi_file":
      throw new Error(`Input type "${input.type}" preprocessing not yet implemented for this product`);

    default:
      throw new Error(`Unknown input type: ${(input as ProductInput).type}`);
  }
}
