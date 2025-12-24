import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "../providers";
import Navbar from "../components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Lumière Camera Shop",
  description: "Premium Camera Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased min-h-screen bg-dark-900 text-white font-sans`}>
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
