import { useEffect, useMemo, useState } from 'react'
import { currencyApi } from '../../services/api'

type QuoteItem = {
  label: string
  buy: number | string
  sell: number | string
}

const fallbackQuotes: QuoteItem[] = [
  { label: 'Blue', buy: 1450, sell: 1470 },
  { label: 'MEP', buy: 1460, sell: 1465 },
  { label: 'CCL', buy: 1498, sell: 1499 },
  { label: 'Mayor.', buy: 1438, sell: 1447 },
  { label: 'Cripto', buy: 1528, sell: 1528 },
  { label: 'Tarj.', buy: 1840, sell: 1905 },
  { label: 'Oficial', buy: 1415, sell: 1465 }
]

export function MarketMarquee() {
  const [quotes, setQuotes] = useState<QuoteItem[]>(fallbackQuotes)

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const data = await currencyApi.getQuotes()
        if (Array.isArray(data) && data.length) {
          const mapped = data.map((quote: any) => ({
            label: quote.nombre || quote.casa || 'Dólar',
            buy: quote.compra ?? quote.buy ?? quote.compraVenta ?? 0,
            sell: quote.venta ?? quote.sell ?? quote.ventaCompra ?? 0
          })) as QuoteItem[]
          setQuotes(mapped)
        }
      } catch (error) {
        console.error('Error loading quotes:', error)
      }
    }
    loadQuotes()
    const timer = window.setInterval(loadQuotes, 5 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])

  const loopItems = useMemo(() => [...quotes, ...quotes], [quotes])

  return (
    <section className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Mercado</h2>
        <span className="text-[10px] text-muted">Cotizaciones en tiempo real</span>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-surface py-3 shadow-soft dark:border-white/10">
        <div className="market-marquee">
          <div className="market-track">
            {loopItems.map((quote, index) => (
              <div key={`${quote.label}-${index}`} className="market-chip">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold">{quote.label}</span>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-muted">
                    <span>Compra</span>
                    <span className="text-foreground">${Number(quote.buy).toLocaleString('es-AR')}</span>
                    <span>Venta</span>
                    <span className="text-foreground">${Number(quote.sell).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-surface to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-surface to-transparent" />
      </div>
    </section>
  )
}
