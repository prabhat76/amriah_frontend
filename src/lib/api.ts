/**
 * Typed API client for the Clothing AI Spring Boot backend.
 * Base URL: https://clothing-amriah.onrender.com/api
 */

const BASE = import.meta.env.VITE_API_BASE ?? 'https://clothing-amriah.onrender.com/api'

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
  paymentToken: string | null
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
  label: string | null
  fullName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  stateProvince: string | null
  postalCode: string
  country: string
  defaultAddress: boolean
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string) =>
    post<TokenResponse>('/auth/register', { email, password, firstName, lastName, phone }, false),

  login: (email: string, password: string) =>
    post<TokenResponse>('/auth/login', { email, password }, false),

  refresh: (refreshToken: string) =>
    post<TokenResponse>('/auth/refresh', { refreshToken }, false),

  forgotPassword: (email: string) =>
    post<void>('/auth/forgot-password', { email }, false),

  resetPassword: (resetToken: string, newPassword: string) =>
    post<void>('/auth/reset-password', { token: resetToken, newPassword }, false),
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

export interface OrderTrackingResponse {
  orderNumber: string
  status: string
  trackingNumber: string | null
  shippingCarrier: string | null
  shippedAt: string | null
  deliveredAt: string | null
  estimatedDelivery: string | null
}

export const ordersApi = {
  checkout: (body: {
    shippingAddressId: string
    billingAddressId?: string
    paymentMethod: 'STRIPE' | 'PAYPAL' | 'COD'
    couponCode?: string
    notes?: string
  }) => post<OrderResponse>('/orders/checkout', body),

  list: (page = 0, size = 20) =>
    get<PageResponse<OrderResponse>>(`/orders?page=${page}&size=${size}`),

  getByNumber: (orderNumber: string) =>
    get<OrderResponse>(`/orders/${orderNumber}`),

  cancel: (orderNumber: string) =>
    post<OrderResponse>(`/orders/${orderNumber}/cancel`),

  tracking: (orderNumber: string) =>
    get<OrderTrackingResponse>(`/orders/${orderNumber}/tracking`),
}

// ─── Address API ──────────────────────────────────────────────────────────────

export interface AddressBody {
  label?: string
  fullName: string
  phone?: string
  line1: string
  line2?: string
  city: string
  stateProvince?: string
  postalCode: string
  country: string
  defaultAddress?: boolean
}

export const addressApi = {
  list: () => get<AddressResponse[]>('/users/me/addresses'),

  create: (body: AddressBody) => post<AddressResponse>('/users/me/addresses', body),

  update: (id: string, body: AddressBody) => put<AddressResponse>(`/users/me/addresses/${id}`, body),

  delete: (id: string) => del<void>(`/users/me/addresses/${id}`),
}

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  me: () => get<UserResponse>('/users/me'),

  updateMe: (body: {
    firstName?: string; lastName?: string; phone?: string
    avatarUrl?: string; heightCm?: number; weightKg?: number; gender?: string
  }) => patch<UserResponse>('/users/me', body),

  changePassword: (currentPassword: string, newPassword: string) =>
    post<void>('/users/me/change-password', { currentPassword, newPassword }),
}

// ─── Banner API ───────────────────────────────────────────────────────────────

