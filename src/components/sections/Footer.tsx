import Link from "next/link";

const FOOTER_LINKS = [
  { label: "利用規約", href: "#" },
  { label: "プライバシーポリシー", href: "#" },
  { label: "ヘルプ", href: "#" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card w-full py-12 mt-24">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col items-center space-y-6">
        {/* Logo */}
        <span
          className="italic text-lg"
          style={{
            fontFamily: "var(--font-serif-jp, 'Newsreader', serif)",
            color: "var(--color-terracotta, #c96442)",
          }}
        >
          POROCIA
        </span>

        {/* Nav links */}
        <div className="flex gap-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="underline underline-offset-4 opacity-80 hover:opacity-100 hover:text-[var(--color-terracotta,#c96442)] transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          © {new Date().getFullYear()} POROCIA — 精巧に作られた仕事空間。
        </p>
      </div>
    </footer>
  );
}