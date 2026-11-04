import { Routes, Route } from 'react-router-dom'
import { LocaleProvider } from './context/LocaleContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ProductsProvider } from './context/ProductsContext'
import Layout from './components/layout/Layout'
import ChannelRoute from './components/routing/ChannelRoute'

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
                <Route
                  path="/"
                  element={
                    <ChannelRoute channel="retail">
                      <Home />
                    </ChannelRoute>
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <ChannelRoute channel="retail">
                      <Catalog />
                    </ChannelRoute>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <ChannelRoute channel="retail">
                      <ProductDetail />
                    </ChannelRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ChannelRoute channel="retail">
                      <Cart />
                    </ChannelRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ChannelRoute channel="retail">
                      <Checkout />
                    </ChannelRoute>
                  }
                />
                <Route
                  path="/order-confirmation"
                  element={
                    <ChannelRoute channel="retail">
                      <OrderConfirmation />
                    </ChannelRoute>
                  }
                />
                <Route
                  path="/sampler"
                  element={
                    <ChannelRoute channel="retail">
                      <SamplerBuilder />
                    </ChannelRoute>
                  }
                />
                <Route path="/account" element={<Account />} />
                <Route
                  path="/b2b"
                  element={
                    <ChannelRoute channel="b2b">
                      <B2BLanding />
                    </ChannelRoute>
                  }
                />
                <Route
                  path="/b2b/custom-order"
                  element={
                    <ChannelRoute channel="b2b">
                      <B2BWizard />
                    </ChannelRoute>
                  }
                />
                <Route
                  path="/b2b/confirmation"
                  element={
                    <ChannelRoute channel="b2b">
                      <QuoteConfirmation />
                    </ChannelRoute>
                  }
                />
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
