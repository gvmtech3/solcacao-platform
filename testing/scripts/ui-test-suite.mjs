// SolCacao UI Test Suite (Playwright)
// Drives the real running app (client :5173, API :5000) through positive,
// negative, and edge-case scenarios, capturing a screenshot for every case
// and writing a structured JSON + text log of results.
//
// Prereqs: both dev servers running, catalog seeded (see README in this
// folder). Run with: node scripts/ui-test-suite.mjs

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SHOT_DIR = path.join(ROOT, 'screenshots')
const LOG_DIR = path.join(ROOT, 'logs')
const BASE_URL = 'http://localhost:5173'

fs.mkdirSync(SHOT_DIR, { recursive: true })
fs.mkdirSync(LOG_DIR, { recursive: true })

const results = []
let shotIndex = 0

function nextShotPath(id) {
  shotIndex += 1
  const n = String(shotIndex).padStart(2, '0')
  return path.join(SHOT_DIR, `${n}-${id}.png`)
}

async function runCase(page, { id, description, type, fn }) {
  const startedAt = Date.now()
  let status = 'PASS'
  let error = null
  let screenshot = null
  try {
    await fn(page)
    screenshot = nextShotPath(id)
    await page.screenshot({ path: screenshot, fullPage: false })
  } catch (err) {
    status = 'FAIL'
    error = err.message
    try {
      screenshot = nextShotPath(`${id}-FAILED`)
      await page.screenshot({ path: screenshot, fullPage: false })
    } catch {
      // ignore screenshot failure on top of test failure
    }
  }
  const durationMs = Date.now() - startedAt
  const record = {
    id,
    description,
    type,
    status,
    error,
    durationMs,
    screenshot: screenshot ? path.relative(ROOT, screenshot) : null,
  }
  results.push(record)
  console.log(`[${status}] ${id} (${type}) - ${description} (${durationMs}ms)`)
  if (error) console.log(`         ${error}`)
}

