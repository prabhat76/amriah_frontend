import { ProductSummary } from '@/lib/api'

// Legacy mock type kept for data/products.ts compatibility
export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  badge?: 'new' | 'sale' | 'hot'
  rating: number
  reviewCount: number
  colors: string[]
  sizes: string[]
  description: string
}

// Cart item uses API's ProductSummary so ProductDetailPage and ShopPage can add items directly
export interface CartItem {
  product: ProductSummary
  variantId: string
  color: string
  size: string
  qty: number
}

export interface Category {
  id: number
  name: string
  image: string
  itemCount: number
}

export interface HeroSlide {
  id: number
  tag: string
  title: string
  subtitle: string
  cta: string
  image: string
}
