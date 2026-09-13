import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Smith Luck Performance",description:"Personal conjugate training journal for strength, conditioning and recovery.",manifest:"/manifest.webmanifest",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg",apple:"/favicon.svg"}};
export const viewport:Viewport={themeColor:"#080b09",width:"device-width",initialScale:1};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body className="antialiased">{children}</body></html>}
