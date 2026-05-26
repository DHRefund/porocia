import { Suspense } from "react";
import HeroSection from "@/components/sections/Hero";
import AnnouncementsBento from "@/components/sections/AnnouncementsBento";

import EditorialQuoteSection from "@/components/sections/EditorialQuoteSection";


export default function HomePage() {
    return (
        <>
            <HeroSection />
            <Suspense fallback={
                <section className="py-24 bg-background">
                    <div className="max-w-7xl mx-auto px-6 md:px-10">
                        {/* Skeleton Header matching the exact structure */}
                        <div className="flex items-end justify-between mb-12">
                            <div className="space-y-4">
                                <div className="h-[26px] w-32 rounded-full bg-cream animate-pulse" />
                                <div className="h-10 md:h-12 w-48 md:w-64 rounded-xl bg-cream animate-pulse" />
                            </div>
                            <div className="h-5 w-20 rounded bg-cream animate-pulse mb-2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-[600px] md:h-[700px]">
                            <div className="md:col-span-2 md:row-span-2 rounded-[32px] bg-cream animate-pulse" />
                            <div className="rounded-[32px] bg-cream animate-pulse" />
                            <div className="rounded-[32px] bg-cream animate-pulse" />
                        </div>
                    </div>
                </section>
            }>
                <AnnouncementsBento />
            </Suspense>
            <EditorialQuoteSection />
        </>
    );
}
