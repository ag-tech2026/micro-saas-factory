"use client";

import { FileUpload } from "@/components/upload/file-upload";

interface ProductInputProps {
  credits: number;
  onUploadComplete: (data: { analysisId: string; inputUrl: string; credits: number }) => void;
}

export function ProductInput({ credits, onUploadComplete }: ProductInputProps) {
  return (
    <FileUpload
      credits={credits}
      onUploadComplete={onUploadComplete}
    />
  );
}
