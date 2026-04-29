import Link from "next/link";

interface QuickLinkCardProps {
  icon: string;
  label: string;
  href: string;
}

export default function QuickLinkCard({ icon, label, href }: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-6 md:p-8 bg-card border border-border rounded-xl hover:border-[var(--color-terracotta,#c96442)]/40 hover:shadow-lg transition-all group"
    >
      {/* Material Symbols icon — requires the font loaded in layout.tsx */}
      <span
        className="material-symbols-outlined text-4xl mb-4 group-hover:scale-110 transition-transform"
        style={{ color: "var(--color-terracotta, #c96442)" }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}