import type { Metadata } from "next";
import { HelpContent } from "./HelpContent";

export const metadata: Metadata = {
  title: "ヘルプセンター | Porocia",
  description: "Porociaの使い方ガイドと各機能の説明",
};

export default function HelpPage() {
  return <HelpContent />;
}
