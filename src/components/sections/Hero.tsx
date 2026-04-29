import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-[700px] items-center justify-center overflow-hidden bg-[--color-parchment]">
      <div className="relative z-10 mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-16 px-12 md:grid-cols-2">

        {/* Text */}
        <div className="space-y-8">
          <span className="inline-block rounded-full border border-[--color-border-cream] bg-[--color-ivory] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[--color-olive-gray] shadow-sm">
            ✦ Internal Portal
          </span>

          <h1 className=" text-7xl leading-[0.9] tracking-[-0.04em] text-[--color-near-black] md:text-8xl">
            No Laugh<br />No Work
          </h1>

          <p className="max-w-md font-serif-jp text-xl leading-relaxed text-[--color-olive-gray]">
            創造性は、遊び心から生まれる。POROCIAの「デジタル・アトリエ」へようこそ。ここでは、仕事と笑いが共存しています。
          </p>

          <div className="flex gap-4">
            <button className="inline-flex items-center justify-center rounded-2xl bg-[--color-terracotta] px-8 py-4 font-bold text-[--color-ivory] shadow-[0_4px_20px_rgba(201,100,66,0.28)] transition-all hover:bg-[#bf5d3c] hover:shadow-[0_6px_24px_rgba(201,100,66,0.36)] active:scale-[0.98]">
              本日のタスクを開始
            </button>
            <button className="inline-flex items-center justify-center rounded-2xl border border-[--color-border-cream] px-8 py-4 font-medium text-[--color-dark-warm] transition-colors hover:bg-[--color-ivory] hover:text-[--color-near-black] active:scale-[0.98]">
              社内Wikiを閲覧
            </button>
          </div>
        </div>

        {/* Image */}
<div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-2xl transition-transform duration-500 ease-out md:rotate-2 hover:rotate-0 group">
  <div className="relative h-full w-full overflow-hidden rounded-xl">
    <Image
      src="/images/home-hero.png"
      alt="No Laugh No Work"
      fill
      sizes="(max-width: 768px) 100vw, 40vw"
      className="object-cover transition-transform duration-700 group-hover:scale-105"
    />
  </div>
</div>

      </div>
    </section>
  );
};

export default HeroSection;