import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utilities/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-sm hover:opacity-90 active:scale-[0.98]",
        primary:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/20 hover:bg-destructive/25 active:scale-[0.98]",
        outline:
          "border border-border/80 bg-background/50 hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary/60 text-secondary-foreground hover:bg-secondary active:scale-[0.98]",
        ghost: "hover:bg-accent/60 hover:text-accent-foreground text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cad: "border border-border/60 bg-card/60 hover:bg-accent/80 hover:text-foreground text-muted-foreground shadow-none font-mono text-[11px] backdrop-blur-sm active:scale-[0.97]",
        activeCad: "border border-primary/50 bg-primary/10 text-primary font-mono text-[11px] font-medium shadow-[0_0_12px_rgba(59,130,246,0.18)] active:scale-[0.97]",
        pill: "rounded-full border border-border/70 bg-card/70 hover:bg-accent text-foreground text-xs shadow-sm backdrop-blur-md active:scale-[0.97]",
      },
      size: {
        default: "h-8 px-3.5 py-1.5",
        sm: "h-7 rounded-md px-2.5 text-[11px]",
        lg: "h-10 rounded-xl px-5 text-sm",
        icon: "h-8 w-8",
        cadIcon: "h-7 w-7 p-1 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
