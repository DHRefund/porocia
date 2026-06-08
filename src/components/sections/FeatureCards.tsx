"use client";

import Image from "next/image";
import { abilities } from "@/app/constants";

const FeatureCards = () => {
    return (
        <section className="w-full py-20 md:py-32 bg-[--color-parchment]">
            <div className="max-w-screen-2xl mx-auto px-5 md:px-20">

                {/* Section title */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading text-[--color-near-black] tracking-tight">
                        私たちの強み
                    </h2>
                    <p className="mt-4 text-[--color-olive] text-lg max-w-2xl mx-auto font-serif-jp">
                        クライアントの成功を支える、POROCIAの3つの約束。
                    </p>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {abilities.map(({ imgPath, title, desc }) => (
                        <div
                            key={title}
                            className="group relative
                bg-[--color-card] border border-[--color-border-cream] rounded-2xl p-8
                flex flex-col gap-5 transition-all duration-300
                hover:-translate-y-1 hover:shadow-xl hover:border-[--color-terracotta]/40
                hover:bg-[--color-ivory]"
                        >
                            {/* Icon container */}
                            <div className="size-14 flex items-center justify-center
                rounded-xl bg-[--color-warm-sand] group-hover:bg-[--color-terracotta]/20
                transition-colors duration-300">
                                <Image
                                    src={imgPath}
                                    alt={title}
                                    width={32}
                                    height={32}
                                    className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl md:text-2xl font-semibold text-[--color-near-black] font-heading">
                                {title}
                            </h3>

                            {/* Description */}
                            <p className="text-[--color-olive] text-base md:text-lg leading-relaxed font-serif-jp">
                                {desc}
                            </p>

                            {/* Decorative accent (top‑right terracotta glow on hover) */}
                            <div className="absolute top-0 right-0 w-24 h-24
                bg-gradient-to-bl from-[--color-terracotta]/5 to-transparent
                rounded-bl-full rounded-tr-2xl opacity-0 group-hover:opacity-100
                transition-opacity duration-500 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureCards;
