import { useState } from 'react'
import type { Product } from '../types/inventory'

type Props = {
    products: Product[]
    onSell: (productId: number, qty: number) => void
}

export default function SellTab({ products, onSell }: Props) {
    const [quantities, setQuantities] = useState<Record<number, string>>({})

    const available = products.filter(p => p.qty > 0)

    function handleQtyChange(id: number, val: string) {
        setQuantities(prev => ({ ...prev, [id]: val }))
    }

    function handleSell(product: Product) {
        const raw = quantities[product.id]
        const qty = parseInt(raw ?? '1')
        if (isNaN(qty) || qty < 1 || qty > product.qty) return
        onSell(product.id, qty)
        setQuantities(prev => ({ ...prev, [product.id]: '' }))
    }

    return (
        <div className="border border-black/10 rounded-xl p-5 bg-white">
            <p className="text-sm font-medium mb-4">Sell products</p>

            {available.length === 0 ? (
                <p className="text-sm text-black/30 text-center py-8">No products in inventory.</p>
            ) : (
                <div className="divide-y divide-black/5">
                    {available.map(p => (
                        <div key={p.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">{p.name}</span>
                                <span className="text-xs border border-black/10 rounded-full px-2.5 py-0.5 text-black/50">
                                    {p.qty} left
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    max={p.qty}
                                    value={quantities[p.id] ?? '1'}
                                    onChange={e => handleQtyChange(p.id, e.target.value)}
                                    className="w-16 text-center border border-black/15 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-black/40"
                                />
                                <button
                                    onClick={() => handleSell(p)}
                                    className="text-sm border border-black/15 px-4 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
                                >
                                    Sell
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}