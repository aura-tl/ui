import type { Metadata } from "next";
import "./globals.css";
import { AuraWatermark } from "../components/aura-watermark";

export const metadata: Metadata = {
  title: "Built with Aura",
  description: "A real sports product powered by the Aura API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <AuraWatermark />
      </body>
    </html>
  );
}
