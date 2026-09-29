import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 text-base text-[var(--fg)] placeholder:text-[var(--muted)] transition-colors duration-200 focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)]",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
