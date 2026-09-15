import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        outline: "border border-border bg-transparent hover:bg-surface",
        ghost: "hover:bg-surface text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-card text-card-foreground", className)}
      {...props}
    />
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
      <h2 className="label-xs">{children}</h2>
      {aside ? <div className="text-xs text-muted-foreground">{aside}</div> : null}
    </div>
  );
}

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em]",
  {
    variants: {
      tone: {
        neutral: "bg-surface text-muted-foreground border border-border",
        accent: "bg-accent/12 text-accent border border-accent/25",
        success: "bg-success/12 text-success border border-success/25",
        warning: "bg-warning/15 text-warning-foreground border border-warning/40",
        danger: "bg-destructive/12 text-destructive border border-destructive/25",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="label-xs">{label}</span>
      {children}
    </label>
  );
}

/** Explicit data-quality markers. Never render an invented value instead. */
export function DataFlag({
  kind,
  children,
}: {
  kind: "NO_DATA" | "UNKNOWN" | "ESTIMATED" | "AI_GENERATED" | "NOT_CONFIGURED";
  children?: ReactNode;
}) {
  const tone = kind === "ESTIMATED" || kind === "AI_GENERATED" ? "warning" : "neutral";
  return (
    <Badge tone={tone} className="font-mono">
      {children ?? kind.replace("_", " ")}
    </Badge>
  );
}
