import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Apophis Orbital Simulator | apophis.bot",
    description:
        "Interactive 3D orbital mechanics simulator for asteroid 99942 Apophis. Explore near-Earth asteroid dynamics, gravitational perturbations, and the 2029 close approach.",
    keywords: ["Apophis", "asteroid", "orbital mechanics", "99942 Apophis", "near-Earth asteroid", "NEO", "orbital simulator", "space", "astronomy"],
    authors: [{ name: "Wil Neeley" }],
    openGraph: {
        title: "Apophis Orbital Simulator",
        description: "Interactive 3D orbital mechanics simulator for asteroid 99942 Apophis",
        url: "https://apophis.bot",
        siteName: "apophis.bot",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Apophis Orbital Simulator",
        description: "Interactive 3D orbital mechanics simulator for asteroid 99942 Apophis",
    },
    metadataBase: new URL("https://apophis.bot"),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
        </html>
    );
}