export interface BannerResponse {
  id: string
  title: string | null
  subtitle: string | null
  ctaText: string | null
  ctaLink: string | null
  imageUrl: string
  displayOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export const bannerApi = {
  // Public
  list: () => get<BannerResponse[]>('/banners', false),

  // Admin
  listAll: () => get<BannerResponse[]>('/banners/admin'),
  getById: (id: string) => get<BannerResponse>(`/banners/admin/${id}`),

  create: (body: {
    title?: string; subtitle?: string; ctaText?: string; ctaLink?: string
    imageUrl: string; displayOrder?: number; active?: boolean
  }) => post<BannerResponse>('/banners/admin', body),

  update: (id: string, body: {
    title?: string; subtitle?: string; ctaText?: string; ctaLink?: string
    imageUrl?: string; displayOrder?: number; active?: boolean
  }) => request<BannerResponse>('PUT', `/banners/admin/${id}`, body),

  uploadAndCreate: (
    file: File,
    meta: { title?: string; subtitle?: string; ctaText?: string; ctaLink?: string; displayOrder?: number; active?: boolean }
  ) => {
    const form = new FormData()
    form.append('file', file)
    if (meta.title) form.append('title', meta.title)
    if (meta.subtitle) form.append('subtitle', meta.subtitle)
    if (meta.ctaText) form.append('ctaText', meta.ctaText)
    if (meta.ctaLink) form.append('ctaLink', meta.ctaLink)
    if (meta.displayOrder != null) form.append('displayOrder', String(meta.displayOrder))
    if (meta.active != null) form.append('active', String(meta.active))
    const t = token.get()
    const headers: Record<string, string> = {}
    if (t) headers['Authorization'] = `Bearer ${t}`
    return fetch(`${BASE}/banners/admin/upload`, { method: 'POST', headers, body: form })
      .then(r => r.json() as Promise<ApiResponse<BannerResponse>>)
      .then(j => { if (!j.success) throw new ApiError(400, j.errorCode ?? 'ERROR', j.message); return j.data })
  },

  delete: (id: string) => del<void>(`/banners/admin/${id}`),
}

// ─── Brands API ───────────────────────────────────────────────────────────────

export interface BrandResponse {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  active: boolean
}

export const brandsApi = {
  list: () => get<BrandResponse[]>('/brands', false),
}

// ─── Wishlist API ─────────────────────────────────────────────────────────────

export interface WishlistEntry {
  id: string
  productId: string
  productName: string
  slug: string
  imageUrl: string | null
  price: number
  averageRating: number
}

export const wishlistApi = {
  list: () => get<WishlistEntry[]>('/wishlist'),
  add: (productId: string) => post<WishlistEntry>(`/wishlist/${productId}`),
  remove: (productId: string) => del<void>(`/wishlist/${productId}`),
  check: (productId: string) => get<boolean>(`/wishlist/${productId}/check`),
}

// ─── Notifications API ────────────────────────────────────────────────────────

export interface NotificationResponse {
  id: string
  type: 'ORDER' | 'PROMOTION' | 'BACK_IN_STOCK' | 'PRICE_DROP' | 'SYSTEM'
  title: string
  body: string
  payload: string | null
  isRead: boolean
  readAt: string | null
  channel: string
  createdAt: string
}

export const notificationsApi = {
  list: (page = 0, size = 20) =>
    get<PageResponse<NotificationResponse>>(`/notifications?page=${page}&size=${size}`),
  unreadCount: () => get<number>('/notifications/unread-count'),
  markRead: (id: string) => post<void>(`/notifications/${id}/read`),
  markAllRead: () => post<void>('/notifications/read-all'),
  delete: (id: string) => del<void>(`/notifications/${id}`),
}



export interface DashboardSummary {
  totalRevenue: number
  revenueToday: number
  ordersTotal: number
  ordersPending: number
  ordersShipped: number
  totalCustomers: number
  newCustomersToday: number
  totalProducts: number
  lowStockProducts: number
  averageOrderValue: number
  [key: string]: unknown
}

export const adminApi = {
  summary: () => get<DashboardSummary>('/admin/dashboard/summary'),
  revenueChart: (days = 30) => get<Record<string, unknown>>(`/admin/dashboard/revenue-chart?days=${days}`),
  topProducts: (limit = 10, days = 30) => get<Record<string, unknown>>(`/admin/dashboard/top-products?limit=${limit}&days=${days}`),
}

// ─── Admin Orders API ─────────────────────────────────────────────────────────

export const adminOrdersApi = {
  list: (status: string, page = 0, size = 50) =>
    get<PageResponse<OrderResponse>>(`/admin/orders?status=${status}&page=${page}&size=${size}`),

  get: (orderNumber: string) =>
    get<OrderResponse>(`/admin/orders/${orderNumber}`),

  updateStatus: (orderNumber: string, body: { status: string; trackingNumber?: string; shippingCarrier?: string }) =>
    request<OrderResponse>('PATCH', `/admin/orders/${orderNumber}/status`, body),

  cancel: (orderNumber: string) =>
    post<OrderResponse>(`/admin/orders/${orderNumber}/status`, { status: 'CANCELLED' }),
}

// ─── Admin Products API ───────────────────────────────────────────────────────

export interface ProductCreateBody {
  name: string
  sku: string
  description?: string
  shortDescription?: string
  categoryId: string
  brandId?: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  currency?: string
  mainImageUrl?: string
  imageUrls?: string[]
  tags?: string[]
  featured?: boolean
  newArrival?: boolean
  weightGrams?: number
  variants?: {
    sku: string
    size?: string
    color?: string
    colorHex?: string
    material?: string
    price: number
    salePrice?: number
    stockQuantity: number
    lowStockThreshold?: number
    imageUrl?: string
    barcode?: string
  }[]
}

export interface ProductUpdateBody {
  name?: string
  description?: string
  shortDescription?: string
  categoryId?: string
  brandId?: string
  price?: number
  compareAtPrice?: number
  costPrice?: number
  mainImageUrl?: string
  imageUrls?: string[]
  tags?: string[]
  featured?: boolean
  newArrival?: boolean
  active?: boolean
  status?: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'ARCHIVED'
  weightGrams?: number
}

export interface VariantCreateBody {
  sku: string
  size?: string
  color?: string
  colorHex?: string
  material?: string
  price: number
  salePrice?: number
  stockQuantity: number
  lowStockThreshold?: number
  imageUrl?: string
  barcode?: string
}

export const adminProductsApi = {
  create: (body: ProductCreateBody) =>
    post<ProductDetail>('/products', body),

  update: (productId: string, body: ProductUpdateBody) =>
    request<ProductDetail>('PUT', `/products/${productId}`, body),

  delete: (productId: string) =>
    del<void>(`/products/${productId}`),

  addVariant: (productId: string, body: VariantCreateBody) =>
    post<ProductVariant>(`/products/${productId}/variants`, body),

  uploadImage: (productId: string, file: File, setAsMain = false) => {
    const form = new FormData()
    form.append('file', file)
    form.append('setAsMain', String(setAsMain))
    const t = token.get()
    const headers: Record<string, string> = {}
    if (t) headers['Authorization'] = `Bearer ${t}`
    return fetch(`${BASE}/products/${productId}/images/upload`, { method: 'POST', headers, body: form })
      .then(r => r.json() as Promise<ApiResponse<unknown>>)
      .then(j => { if (!j.success) throw new ApiError(400, j.errorCode ?? 'ERROR', j.message); return j.data })
  },
}

// ─── Admin Categories API ─────────────────────────────────────────────────────

export const adminCategoriesApi = {
  create: (body: { name: string; description?: string; imageUrl?: string; parentId?: string; displayOrder?: number }) =>
    post<CategoryResponse>('/categories', body),

  update: (id: string, body: { name?: string; description?: string; imageUrl?: string; parentId?: string; displayOrder?: number; active?: boolean }) =>
    request<CategoryResponse>('PUT', `/categories/${id}`, body),

  delete: (id: string) =>
    del<void>(`/categories/${id}`),
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
