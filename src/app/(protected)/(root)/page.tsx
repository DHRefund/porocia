import { Suspense } from "react";
import HeroSection from "@/components/sections/Hero";
import AnnouncementsBento from "@/components/sections/AnnouncementsBento";
import NewsCultureSection from "@/components/sections/NewsCultureSection";
import EditorialQuoteSection from "@/components/sections/EditorialQuoteSection";
import QuickLinksSection from "@/components/sections/QuickLinksSection";
import Footer from "@/components/sections/Footer";

export default function HomePage() {    
    return (
        <>
            <HeroSection />
            <Suspense fallback={<div className="h-96 animate-pulse bg-cream rounded-[32px] mx-10 mb-24" />}>
                <AnnouncementsBento />
            </Suspense>
            {/* <NewsCultureSection /> */}
            <EditorialQuoteSection />
            {/* <QuickLinksSection /> */}
            {/* <Footer /> */}
        </>
    );
}
