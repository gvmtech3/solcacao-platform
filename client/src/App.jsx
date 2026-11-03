import { Routes, Route } from 'react-router-dom'
import { LocaleProvider } from './context/LocaleContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ProductsProvider } from './context/ProductsContext'
import Layout from './components/layout/Layout'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Account from './pages/Account'
import B2BLanding from './pages/B2BLanding'
import B2BWizard from './pages/B2BWizard'
import QuoteConfirmation from './pages/QuoteConfirmation'
import Contact from './pages/Contact'
import SamplerBuilder from './pages/SamplerBuilder'
import About from './pages/About'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/account" element={<Account />} />
                <Route path="/b2b" element={<B2BLanding />} />
                <Route path="/b2b/custom-order" element={<B2BWizard />} />
                <Route path="/b2b/confirmation" element={<QuoteConfirmation />} />
                <Route path="/sampler" element={<SamplerBuilder />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </LocaleProvider>
  )
}
