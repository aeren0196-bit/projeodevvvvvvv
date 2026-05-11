import { BrowserRouter, Routes, Route } from "react-router";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import ProductsPage from "@/modules/products-page";
import ProductDetailPage from "@/modules/product-detail-page";
import CartPage from "@/modules/cart-page";
import CheckoutPage from "@/modules/checkout-page";
import OrderConfirmationPage from "@/modules/order-confirmation-page";
import MyOrdersPage from "@/modules/my-orders-page";
import FavoritesEcommercePage from "@/modules/favorites-ecommerce-page";
import LoginPage from "@/modules/login-page";
import RegisterPage from "@/modules/register-page";
import ForgotPasswordPage from "@/modules/forgot-password-page";
import ResetPasswordPage from "@/modules/reset-password-page";
import ContactPage from "@/modules/contact-page";
import TermsPage from "@/modules/terms-page";
import AboutPage from "@/modules/about-page";
import PrivacyPage from "@/modules/privacy-page";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<ProductsPage />} />

        <Route path="/products/:slug" element={<ProductDetailPage />} />


        <Route path="/cart" element={<CartPage />} />



        <Route path="/checkout" element={<CheckoutPage />} />




        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />





        <Route path="/my-orders" element={<MyOrdersPage />} />






        <Route path="/favorites" element={<FavoritesEcommercePage />} />







        <Route path="/login" element={<LoginPage />} />








        <Route path="/register" element={<RegisterPage />} />









        <Route path="/forgot-password" element={<ForgotPasswordPage />} />










        <Route path="/reset-password" element={<ResetPasswordPage />} />











        <Route path="/contact" element={<ContactPage />} />












        <Route path="/terms" element={<TermsPage />} />













        <Route path="/about" element={<AboutPage />} />














        <Route path="/privacy" element={<PrivacyPage />} />

        <Route path="/admin" element={<AdminPage />} />















        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
