import QuickLinkCard from "@/components/shared/QuickLinkCard";

const QUICK_LINKS = [
  { icon: "schedule", label: "勤怠管理", href: "#" },
  { icon: "description", label: "経費精算", href: "#" },
  { icon: "groups", label: "Slack", href: "#" },
  { icon: "auto_stories", label: "社内ライブラリ", href: "#" },
  { icon: "apartment", label: "座席予約", href: "#" },
  { icon: "support_agent", label: "ITサポート", href: "#" },
] as const;

export default function QuickLinksSection() {
  return (
    <section className="max-w-screen-2xl mx-auto px-6 md:px-12 py-24">
      {/* <h2
        className="text-4xl md:text-5xl font-medium text-foreground mb-16 tracking-tight"
        style={{ fontFamily: "var(--font-serif-jp, 'Newsreader', serif)" }}
      >
        クイックリンク
      </h2> */}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {QUICK_LINKS.map((link) => (
          <QuickLinkCard
            key={link.label}
            icon={link.icon}
            label={link.label}
            href={link.href}
          />
        ))}
      </div>
    </section>
  );
}