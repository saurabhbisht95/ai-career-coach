import { Inter} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";


const inter = Inter( { subsets: ["latin"]});

export const metadata = {
  title: "AI Career Coach",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={` ${inter.className}`}
      >
        <ThemeProvider
            attribute="class"
             forcedTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/*header */}
            <Header/>

            <main className="min-h-screen">{children}</main>

            {/*footer */}
            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Made by Saurabh Bisht</p>
              </div>
            </footer>
          </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
