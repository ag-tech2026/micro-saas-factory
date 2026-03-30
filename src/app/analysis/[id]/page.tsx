"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { AnalysisResults } from "@/product/components/results";

type AnalysisData = {
  id: string;
  status: string;
  result: string | null;
  inputUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

function getStatusBadge(status: string): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  switch (status) {
    case "complete":
      return { label: "Complete", variant: "default" };
    case "failed":
      return { label: "Failed", variant: "destructive" };
    case "processing":
      return { label: "Processing", variant: "secondary" };
    case "pending":
    case "uploaded":
      return { label: "Pending", variant: "outline" };
    default:
      return { label: status, variant: "outline" };
  }
}

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch(`/api/analyses/${id}`);
        if (res.status === 404) {
          setError("Analysis not found");
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          return;
        }
        const json = await res.json();
        setData(json);
        setLoading(false);
        if (json.status === "complete" || json.status === "failed") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch {
        setLoading(false);
      }
    }

    fetchAnalysis();
    pollRef.current = setInterval(fetchAnalysis, 3000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [id]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-semibold mb-2">Analysis not found</h1>
            <p className="text-muted-foreground mb-6">
              This analysis does not exist or you do not have access to it.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const badge = getStatusBadge(data.status);
  const formattedDate = new Date(data.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Pending / uploaded / processing state
  if (data.status === "pending" || data.status === "uploaded" || data.status === "processing") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant={badge.variant}>{badge.label}</Badge>
              <span className="text-base text-muted-foreground">{formattedDate}</span>
            </div>

            <div className="flex flex-col items-center py-10 gap-4">
              <Spinner size="lg" />
              <p className="text-lg font-medium text-foreground">
                {data.status === "processing"
                  ? "Analyzing your hand..."
                  : "Waiting to start..."}
              </p>
              <p className="text-base text-muted-foreground">
                This usually takes about 15-30 seconds. The page will update automatically.
              </p>
            </div>

            {data.inputUrl && (
              <div className="mt-6 border-t pt-6">
                <p className="text-base font-medium text-muted-foreground mb-3">Uploaded Screenshot</p>
                <img
                  src={data.inputUrl}
                  alt="Uploaded poker screenshot"
                  className="max-w-sm rounded-lg border"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Failed state
  if (data.status === "failed") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <CardTitle className="text-red-600 dark:text-red-400">Analysis Failed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              We could not analyze this hand. Your credit has been refunded.
            </p>
            <Button asChild>
              <Link href="/upload">Try Another Hand</Link>
            </Button>

            {data.inputUrl && (
              <div className="mt-8 border-t pt-6">
                <p className="text-base font-medium text-muted-foreground mb-3">Uploaded Screenshot</p>
                <img
                  src={data.inputUrl}
                  alt="Uploaded poker screenshot"
                  className="max-w-sm rounded-lg border"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Complete state — render via product results component
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <AnalysisResults
        data={{
          result: data.result!,
          inputUrl: data.inputUrl,
          createdAt: data.createdAt,
        }}
      />
    </div>
  );
}
