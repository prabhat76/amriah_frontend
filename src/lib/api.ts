/**
 * Typed API client for the Clothing AI Spring Boot backend.
 * Base URL: https://clothing-amriah.onrender.com/api
 */

const BASE = 'https://clothing-amriah.onrender.com/api'

// ─── Token storage ────────────────────────────────────────────────────────────

export const token = {
  get: () => localStorage.getItem('access_token'),
  set: (t: string) => localStorage.setItem('access_token', t),
  clear: () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token') },
  setRefresh: (t: string) => localStorage.setItem('refresh_token', t),
  getRefresh: () => localStorage.getItem('refresh_token'),
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = token.get()
    if (t) headers['Authorization'] = `Bearer ${t}`
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    // Try refresh once
    const refreshTok = token.getRefresh()
    if (refreshTok) {
      const refreshRes = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTok }),
      })
      if (refreshRes.ok) {
        const { data } = await refreshRes.json() as ApiResponse<TokenResponse>
        token.set(data.accessToken)
        token.setRefresh(data.refreshToken)
        // Retry original
        return request<T>(method, path, body, auth)
      }
    }
    token.clear()
    throw new ApiError(401, 'UNAUTHORIZED', 'Session expired. Please log in again.')
  }

  const json = await res.json() as ApiResponse<T>
  if (!json.success) throw new ApiError(res.status, json.errorCode ?? 'ERROR', json.message)
  return json.data
}

const get = <T>(path: string, auth = true) => request<T>('GET', path, undefined, auth)
const post = <T>(path: string, body?: unknown, auth = true) => request<T>('POST', path, body, auth)
// put is available for future use
export const put = <T>(path: string, body?: unknown) => request<T>('PUT', path, body)
const patch = <T>(path: string, body?: unknown) => request<T>('PATCH', path, body)
const del = <T>(path: string) => request<T>('DELETE', path)

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Response envelope types ──────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errorCode?: string
  timestamp: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

// ─── Domain types (mirroring backend DTOs) ────────────────────────────────────

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: UserResponse
}

export interface UserResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  avatarUrl: string | null
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF'
  heightCm: number | null
  weightKg: number | null
  gender: string | null
}

export interface ProductSummary {
  id: string
  name: string
  slug: string
  sku: string
  shortDescription: string | null
  mainImageUrl: string | null
  price: number
  compareAtPrice: number | null
  averageRating: number
  reviewCount: number
  featured: boolean
  newArrival: boolean
  categoryId: string
  categoryName: string
  brandId: string | null
  brandName: string | null
  minVariantPrice: number | null
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  size: string | null
  color: string | null
  colorHex: string | null
  material: string | null
  price: number
  salePrice: number | null
  effectivePrice: number
  stockQuantity: number
  imageUrl: string | null
  barcode: string | null
  active: boolean
}

