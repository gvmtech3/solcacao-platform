// SolCacao Performance Test
// Load-tests GET /api/products and POST /api/cart/items with autocannon,
// and times a realistic POST /api/orders cycle (add-to-cart -> checkout)
// across several concurrent simulated guest sessions, since order creation
// depends on cart state and isn't a stateless endpoint autocannon alone can
// hammer meaningfully.
//
// Run with: node scripts/performance-test.mjs

import autocannon from 'autocannon'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOG_DIR = path.join(__dirname, '..', 'logs')
fs.mkdirSync(LOG_DIR, { recursive: true })

const API = 'http://localhost:5000/api'

function runAutocannon(opts) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(opts, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
    autocannon.track(instance, { renderProgressBar: false })
  })
}

function summarize(label, result) {
  return {
    label,
    durationSec: result.duration,
    connections: result.connections,
    requests: {
      total: result.requests.total,
      perSec: result.requests.average,
    },
    latencyMs: {
      avg: result.latency.average,
      p50: result.latency.p50,
      p99: result.latency.p99,
      max: result.latency.max,
    },
    throughput: {
      avgBytesPerSec: result.throughput.average,
    },
    errors: result.errors,
    timeouts: result.timeouts,
    non2xx: result.non2xx,
  }
}

async function fetchJson(path, opts = {}) {
  const res = await fetch(`${API}${path}`, opts)
  return res.json()
}

async function main() {
  const report = { generatedAt: new Date().toISOString(), tests: [] }

  // --- Need a real product id to hit cart/order endpoints with ---
  const { products } = await fetchJson('/products')
  const productId = products[0]._id
  console.log(`Using product ${products[0].nameEn} (${productId}) for cart/order load tests`)

  // ===================== TEST 1: GET /api/products =====================
  console.log('\n=== Load test: GET /api/products (catalog browse) ===')
  const productsResult = await runAutocannon({
    url: `${API}/products`,
    connections: 20,
    duration: 10,
  })
  report.tests.push(summarize('GET /api/products (catalog browse)', productsResult))

  // ===================== TEST 2: POST /api/cart/items =====================
  console.log('\n=== Load test: POST /api/cart/items (add to cart) ===')
  const cartResult = await runAutocannon({
    url: `${API}/cart/items`,
    method: 'POST',
    connections: 20,
    duration: 10,
    headers: {
      'content-type': 'application/json',
      'x-guest-session-id': 'perf-test-session',
    },
    body: JSON.stringify({ productId, quantity: 1 }),
  })
  report.tests.push(summarize('POST /api/cart/items (add to cart)', cartResult))

  // ===================== TEST 3: POST /api/orders (realistic cycle) =====================
  console.log('\n=== Timing test: full add-to-cart -> checkout cycle (POST /api/orders) ===')
  const ORDER_ITERATIONS = 30
  const CONCURRENCY = 5
  const orderLatencies = []
  let orderErrors = 0

  async function runOrderCycle(i) {
    const guestId = `perf-order-${i}-${Date.now()}`
    const started = Date.now()
    try {
      await fetch(`${API}/cart/items`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-guest-session-id': guestId },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-guest-session-id': guestId },
        body: JSON.stringify({
          firstName: 'Perf',
          lastName: 'Test',
          email: `perf_${i}@example.com`,
          phone: '555-000-1111',
          addressLine1: '1 Perf St',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
        }),
      })
      if (!res.ok) orderErrors += 1
    } catch {
      orderErrors += 1
    }
    orderLatencies.push(Date.now() - started)
  }

  for (let batchStart = 0; batchStart < ORDER_ITERATIONS; batchStart += CONCURRENCY) {
    const batch = []
    for (let i = batchStart; i < Math.min(batchStart + CONCURRENCY, ORDER_ITERATIONS); i += 1) {
      batch.push(runOrderCycle(i))
    }
    await Promise.all(batch)
  }

  orderLatencies.sort((a, b) => a - b)
  const sum = orderLatencies.reduce((s, v) => s + v, 0)
  const p = (pct) => orderLatencies[Math.floor((orderLatencies.length - 1) * pct)]
  const orderSummary = {
    label: 'POST /api/orders (full add-to-cart + checkout cycle)',
    iterations: ORDER_ITERATIONS,
    concurrency: CONCURRENCY,
    errors: orderErrors,
    latencyMs: {
      avg: Math.round(sum / orderLatencies.length),
      min: orderLatencies[0],
      p50: p(0.5),
      p95: p(0.95),
      max: orderLatencies[orderLatencies.length - 1],
    },
  }
  report.tests.push(orderSummary)
  console.log(
    `  ${ORDER_ITERATIONS} cycles @ concurrency ${CONCURRENCY}: avg ${orderSummary.latencyMs.avg}ms, ` +
      `p50 ${orderSummary.latencyMs.p50}ms, p95 ${orderSummary.latencyMs.p95}ms, max ${orderSummary.latencyMs.max}ms, errors ${orderErrors}`
  )

  fs.writeFileSync(path.join(LOG_DIR, 'performance-results.json'), JSON.stringify(report, null, 2))

  const textLog = [
    'SolCacao Performance Test Results',
    `Generated: ${report.generatedAt}`,
    '',
    ...report.tests.flatMap((t) => {
      if (t.requests) {
        return [
          `--- ${t.label} ---`,
          `Duration: ${t.durationSec}s, Connections: ${t.connections}`,
          `Requests: ${t.requests.total} total, ${t.requests.perSec} req/sec avg`,
          `Latency (ms): avg=${t.latencyMs.avg} p50=${t.latencyMs.p50} p99=${t.latencyMs.p99} max=${t.latencyMs.max}`,
          `Throughput: ${(t.throughput.avgBytesPerSec / 1024).toFixed(1)} KB/sec avg`,
          `Errors: ${t.errors}, Timeouts: ${t.timeouts}, Non-2xx: ${t.non2xx}`,
          '',
        ]
      }
      return [
        `--- ${t.label} ---`,
        `Iterations: ${t.iterations}, Concurrency: ${t.concurrency}, Errors: ${t.errors}`,
        `Latency (ms): avg=${t.latencyMs.avg} min=${t.latencyMs.min} p50=${t.latencyMs.p50} p95=${t.latencyMs.p95} max=${t.latencyMs.max}`,
        '',
      ]
    }),
  ].join('\n')
  fs.writeFileSync(path.join(LOG_DIR, 'performance-results.log'), textLog)
  console.log('\nSaved logs/performance-results.json and logs/performance-results.log')
}

main().catch((err) => {
  console.error('Performance test crashed:', err)
  process.exit(1)
})
