import { cn } from "@/lib/utils";

interface AQIBadgeProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const getAQILevel = (value: number) => {
  if (value <= 50) return { label: "Good", className: "aqi-good" };
  if (value <= 100) return { label: "Moderate", className: "aqi-moderate" };
  if (value <= 150) return { label: "Unhealthy", className: "aqi-unhealthy" };
  return { label: "Hazardous", className: "aqi-hazardous" };
};

const sizeClasses = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-lg px-4 py-2 font-semibold",
};

export function AQIBadge({ value, size = "md", showLabel = true }: AQIBadgeProps) {
  const { label, className } = getAQILevel(value);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        className,
        sizeClasses[size]
      )}
    >
      <span>{value} AQI</span>
      {showLabel && <span className="opacity-80">• {label}</span>}
    </span>
  );
}
