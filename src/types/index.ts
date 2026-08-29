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

export interface CartItem {
  product: Product
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
