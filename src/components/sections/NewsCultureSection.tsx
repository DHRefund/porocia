import NewsCard from "@/components/shared/NewsCard";
import CultureHighlight from "@/components/shared/CultureHighlight";

export default function NewsCultureSection() {
  return (
    <section className="max-w-screen-2xl mx-auto px-6 md:px-12 py-24">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-16">
        <h2
          className="text-4xl md:text-5xl font-medium tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-serif-jp, 'Newsreader', serif)" }}
        >
          最近のニュース &amp; 文化
        </h2>
        <a
          href="#"
          className="text-sm font-medium text-[var(--color-terracotta,#c96442)] border-b border-[var(--color-terracotta,#c96442)] pb-0.5 hover:opacity-70 transition-opacity whitespace-nowrap"
        >
          すべてを見る
        </a>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Large Culture Highlight — col-span-8 */}
        <div className="md:col-span-8">
          <CultureHighlight
            imageSrc="/images/CultureHighlights.png"
            imageAlt="POROCIA 夏のオフサイト：自然の中でのコラボレーション"
            tag="Culture Highlights"
            title="POROCIA 夏のオフサイト: 自然の中で見つけた新しい「笑い」"
            href="#"
          />
        </div>

        {/* Vertical News Column — col-span-4 */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <NewsCard
            category="News"
            date="2024.05.20"
            title='新しいデザインツール「Atelier Studio」が導入されました'
            description="全プロジェクトの効率を30%向上させるための新兵器。マニュアルをチェック！"
            href="#"
          />
          <NewsCard
            category="Event"
            date="2024.05.25"
            title='月例「笑い」のプレゼン大会。今月のテーマは「失敗談」'
            description="最高の失敗を共有して、みんなでレベルアップ。豪華賞品あり。"
            href="#"
          />
        </div>
      </div>
    </section>
  );
}