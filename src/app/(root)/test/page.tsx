import HeroSection from "@/components/sections/Hero";
import NewsCultureSection from "@/components/sections/NewsCultureSection";
import EditorialQuoteSection from "@/components/sections/EditorialQuoteSection";
import QuickLinksSection from "@/components/sections/QuickLinksSection";
import Footer from "@/components/sections/Footer";
export default function TestPage() {    
    return (
        <div>
            <HeroSection />
            <NewsCultureSection />
            <EditorialQuoteSection />
            <QuickLinksSection />
            <Footer />
        </div>
    );
}
