import { Badge } from "@/components/ui";
import { AlertTriangle, Radio, ShieldAlert, DollarSign, Sparkles } from "lucide-react";

type SignalType =
  | "RESTOCK"
  | "QUEUE_DETECTED"
  | "SECURITY_ESCALATED"
  | "PRICE_CHANGE"
  | "NEW_LISTING";

interface SignalBadgeProps {
  type: SignalType;
  className?: string;
}

const signalConfig: Record<
  SignalType,
  {
    label: string;
    variant: "warning" | "danger" | "success" | "info" | "primary";
    icon: typeof AlertTriangle;
    pulse: boolean;
  }
> = {
  QUEUE_DETECTED: {
    label: "Queue Active",
    variant: "warning",
    icon: Radio,
    pulse: true,
  },
  SECURITY_ESCALATED: {
    label: "Security Alert",
    variant: "danger",
    icon: ShieldAlert,
    pulse: true,
  },
  RESTOCK: {
    label: "Restocked",
    variant: "success",
    icon: Sparkles,
    pulse: false,
  },
  PRICE_CHANGE: {
    label: "Price Changed",
    variant: "info",
    icon: DollarSign,
    pulse: false,
  },
  NEW_LISTING: {
    label: "New Listing",
    variant: "primary",
    icon: Sparkles,
    pulse: false,
  },
};

export function SignalBadge({ type, className }: SignalBadgeProps) {
  const config = signalConfig[type];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      size="sm"
      pulse={config.pulse}
      className={className}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
