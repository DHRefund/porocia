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
            <AnnouncementsBento />
            {/* <NewsCultureSection /> */}
            <EditorialQuoteSection />
            <QuickLinksSection />
            <Footer />
        </>
    );
}
