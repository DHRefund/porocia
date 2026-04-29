export default function EditorialQuoteSection() {
  return (
    <section className="py-24 border-y border-border bg-card">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div
          className="py-4 pl-10 md:pl-12"
          style={{
            borderLeft: "4px solid var(--color-terracotta, #c96442)",
          }}
        >
          <blockquote
            className="text-2xl md:text-4xl italic text-foreground leading-tight"
            style={{ fontFamily: "var(--font-serif-jp, 'Newsreader', serif)" }}
          >
            「私たちは、ただのソフトウェアを作っているのではありません。人々の創造性を解き放つための『余白』をデザインしているのです。」
          </blockquote>
          <cite className="block mt-6 text-sm text-muted-foreground not-italic font-medium">
            — POROCIA 創業者メッセージ
          </cite>
        </div>
      </div>
    </section>
  );
}