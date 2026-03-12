import { cn } from "@/lib/utils";

const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <div className="flex items-center gap-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-8 h-8 text-primary", className)}
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M16 16c-1.5 0-2.81-1.23-3-2.73" />
      <path d="M16 8c-1.5 0-2.81 1.23-3 2.73" />
      <path d="M8 8c1.5 0 2.81 1.23 3 2.73" />
      <path d="M8 16c1.5 0 2.81-1.23 3-2.73" />
    </svg>
    <span className="font-headline text-2xl font-bold tracking-wide text-foreground">
      Delfin Law
    </span>
  </div>
);

export default Logo;
