import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "NextJS AI SDK",
    description: "trying out bun and ai-sdk",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${manrope.variable} antialiased font-sans`}>
                {children}
            </body>
        </html>
    );
}
