"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StripeProvider } from "@/components/stripe-provider";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  CreditCard,
  Loader2,
  Trash2,
  Check,
  Download,
  AlertTriangle,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

type Invoice = {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  date: number;
  pdfUrl: string | null;
  hostedUrl: string | null;
};

type BillingData = {
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  stripeSubId: string | null;
};

type BillingManagementProps = {
  onClose: () => void;
  onSubscriptionCancelled?: () => void;
};

function AddPaymentMethodForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Failed to submit");
        setLoading(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/subscription?billing=true`,
        },
      });

      if (confirmError) {
        setError(confirmError.message || "Failed to save card");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !stripe} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Card"
          )}
        </Button>
      </div>
    </form>
  );
}

export function BillingManagement({
  onClose,
  onSubscriptionCancelled,
}: BillingManagementProps) {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [setupClientSecret, setSetupClientSecret] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    try {
      const res = await fetch("/api/stripe/billing");
      if (res.ok) {
        const data = await res.json();
        setBilling(data);
      }
    } catch (err) {
      setError("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    setActionLoading("add-card");
    try {
      const res = await fetch("/api/stripe/update-payment-method", {
        method: "POST",
      });
      const data = await res.json();
      if (data.clientSecret) {
        setSetupClientSecret(data.clientSecret);
        setShowAddCard(true);
      } else {
        setError(data.error || "Failed to start card setup");
      }
    } catch (err) {
      setError("Failed to start card setup");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    setActionLoading(`default-${paymentMethodId}`);
    try {
      const res = await fetch("/api/stripe/update-payment-method", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId }),
      });
      if (res.ok) {
        await fetchBilling();
      } else {
        setError("Failed to set default payment method");
      }
    } catch (err) {
      setError("Failed to set default payment method");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveCard = async (paymentMethodId: string) => {
    setActionLoading(`remove-${paymentMethodId}`);
    try {
      const res = await fetch(
        `/api/stripe/update-payment-method?id=${paymentMethodId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        await fetchBilling();
      } else {
        setError("Failed to remove payment method");
      }
    } catch (err) {
      setError("Failed to remove payment method");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading("cancel");
    try {
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immediate: false }),
      });
      if (res.ok) {
        setShowCancelConfirm(false);
        // Let the parent handle closing and refreshing
        onSubscriptionCancelled?.();
      } else {
        setError("Failed to cancel subscription");
      }
    } catch (err) {
      setError("Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const formatCardBrand = (brand: string) => {
    const brands: Record<string, string> = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
    };
    return brands[brand] || brand;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-40 bg-muted rounded animate-pulse" />
          <div className="h-9 w-9 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Payment Methods skeleton */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-36 bg-muted rounded animate-pulse" />
            <div className="h-9 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                  <div>
                    <div className="h-5 w-32 bg-muted rounded animate-pulse mb-1" />
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Billing History skeleton */}
        <div>
          <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                <div>
                  <div className="h-5 w-24 bg-muted rounded animate-pulse mb-1" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Cancel section skeleton */}
        <div>
          <div className="h-6 w-40 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mb-4" />
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Cancel Confirmation View
  if (showCancelConfirm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-yellow-500">
          <AlertTriangle className="h-8 w-8" />
          <h2 className="text-xl font-semibold">Cancel Subscription</h2>
        </div>
        <p className="text-muted-foreground">
          Are you sure you want to cancel your subscription? You&apos;ll
          continue to have access until the end of your current billing period.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCancelConfirm(false)}
            className="flex-1"
          >
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelSubscription}
            disabled={actionLoading === "cancel"}
            className="flex-1"
          >
            {actionLoading === "cancel" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...
              </>
            ) : (
              "Yes, Cancel"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Add Card View
  if (showAddCard && setupClientSecret) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setShowAddCard(false);
            setSetupClientSecret(null);
          }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to billing
        </button>
        <h2 className="text-xl font-semibold text-foreground">
          Add Payment Method
        </h2>
        <StripeProvider clientSecret={setupClientSecret}>
          <AddPaymentMethodForm
            onSuccess={() => {
              setShowAddCard(false);
              setSetupClientSecret(null);
              fetchBilling();
            }}
            onCancel={() => {
              setShowAddCard(false);
              setSetupClientSecret(null);
            }}
          />
        </StripeProvider>
      </div>
    );
  }

  // Main Billing View
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Billing & Payment
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Payment Methods */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Payment Methods
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCard}
            disabled={actionLoading === "add-card"}
          >
            {actionLoading === "add-card" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" /> Add Card
              </>
            )}
          </Button>
        </div>

        {billing?.paymentMethods.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No payment methods on file.
          </p>
        ) : (
          <div className="space-y-3">
            {billing?.paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-foreground font-medium">
                      {formatCardBrand(pm.brand)} •••• {pm.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {pm.expMonth}/{pm.expYear}
                    </p>
                  </div>
                  {pm.isDefault && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!pm.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(pm.id)}
                      disabled={actionLoading === `default-${pm.id}`}
                    >
                      {actionLoading === `default-${pm.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Set Default
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCard(pm.id)}
                    disabled={
                      actionLoading === `remove-${pm.id}` ||
                      (pm.isDefault && billing.paymentMethods.length === 1)
                    }
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    {actionLoading === `remove-${pm.id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Billing History */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">
          Billing History
        </h3>

        {billing?.invoices.length === 0 ? (
          <p className="text-muted-foreground text-sm">No invoices yet.</p>
        ) : (
          <div className="space-y-2">
            {billing?.invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
              >
                <div>
                  <p className="text-foreground font-medium">
                    ${inv.amount.toFixed(2)} {inv.currency.toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(inv.date).toLocaleDateString()} ·{" "}
                    <span
                      className={
                        inv.status === "paid"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }
                    >
                      {inv.status}
                    </span>
                  </p>
                </div>
                {inv.pdfUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={inv.pdfUrl} target="_blank" rel="noopener">
                      <Download className="h-4 w-4 mr-1" /> PDF
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Cancel Subscription */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Cancel Subscription
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          Cancel your subscription. You&apos;ll keep access until the end of
          your billing period.
        </p>
        <Button
          variant="outline"
          onClick={() => setShowCancelConfirm(true)}
          className="text-red-400 border-red-500/30 hover:bg-red-500/10"
        >
          Cancel Subscription
        </Button>
      </div>
    </div>
  );
}
