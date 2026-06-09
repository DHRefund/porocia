import Image from "next/image";
import HeroText from "./HeroText";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[--color-parchment]">
      {/* 
        Outer wrapper:
        - Mobile/Tablet: Stack vertically (flex-col), height auto (h-auto), elements centered.
        - Desktop (xl+): Row layout (xl:flex-row), height 100vh (xl:h-dvh), alignment top-start.
      */}
      <div className="relative z-10 flex flex-col xl:flex-row items-center xl:items-start justify-center max-w-screen-2xl mx-auto pt-24 md:pt-32 xl:pt-24 pb-16 xl:pb-0 xl:h-dvh gap-12 xl:gap-0">

        {/* LEFT: Hero Content */}
        <header className="w-full xl:w-full md:px-20 px-5 flex flex-col justify-center relative z-10">
          <HeroText />
        </header>

        {/* RIGHT: Image */}
        <figure className="w-full xl:w-auto m-0 flex items-center justify-center">
          <div className="relative xl:absolute xl:top-0 xl:right-0 xl:w-[50%] xl:h-full w-full z-20 pointer-events-none flex items-center justify-center xl:justify-end px-5 md:px-20 xl:pr-24">
            <div className="relative aspect-[4/5] w-[70vw] md:w-[40vw] xl:w-[30vw] max-w-[420px] pointer-events-auto overflow-hidden rounded-xl shadow-2xl transition-transform duration-500 ease-out md:rotate-2 hover:rotate-0 group">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image
                  src="/images/home-hero.png"
                  alt="No Laugh No Work"
                  fill
                  priority
                  sizes="(max-width: 768px) 70vw, (max-width: 1280px) 40vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </figure>

      </div>
    </section>
  );
};

export default HeroSection;