export interface ProductDetail {
  product: ProductSummary
  description: string | null
  aiGeneratedDescription: string | null
  imageUrls: string[]
  tags: string[]
  variants: ProductVariant[]
  availableSizes: string[]
  availableColors: string[]
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface CategoryResponse {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  displayOrder: number
  active: boolean
}

export interface CartItemResponse {
  id: string
  variantId: string
  productId: string
  productName: string
  size: string | null
  color: string | null
  imageUrl: string | null
  sku: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface CartResponse {
  id: string
  items: CartItemResponse[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  itemCount: number
}

export interface ReviewResponse {
  id: string
  productId: string
  productName: string
  userId: string
  userName: string
  userAvatar: string | null
  rating: number
  title: string | null
  comment: string | null
  sizeFit: number | null
  quality: number | null
  verifiedPurchase: boolean
  helpfulCount: number
  createdAt: string
}

export interface OrderResponse {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  items: OrderItemResponse[]
  shippingAddress: AddressSnapshot | null
  subtotal: number
  discount: number
  shippingCost: number
  tax: number
  total: number
  currency: string
  trackingNumber: string | null
  shippingCarrier: string | null
  createdAt: string
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
}

export interface OrderItemResponse {
  id: string
  variantId: string
  productId: string
  productName: string
  size: string | null
  color: string | null
  sku: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface AddressSnapshot {
  fullName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  stateProvince: string
  postalCode: string
  country: string
}

export interface AddressResponse {
  id: string
  fullName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  stateProvince: string
  postalCode: string
  country: string
  isDefault: boolean
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, firstName: string, lastName: string) =>
    post<TokenResponse>('/auth/register', { email, password, firstName, lastName }, false),

  login: (email: string, password: string) =>
    post<TokenResponse>('/auth/login', { email, password }, false),

  refresh: (refreshToken: string) =>
    post<TokenResponse>('/auth/refresh', { refreshToken }, false),

  forgotPassword: (email: string) =>
    post<void>('/auth/forgot-password', { email }, false),
}

// ─── Products API ─────────────────────────────────────────────────────────────

export const productsApi = {
  list: (page = 0, size = 20) =>
    get<PageResponse<ProductSummary>>(`/products?page=${page}&size=${size}`, false),

  search: (params: {
    q?: string; categoryId?: string; brandId?: string
    minPrice?: number; maxPrice?: number; tag?: string
    page?: number; size?: number; sort?: string
  }) => {
    const p = new URLSearchParams()
    if (params.q) p.set('q', params.q)
    if (params.categoryId) p.set('categoryId', params.categoryId)
    if (params.brandId) p.set('brandId', params.brandId)
    if (params.minPrice != null) p.set('minPrice', String(params.minPrice))
    if (params.maxPrice != null) p.set('maxPrice', String(params.maxPrice))
    if (params.tag) p.set('tag', params.tag)
    p.set('page', String(params.page ?? 0))
    p.set('size', String(params.size ?? 20))
    if (params.sort) p.set('sort', params.sort)
    return get<PageResponse<ProductSummary>>(`/products/search?${p}`, false)
  },

  getBySlug: (slug: string) =>
    get<ProductDetail>(`/products/${slug}`, false),

  getById: (id: string) =>
    get<ProductDetail>(`/products/id/${id}`, false),

  featured: (page = 0, size = 12) =>
    get<PageResponse<ProductSummary>>(`/products/featured?page=${page}&size=${size}`, false),

  recordView: (id: string) =>
    post<void>(`/products/${id}/view`, undefined, false),
}

// ─── Categories API ───────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () => get<CategoryResponse[]>('/categories', false),
}

// ─── Reviews API ──────────────────────────────────────────────────────────────

export const reviewsApi = {
  listForProduct: (productId: string, page = 0, size = 10) =>
    get<PageResponse<ReviewResponse>>(`/reviews/product/${productId}?page=${page}&size=${size}`, false),

  create: (body: { productId: string; rating: number; title?: string; comment?: string }) =>
    post<ReviewResponse>('/reviews', body),

  helpful: (id: string) => post<void>(`/reviews/${id}/helpful`),
}

// ─── Cart API ─────────────────────────────────────────────────────────────────

export const cartApi = {
  get: () => get<CartResponse>('/cart'),
  addItem: (variantId: string, quantity: number) =>
    post<CartResponse>('/cart/items', { variantId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    patch<CartResponse>(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => del<CartResponse>(`/cart/items/${itemId}`),
  clear: () => del<void>('/cart'),
}

// ─── Orders API ───────────────────────────────────────────────────────────────

export const ordersApi = {
  checkout: (body: {
    shippingAddressId: string
    paymentMethod: string
    couponCode?: string
    notes?: string
  }) => post<OrderResponse>('/orders/checkout', body),

  list: (page = 0, size = 20) =>
    get<PageResponse<OrderResponse>>(`/orders?page=${page}&size=${size}`),

  getByNumber: (orderNumber: string) =>
    get<OrderResponse>(`/orders/${orderNumber}`),

  cancel: (orderNumber: string) =>
    post<OrderResponse>(`/orders/${orderNumber}/cancel`),
}

// ─── Address API ──────────────────────────────────────────────────────────────

export const addressApi = {
  list: () => get<AddressResponse[]>('/users/me/addresses'),

  create: (body: {
    fullName: string; phone: string; line1: string; line2?: string
    city: string; stateProvince: string; postalCode: string; country: string
  }) => post<AddressResponse>('/users/me/addresses', body),
}

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  me: () => get<UserResponse>('/users/me'),
}

// ─── AI API ───────────────────────────────────────────────────────────────────

export const aiApi = {
  trending: (limit = 12) =>
    get<ProductSummary[]>(`/ai/recommendations/trending?limit=${limit}`, false),

  forYou: (limit = 12) =>
    get<ProductSummary[]>(`/ai/recommendations/for-you?limit=${limit}`),

  similar: (productId: string, limit = 6) =>
    get<ProductSummary[]>(`/ai/recommendations/similar/${productId}?limit=${limit}`, false),

  semanticSearch: (q: string, limit = 10) =>
    get<ProductSummary[]>(`/ai/recommendations/search?q=${encodeURIComponent(q)}&limit=${limit}`, false),

  predictSize: (body: { heightCm?: number; weightKg?: number; gender?: string; category?: string; preferredFit?: string }) =>
    post<{ recommendedSize: string; confidence: number; method: string; rationale: string }>('/ai/size-predict/predict', body, false),
}
