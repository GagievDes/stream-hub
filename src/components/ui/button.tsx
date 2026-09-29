import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02] active:scale-[0.98]",
          variant === "secondary" &&
            "border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]",
          variant === "ghost" &&
            "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)]",
          size === "default" && "h-11 px-5 text-sm rounded-md",
          size === "lg" && "h-14 px-8 text-base rounded-md",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
