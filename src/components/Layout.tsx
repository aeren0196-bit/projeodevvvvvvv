import { type ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePageTitle } from "@/hooks/use-page-title";
import { HeaderEcommerce } from "@/modules/header-ecommerce";
import { Footer } from "@/modules/footer";
import { ChevronLeft } from "lucide-react";

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  usePageTitle();
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderEcommerce />
      {!isHomePage && (
        <div className="fixed top-20 left-4 z-50">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-sm px-3 py-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4" />
            Geri Dön
          </button>
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
