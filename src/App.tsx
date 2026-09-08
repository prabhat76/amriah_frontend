import { Routes, Route } from 'react-router-dom'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import ShopPage from '@/pages/ShopPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import CheckoutPage from '@/pages/CheckoutPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import CustomPage from '@/pages/CustomPage'
import StoryPage from '@/pages/StoryPage'
import AdminPage from '@/pages/AdminPage'
import ChatWidget from '@/components/ChatWidget'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Admin — own layout, no storefront Navbar/Footer */}
          <Route path="/admin/*" element={<AdminPage />} />

          {/* Storefront */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col bg-pearl">
              <Navbar />
              <CartSidebar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/custom" element={<CustomPage />} />
                  <Route path="/story" element={<StoryPage />} />
                  <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/orders/:orderNumber" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                  <Route path="*" element={
                    <div className="flex flex-col items-center justify-center py-40 text-center bg-pearl">
                      <p className="eyebrow mb-4">Lost in the light</p>
                      <h1 className="font-display text-8xl font-light text-navy mb-4">404</h1>
                      <p className="text-sm text-stone mb-8">This page doesn't exist — but your perfect piece does.</p>
                      <a href="/" className="btn-gold">Return to ASTRIMI</a>
                    </div>
                  } />
                </Routes>
              </div>
              <Footer />
              <ChatWidget />
            </div>
          } />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
