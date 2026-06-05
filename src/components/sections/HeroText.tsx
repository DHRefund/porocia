'use client'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

const words = [
    { text: "アイデア", imgPath: "/images/ideas.svg" },
    { text: "コンセプト", imgPath: "/images/concepts.svg" },
    { text: "デザイン", imgPath: "/images/designs.svg" },
    { text: "コード", imgPath: "/images/code.svg" },
    { text: "アイデア", imgPath: "/images/ideas.svg" },
    { text: "コンセプト", imgPath: "/images/concepts.svg" },
    { text: "デザイン", imgPath: "/images/designs.svg" },
    { text: "コード", imgPath: "/images/code.svg" },
];

export default function HeroText() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        tl.fromTo(
            ".hero-text h1",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.15, duration: 1, ease: "power3.out" }
        )
            .from(".hero-badge", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.6")
            .from(".hero-desc", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
            .from(".hero-buttons", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4");

    }, { scope: containerRef });

    return (
        <>
            

            <div ref={containerRef} className="space-y-8">
                {/* Badge */}
                <span className="hero-badge inline-block rounded-full border border-[--color-border-cream] bg-[--color-ivory] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[--color-olive-gray] shadow-sm">
                    ✦ Internal Portal
                </span>

                {/* Main heading */}
                <div className="hero-text">
                    <h1 className="flex flex-wrap items-center gap-1 text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-[-0.04em] text-[--color-near-black]">
                        <span className="slide">
                            <span className="wrapper">
                                {words.map((word, index) => (
                                    <span key={index} className="flex h-[1.2em] items-center md:gap-3 gap-1">
                                        <img
                                            src={word.imgPath}
                                            alt="icon"
                                            className="xl:size-10 md:size-8 size-6 md:p-1.5 p-1 rounded-full bg-[--color-ivory] border border-[--color-border-cream] shadow-sm flex-shrink-0"
                                        />
                                        <span className="whitespace-nowrap font-semibold">{word.text}</span>
                                    </span>
                                ))}
                            </span>
                        </span>
                        <span className="text-[--color-terracotta] static-wo">を</span>
                    </h1>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-[-0.04em] text-[--color-near-black]">
                        <span className="inline-block">実際の</span><span className="inline-block">プロジェクトへ</span>
                    </h1>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-[-0.04em] text-[--color-near-black]">
                        <span className="inline-block">成果として</span><span className="inline-block">具現化する</span>
                    </h1>
                </div>

                {/* Description */}
                <p className="hero-desc max-w-md font-serif-jp text-xl leading-relaxed text-[--color-olive-gray]">
                    創造性は、遊び心から生まれる。
                    POROCIAの「クリエイティブ・スタジオ」へようこそ。ここでは、仕事の熱量と笑顔が共存しています。
                </p>

                {/* Buttons */}
                <div className="hero-buttons flex flex-wrap gap-4">
                    <a href="/tasks" className="cta-btn">
                        <div className="btn-blob" />
                        <span className="btn-label">本日のタスクを開始</span>
                        <div className="btn-arrow">
                            <img src="/images/arrow-right.svg" alt="arrow" />
                        </div>
                    </a>

                    <a href="/knowledge" className="cta-btn cta-btn-sm">
                        <div className="btn-blob" />
                        <span className="btn-label">社内Wikiを閲覧</span>
                        <div className="btn-arrow">
                            <img src="/images/arrow-right.svg" alt="arrow" />
                        </div>
                    </a>
                </div>
            </div>
        </>
    )
}