import Image from "next/image";
import HeroText from "./HeroText";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[--color-parchment]">
      {/* 
        THAY ĐỔI DUY NHẤT Ở KHUNG CHA:
        1. Đổi 'items-center' thành 'items-start' để neo nội dung lên phía trên thay vì nằm giữa màn hình.
        2. Thêm 'pt-16 md:pt-24' để tạo khoảng cách từ trên xuống (bạn có thể chỉnh số này: pt-12, pt-20, pt-28... tùy ý).
        3. Giữ nguyên 'justify-center' và 'max-w-screen-2xl mx-auto' để căn giữa 2 bên y hệt như cũ.
      */}
      <div className="relative z-10 md:h-dvh h-[80vh] flex xl:items-start items-start justify-center max-w-screen-2xl mx-auto pt-16 md:pt-24">

        {/* LEFT: Hero Content - GIỮ NGUYÊN 100% CLASS CŨ CỦA BẠN */}
        <header className="flex flex-col justify-center md:w-full w-screen md:px-20 px-5 relative z-10">
          <HeroText />
        </header>

        {/* RIGHT: Image - GIỮ NGUYÊN */}
        <figure>
          <div className="xl:w-[50%] w-full h-full absolute top-0 right-0 z-20 pointer-events-none flex items-center justify-center xl:justify-end px-5 md:px-20 xl:pr-24">
            <div className="relative aspect-[4/5] w-[70vw] md:w-[40vw] xl:w-[30vw] max-w-[420px] pointer-events-auto overflow-hidden rounded-xl shadow-2xl transition-transform duration-500 ease-out md:rotate-2 hover:rotate-0 group">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image
                  src="/images/home-hero.png"
                  alt="No Laugh No Work"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
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