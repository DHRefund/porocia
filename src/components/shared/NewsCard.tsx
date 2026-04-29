import Link from "next/link";

interface NewsCardProps {
  category: string;
  date: string;
  title: string;
  description: string;
  href: string;
}

export default function NewsCard({
  category,
  date,
  title,
  description,
  href,
}: NewsCardProps) {
  return (
    <Link
      href={href}
      className="block p-8 bg-[var(--color-parchment,#f5f4ed)] rounded-xl border border-border hover:bg-[var(--color-warm-sand,#e8e6dc)] transition-colors group"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest mb-2 block text-muted-foreground">
        {category} — {date}
      </span>
      <h4
        className="text-xl md:text-2xl mb-4 font-medium text-foreground leading-snug group-hover:text-[var(--color-terracotta,#c96442)] transition-colors"
        style={{ fontFamily: "var(--font-serif-jp, 'Newsreader', serif)" }}
      >
        {title}
      </h4>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </Link>
  );
}