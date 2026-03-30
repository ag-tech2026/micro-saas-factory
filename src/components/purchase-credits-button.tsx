"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { productConfig } from "@/product/config";

interface PurchaseCreditsButtonProps {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function PurchaseCreditsButton({
  variant = "default",
  size = "default",
  className,
  children = `Buy ${productConfig.credits.packSize} Credits — ${productConfig.credits.packPrice}`,
}: PurchaseCreditsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/polar/checkout", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned:", data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCheckout}
      disabled={isLoading}
    >
      {isLoading ? "Redirecting..." : children}
    </Button>
  );
}
