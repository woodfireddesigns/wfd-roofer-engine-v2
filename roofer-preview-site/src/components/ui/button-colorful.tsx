import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface ButtonColorfulProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    variant?: "primary" | "outline";
}

export function ButtonColorful({
    className,
    label = "Explore Components",
    variant = "primary",
    ...props
}: ButtonColorfulProps) {
    if (variant === "outline") {
        return (
            <Button
                className={cn(
                    "relative h-14 px-10 overflow-hidden rounded-full font-black text-xs uppercase tracking-widest",
                    "bg-transparent border-2 border-[var(--brand-accent)] text-white",
                    "transition-all duration-300",
                    "hover:shadow-[0_0_20px_var(--brand-accent)] hover:bg-[var(--brand-accent)] hover:text-[var(--brand-dark)]",
                    "group",
                    className
                )}
                {...props}
            >
                <div className="relative flex items-center justify-center gap-2 z-10 font-black">
                    <span>{label}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
            </Button>
        );
    }

    return (
        <Button
            className={cn(
                "relative h-14 px-10 overflow-hidden rounded-full font-black text-xs uppercase tracking-widest",
                "bg-[var(--brand-accent)] text-[var(--brand-dark)] shadow-lg",
                "transition-all duration-300",
                "hover:scale-105 hover:shadow-[0_0_30px_var(--brand-accent)]",
                "group",
                className
            )}
            style={{ 
                boxShadow: '0 0 0 0 rgba(0,0,0,0)',
            }}
            {...props}
        >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-0 group-hover:opacity-20 pointer-events-none" />

            <div className="relative flex items-center justify-center gap-2 z-10 font-bold">
                <span>{label}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
        </Button>
    );
}