function uniqueEmail(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`
}

async function openAuthModal(p, { toRegister = false } = {}) {
  await p.goto(BASE_URL, { waitUntil: 'networkidle' })
  await p.getByRole('button', { name: /^log in$/i }).click()
  const dialog = p.getByRole('dialog')
  await dialog.waitFor({ state: 'visible' })
  if (toRegister) {
    await dialog.getByRole('button', { name: /create your account/i }).click()
  }
  return dialog
}

async function registerAccount(p, { firstName, email, password, accountType = 'retail' }) {
  const dialog = await openAuthModal(p, { toRegister: true })
  await dialog.locator('#auth-first-name').fill(firstName)
  await dialog.locator('#auth-email').fill(email)
  await dialog.locator('#auth-password').fill(password)
  if (accountType === 'b2b') {
    await dialog.getByRole('button', { name: /business \/ wholesale/i }).click()
  }
  await dialog.getByRole('button', { name: /create your account/i }).click()
  await dialog.waitFor({ state: 'visible' }) // stays open, switches to login tab
}

async function login(p, { email, password }) {
  const dialog = p.getByRole('dialog')
  await dialog.locator('#auth-email').fill(email)
  await dialog.locator('#auth-password').fill(password)
  await dialog.getByRole('button', { name: /^log in$/i }).click()
}

async function registerAndLogin(p, opts) {
  await registerAccount(p, opts)
  // Registration success clears the password field asynchronously (and shows
  // a "Welcome Back" banner) - wait for that to settle before typing again,
  // or the success handler can wipe out what we just filled.
  await p.getByRole('dialog').locator('text=Welcome Back').waitFor({ timeout: 10000 })
  await login(p, opts)
}

async function fillCheckoutForm(p, overrides = {}) {
  const values = {
    email: 'checkout@example.com',
    phone: '+1 555 222 3333',
    firstName: 'Playwright',
    lastName: 'Tester',
    address: '456 Cacao Ave',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    cardNumber: '4242424242424242',
    expiry: '2030-12',
    cvc: '123',
    ...overrides,
  }
  await p.fill('#checkout-email', values.email)
  await p.fill('#checkout-phone', values.phone)
  await p.fill('#checkout-firstName', values.firstName)
  await p.fill('#checkout-lastName', values.lastName)
  await p.fill('#checkout-address', values.address)
  await p.fill('#checkout-city', values.city)
  await p.fill('#checkout-state', values.state)
  await p.fill('#checkout-zip', values.zip)
  await p.fill('#checkout-cardNumber', values.cardNumber)
  await p.fill('#checkout-expiry', values.expiry)
  await p.fill('#checkout-cvc', values.cvc)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  const retailEmail = uniqueEmail('ui_retail')
  const b2bEmail = uniqueEmail('ui_b2b')
  const password = 'password123'

  // ===================== POSITIVE CASES =====================

  await runCase(page, {
    id: 'home-page-loads',
    description: 'Home page loads with hero, categories, and seasonal products',
    type: 'Positive',
    fn: async (p) => {
      await p.goto(BASE_URL, { waitUntil: 'networkidle' })
      await p.waitForSelector('text=Shop the Collection', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'catalog-browse-and-filter',
    description: 'Shop catalog loads all products with filter controls visible',
    type: 'Positive',
    fn: async (p) => {
      await p.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' })
      await p.waitForSelector('text=Origin', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'product-detail-page',
    description: 'Clicking a product opens its detail page with price and Add to Cart',
    type: 'Positive',
    fn: async (p) => {
      await p.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' })
      await p.locator('a[href^="/product/"]').first().click()
      await p.waitForSelector('text=Add to Cart', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'guest-add-to-cart',
    description: 'A guest (not logged in) can add a product to the cart and see the cart drawer',
    type: 'Positive',
    fn: async (p) => {
      await p.getByRole('button', { name: 'Add to Cart' }).first().click()
      await p.waitForSelector('text=Your Cart', { timeout: 10000 })
      await p.waitForSelector('text=Subtotal', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'register-retail-success',
    description: 'Registering a new retail account succeeds and switches the modal to the Login tab',
    type: 'Positive',
    fn: async (p) => {
      await context.clearCookies()
      await registerAccount(p, { firstName: 'Playwright', email: retailEmail, password })
      const dialog = p.getByRole('dialog')
      await dialog.waitFor({ state: 'visible' })
      await dialog.locator('text=Welcome Back').waitFor({ timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'login-retail-success',
    description: 'Logging in with the just-registered retail credentials succeeds',
    type: 'Positive',
    fn: async (p) => {
      await login(p, { email: retailEmail, password })
      await p.waitForSelector('text=Playwright', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'retail-role-nav',
    description: 'A logged-in retail account sees Shop/Sampler/Cart and does NOT see Wholesale in the nav',
    type: 'Positive',
    fn: async (p) => {
      await p.waitForSelector('nav >> text=Shop', { timeout: 10000 })
      const wholesaleVisible = await p.locator('nav >> text=Wholesale').count()
      if (wholesaleVisible > 0) throw new Error('Wholesale nav link should be hidden for a retail account')
    },
  })

  await runCase(page, {
    id: 'checkout-success',
    description: 'A logged-in retail user completes checkout and sees the order confirmation',
    type: 'Positive',
    fn: async (p) => {
      await p.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' })
      await fillCheckoutForm(p, { email: retailEmail })
      await p.getByRole('button', { name: /place order/i }).click()
      await p.waitForSelector('text=Thank You for Your Order', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'b2b-landing-page',
    description: 'B2B wholesale landing page loads with service overview (as a guest)',
    type: 'Positive',
    fn: async (p) => {
      await context.clearCookies()
      await p.goto(`${BASE_URL}/b2b`, { waitUntil: 'networkidle' })
      await p.waitForSelector('text=Start a Custom Order', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'b2b-wizard-submission',
    description: 'The 4-step B2B wizard can be completed end-to-end and shows a quote confirmation',
    type: 'Positive',
    fn: async (p) => {
      await p.goto(`${BASE_URL}/b2b/custom-order`, { waitUntil: 'networkidle' })
      await p.getByRole('button', { name: /next step/i }).click() // step 1 -> 2
      await p.fill('#wizard-company-name', 'Acme Hotels')
      await p.fill('#wizard-contact-name', "Jane O'Brien")
      await p.getByRole('button', { name: /next step/i }).click() // step 2 -> 3
      await p.getByRole('button', { name: /next step/i }).click() // step 3 -> 4
      await p.fill('#wizard-email', b2bEmail)
      await p.fill('#wizard-phone', '+1 555 123 4567')
      await p.getByRole('button', { name: /submit quote request/i }).click()
      await p.waitForSelector('text=Quote Request Received', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'contact-form-success',
    description: 'A valid contact form submission shows the thank-you confirmation',
    type: 'Positive',
    fn: async (p) => {
      await p.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle' })
      await p.fill('#contact-name', 'María López')
      await p.fill('#contact-email', 'maria@example.com')
      await p.fill('#contact-message', 'Do you ship internationally to Mexico?')
      await p.getByRole('button', { name: /send message/i }).click()
      await p.waitForSelector('text=Thanks for reaching out', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'localization-toggle-spanish',
    description: 'Toggling the language switch renders the UI in Spanish',
    type: 'Positive',
    fn: async (p) => {
      await p.goto(BASE_URL, { waitUntil: 'networkidle' })
      await p.getByRole('button', { name: /toggle language/i }).click()
      await p.waitForSelector('text=Ver la Colección', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'sampler-builder-selection',
    description: 'The sampler builder lets a user select pieces and shows a running total',
    type: 'Positive',
    fn: async (p) => {
      await p.getByRole('button', { name: /toggle language/i }).click() // back to English
      await p.goto(`${BASE_URL}/sampler`, { waitUntil: 'networkidle' })
      const pieces = p.locator('button[aria-pressed]')
      await pieces.nth(0).click()
      await pieces.nth(1).click()
      await p.waitForSelector('text=2 / 9 pieces selected', { timeout: 10000 })
    },
  })

  // ===================== NEGATIVE CASES =====================

  await runCase(page, {
    id: 'register-invalid-name-rejected',
    description: 'Registering with a numeric-only first name is rejected with a validation error',
    type: 'Negative',
    fn: async (p) => {
      await context.clearCookies()
      const dialog = await openAuthModal(p, { toRegister: true })
      await dialog.locator('#auth-first-name').fill('12345')
      await dialog.locator('#auth-email').fill(uniqueEmail('ui_badname'))
      await dialog.locator('#auth-password').fill(password)
      await dialog.getByRole('button', { name: /create your account/i }).click()
      await dialog.locator('text=/letters, spaces, hyphens/i').waitFor({ timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'login-wrong-password-rejected',
    description: 'Logging in with the wrong password shows an invalid-credentials error',
    type: 'Negative',
    fn: async (p) => {
      const dialog = await openAuthModal(p)
      await dialog.locator('#auth-email').fill(retailEmail)
      await dialog.locator('#auth-password').fill('totally-wrong-password')
      await dialog.getByRole('button', { name: /^log in$/i }).click()
      await dialog.locator('text=/invalid email or password/i').waitFor({ timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'checkout-invalid-zip-rejected',
    description: 'Submitting checkout with an invalid ZIP code is blocked with an inline error',
    type: 'Negative',
    fn: async (p) => {
      await openAuthModal(p)
      await login(p, { email: retailEmail, password })
      await p.waitForSelector('text=Playwright', { timeout: 10000 })
      await p.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' })
      await p.getByRole('button', { name: 'Add to Cart' }).first().click()
      await p.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' })
      await fillCheckoutForm(p, { email: retailEmail, zip: '!!!!!' })
      await p.getByRole('button', { name: /place order/i }).click()
      await p.waitForSelector('text=/valid zip code/i', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'contact-short-message-rejected',
    description: 'A contact message shorter than 10 characters is rejected inline',
    type: 'Negative',
    fn: async (p) => {
      await p.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle' })
      await p.fill('#contact-name', 'Jane Doe')
      await p.fill('#contact-email', 'jane@example.com')
      await p.fill('#contact-message', 'short')
      await p.getByRole('button', { name: /send message/i }).click()
      await p.waitForSelector('text=/at least 10 characters/i', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'b2b-account-blocked-from-shop',
    description: 'A logged-in B2B account navigating to /shop is redirected back to /b2b',
    type: 'Negative',
    fn: async (p) => {
      await context.clearCookies()
      await registerAndLogin(p, { firstName: 'Biz', email: b2bEmail, password, accountType: 'b2b' })
      await p.waitForSelector('text=Biz', { timeout: 10000 })
      await p.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' })
      await p.waitForSelector('text=Start a Custom Order', { timeout: 10000 }) // landed on /b2b instead
      if (!p.url().includes('/b2b')) throw new Error(`Expected redirect to /b2b, got ${p.url()}`)
    },
  })

  // ===================== EDGE CASES =====================

  await runCase(page, {
    id: 'empty-cart-shows-empty-state',
    description: 'Visiting the cart page with nothing in it shows the empty-cart message, not a checkout form',
    type: 'Edge',
    fn: async (p) => {
      await context.clearCookies()
      await p.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' })
      await p.waitForSelector('text=/cart is empty/i', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'unknown-product-id-shows-not-found',
    description: 'Navigating to a product id that does not exist shows the 404 page, not a crash',
    type: 'Edge',
    fn: async (p) => {
      await p.goto(`${BASE_URL}/product/000000000000000000000000`, { waitUntil: 'networkidle' })
      await p.waitForSelector('text=404', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'unknown-route-shows-not-found',
    description: 'Navigating to a completely unknown route shows the 404 page',
    type: 'Edge',
    fn: async (p) => {
      await p.goto(`${BASE_URL}/this-route-does-not-exist`, { waitUntil: 'networkidle' })
      await p.waitForSelector('text=404', { timeout: 10000 })
    },
  })

  await runCase(page, {
    id: 'sampler-max-pieces-capped',
    description: 'Selecting across both paginated pages reaches the 9-piece cap (full catalog size)',
    type: 'Edge',
    fn: async (p) => {
      await p.goto(`${BASE_URL}/sampler`, { waitUntil: 'networkidle' })
      // The sampler grid is paginated (6 per page over 2 pages for the 9 seed
      // products) - select everything on page 1, advance, select the rest.
      const selectAllOnPage = async () => {
        const pieces = p.locator('button[aria-pressed="false"]')
        const count = await pieces.count()
        for (let i = 0; i < count; i += 1) {
          await pieces.nth(0).click() // re-query index 0 each time as the set shrinks
        }
      }
      await selectAllOnPage()
      const nextButton = p.getByRole('button', { name: /^next$/i })
      if (await nextButton.isEnabled()) {
        await nextButton.click()
        await selectAllOnPage()
      }
      await p.waitForSelector('text=9 / 9 pieces selected', { timeout: 10000 })
    },
  })

  await browser.close()

  // ===================== WRITE RESULTS =====================

  const summary = {
    total: results.length,
    passed: results.filter((r) => r.status === 'PASS').length,
    failed: results.filter((r) => r.status === 'FAIL').length,
    byType: {
      Positive: results.filter((r) => r.type === 'Positive').length,
      Negative: results.filter((r) => r.type === 'Negative').length,
      Edge: results.filter((r) => r.type === 'Edge').length,
    },
    generatedAt: new Date().toISOString(),
  }

  fs.writeFileSync(
    path.join(LOG_DIR, 'ui-test-results.json'),
    JSON.stringify({ summary, results }, null, 2)
  )

  const textLog = [
    'SolCacao UI Test Suite - Run Log',
    `Generated: ${summary.generatedAt}`,
    `Total: ${summary.total}  Passed: ${summary.passed}  Failed: ${summary.failed}`,
    `By type: Positive=${summary.byType.Positive} Negative=${summary.byType.Negative} Edge=${summary.byType.Edge}`,
    '',
    ...results.map(
      (r) => `[${r.status}] ${r.id} (${r.type}) - ${r.description} - ${r.durationMs}ms${r.error ? ` - ERROR: ${r.error}` : ''}`
    ),
  ].join('\n')
  fs.writeFileSync(path.join(LOG_DIR, 'ui-test-results.log'), textLog)

  console.log('\n' + textLog.split('\n').slice(1, 4).join('\n'))

  if (summary.failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('UI test suite crashed:', err)
  process.exit(1)
})
