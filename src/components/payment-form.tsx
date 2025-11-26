"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Lock } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  tier: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({ amount, tier, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/subscription?success=true`,
      },
    });

    if (submitError) {
      setError(submitError.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
    // If successful, the page will redirect
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="rounded-xl border border-border bg-card/50 p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            {tier === "member" ? "Standard" : "Ultra"} membership
          </span>
          <span className="text-foreground font-semibold">${amount}/mo</span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="w-full h-12 rounded-full"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Subscribe ${amount}/mo
            </>
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={processing}
            className="w-full"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Security Note */}
      <p className="text-xs text-muted-foreground text-center">
        Secured by Stripe. Your payment info is encrypted and never stored on our servers.
      </p>
    </form>
  );
}
