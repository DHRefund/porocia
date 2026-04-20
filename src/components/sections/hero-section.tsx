import Link from "next/link";

export function HeroSection() {
  return (
    <main className="relative overflow-hidden bg-[--color-parchment]">
      {/* Decorative sketch SVG — góc phải */}
      <div className="pointer-events-none absolute right-[-40px] top-[40px] select-none opacity-[0.13] md:right-[60px] md:top-[60px] md:opacity-[0.18]">
        <svg
          width="340"
          height="420"
          viewBox="0 0 340 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#c96442"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Phác thảo bóng bay / đầu người trừu tượng */}
          <ellipse cx="200" cy="180" rx="110" ry="130" />
          <path d="M170 315 Q190 360 200 400" />
          <path d="M160 200 Q130 240 110 220" />
          <path d="M240 190 Q270 230 255 215" />
          <ellipse cx="175" cy="165" rx="12" ry="14" />
          <ellipse cx="225" cy="165" rx="12" ry="14" />
          <path d="M175 210 Q200 235 225 210" />
          {/* Nét phụ trang trí */}
          <path d="M80 350 Q120 330 150 350 Q180 370 220 350" />
          <path d="M60 380 Q110 360 160 380" />
          <circle cx="200" cy="50" r="18" />
          <path d="M200 68 L200 110" />
        </svg>
      </div>

      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center lg:px-10">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[--color-border-cream] bg-[--color-ivory] px-4 py-2 shadow-sm">
          <span className="text-[--color-terracotta]">✦</span>
          <span className="text-[13px] font-medium tracking-wide text-[--color-olive-gray]">
            不必要なものを省いた、集中するチームのためのワークスペース
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-heading max-w-3xl text-[clamp(3rem,8vw,6rem)] leading-[1.02] tracking-[-0.04em] text-[--color-near-black]">
          No Laugh
          <br />
          <em className="font-heading italic text-[#da7756]">
            No Work.
          </em>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 max-w-xl text-[1.1rem] leading-[1.75] text-[--color-olive-gray]">
          仕事は真剣に。でも、人はそうじゃなくていい。
  <br />
  本当に一緒にいることを楽しめるチームから、
  <br />
  最高のアイデアが生まれると私たちは信じています。
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/chat"
            className="inline-flex h-13 items-center justify-center rounded-2xl bg-[--color-terracotta] px-8 py-3.5 text-[15px] font-semibold text-[--color-ivory] shadow-[0_4px_20px_rgba(201,100,66,0.28)] transition-all hover:bg-[#bf5d3c] hover:shadow-[0_6px_24px_rgba(201,100,66,0.36)] active:scale-[0.98]"
          >
            ワークスペースへ
          </Link>

          <Link
            href="/about"
            className="group relative inline-flex h-13 items-center gap-2 px-6 py-3.5 text-[15px] font-medium text-[--color-dark-warm] transition-colors hover:text-[--color-near-black]"
          >
            詳しく見る
            <span className="absolute bottom-2.5 left-6 right-6 h-px origin-left scale-x-100 bg-[--color-dark-warm] transition-transform group-hover:bg-[--color-terracotta]" />
          </Link>
        </div>

        {/* Social proof nhẹ */}
        {/* <div className="mt-16 flex items-center gap-6">
          <div className="flex -space-x-2.5">
            {["NT", "MH", "LK", "TR"].map((initials) => (
              <div
                key={initials}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[--color-parchment] bg-[#2a2a27] text-[11px] font-bold text-[--color-ivory]"
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-[13px] text-[--color-stone-gray]">
            Đang được sử dụng bởi{" "}
            <span className="font-semibold text-[--color-dark-warm]">nhóm của chúng tôi</span>
          </p>
        </div> */}
      </section>
    </main>
  );
}
