import { forwardRef, ReactNode } from "react";
import { Header } from "./Header";
import reaLogo from "@/assets/rea-logo.png";

interface LayoutProps {
  children: ReactNode;
}

function Footer() {
  return (
    <footer className="bg-[hsl(220,15%,13%)] text-white/70 mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-semibold text-white mb-3">AI Hub</h3>
            <p>Empowering teams with AI-driven skills and tools for modern product discovery.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Resources</h3>
            <ul className="space-y-2">
              <li><span className="hover:text-white transition-colors cursor-pointer">Documentation</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Community</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Support</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2">
              <li><span className="hover:text-white transition-colors cursor-pointer">About</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 flex items-center justify-center gap-2 text-xs text-white/40">
          <img src={reaLogo} alt="REA" className="h-4 w-4 rounded-sm opacity-50" />
          © {new Date().getFullYear()} REA Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}


export const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }
);

Layout.displayName = "Layout";
