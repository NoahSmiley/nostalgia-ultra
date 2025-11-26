"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ReactNode } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "night" as const,
          variables: {
            colorPrimary: "#0ea5e9",
            colorBackground: "#09090b",
            colorText: "#fafafa",
            colorTextSecondary: "#a1a1aa",
            colorDanger: "#ef4444",
            fontFamily: "system-ui, sans-serif",
            borderRadius: "8px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
            },
            ".Input:focus": {
              border: "1px solid #0ea5e9",
              boxShadow: "0 0 0 1px #0ea5e9",
            },
            ".Label": {
              color: "#a1a1aa",
              fontSize: "14px",
              marginBottom: "8px",
            },
          },
        },
      }
    : undefined;

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
