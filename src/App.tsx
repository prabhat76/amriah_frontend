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

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <CartSidebar />
          <div className="flex-1">
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected */}
              <Route path="/checkout" element={
                <ProtectedRoute><CheckoutPage /></ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute><OrdersPage /></ProtectedRoute>
              } />
              <Route path="/orders/:orderNumber" element={
                <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <h1 className="font-display text-8xl font-bold" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>404</h1>
                  <p className="text-gray-400 mt-4 text-sm">Page not found.</p>
                  <a href="/" className="btn-black inline-flex mt-6">Go Home</a>
                </div>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
