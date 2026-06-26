import { useState } from 'react'
import type { Product, Category } from '../types/inventory'
import { supabase } from '../lib/supabase'

type Props = {
    products: Product[]
    categories: Category[]
    onSell: (productId: number, qty: number) => void
}

const CATEGORY_COLORS: Record<number, { bg: string; text: string; dot: string }> = {
    1: { bg: '#EBF5EC', text: '#2D6A35', dot: '#4CAF50' },
    2: { bg: '#FDECEA', text: '#7B2D2D', dot: '#E57373' },
    3: { bg: '#FEF9EC', text: '#7A5C1E', dot: '#F5B942' },
    4: { bg: '#EEF2FB', text: '#2D4070', dot: '#5C7ADB' },
}

function getCategoryStyle(categoryId: number | null) {
    if (!categoryId || !CATEGORY_COLORS[categoryId]) {
        return { bg: '#F3F2EF', text: '#6B6A66', dot: '#9C9A94' }
    }
    return CATEGORY_COLORS[categoryId]
}

function formatTimestamp(ts?: string) {
    if (!ts) return '—'
    return new Date(ts).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

type ConfirmState = {
    product: Product
    qty: number
} | null

export default function SellTab({ products, categories, onSell }: Props) {
    const [quantities, setQuantities] = useState<Record<number, string>>({})
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [confirm, setConfirm] = useState<ConfirmState>(null)

    const available = products.filter(p => {
        if (p.qty <= 0) return false
        if (filterCategory === 'all') return true
        return String(p.category_id) === filterCategory
    })

    function handleQtyChange(id: number, val: string) {
        setQuantities(prev => ({ ...prev, [id]: val }))
    }

    function handleSellAll(product: Product) {
        setQuantities(prev => ({ ...prev, [product.id]: String(product.qty) }))
    }

    function requestSell(product: Product) {
        const raw = quantities[product.id]
        const qty = parseFloat(raw ?? '0.1')
        if (isNaN(qty) || qty <= 0 || qty > product.qty) return
        setConfirm({ product, qty })
    }

    async function confirmSell() {
        if (!confirm) return
        const { product, qty } = confirm

        const { error: updateError } = await supabase
            .from('products')
            .update({ qty: product.qty - qty })
            .eq('id', product.id)

        if (updateError) {
            console.error(updateError.message)
            setConfirm(null)
            return
        }

        const { error: insertError } = await supabase
            .from('transactions')
            .insert({
                product_id: product.id,
                product_name: product.name,
                qty_sold: qty,
            })

        if (insertError) {
            console.error(insertError.message)
            setConfirm(null)
            return
        }

        onSell(product.id, qty)
        setQuantities(prev => ({ ...prev, [product.id]: '' }))
        setConfirm(null)
    }

    return (
        <>
            {/* Confirmation modal */}
            {confirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                >
                    <div
                        className="rounded-2xl p-6 w-full max-w-sm"
                        style={{ backgroundColor: 'white', border: '1px solid #E2DDD6' }}
                    >
                        <p className="text-sm font-semibold mb-1" style={{ color: '#1C1C1A' }}>
                            Confirm sale
                        </p>
                        <p className="text-sm mb-5" style={{ color: '#6B6A66' }}>
                            Sell <strong>{confirm.qty} kg</strong> of <strong>{confirm.product.name}</strong>?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfirm(null)}
                                className="flex-1 text-sm py-2 rounded-lg border font-medium transition-colors"
                                style={{ borderColor: '#E2DDD6', color: '#6B6A66', backgroundColor: 'transparent' }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F7F5F0')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSell}
                                className="flex-1 text-sm py-2 rounded-lg font-medium transition-colors"
                                style={{ backgroundColor: '#3D6B3A', color: 'white' }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2F5229')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#3D6B3A')}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'white', border: '1px solid #E2DDD6' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold" style={{ color: '#1C1C1A' }}>
                        Sell products
                    </p>
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none"
                        style={{ borderColor: '#E2DDD6', color: '#6B6A66', backgroundColor: '#F7F5F0' }}
                    >
                        <option value="all">All categories</option>
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>
                                {c.category_name}
                            </option>
                        ))}
                    </select>
                </div>

                {available.length === 0 ? (
                    <p className="text-sm text-center py-8" style={{ color: '#C5C2BB' }}>
                        No products in this category.
                    </p>
                ) : (
                    <div className="divide-y" style={{ borderColor: '#F0EDE6' }}>
                        {available.map(p => {
                            const catStyle = getCategoryStyle(p.category_id)
                            const cat = categories.find(c => c.category_id === p.category_id)
                            return (
                                <div key={p.id} className="py-4">
                                    {/* Product info row */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                {cat && (
                                                    <span
                                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: catStyle.dot }}
                                                    />
                                                )}
                                                <span className="text-sm font-medium" style={{ color: '#1C1C1A' }}>
                                                    {p.name}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-0.5 ml-4">
                                                <span className="text-xs" style={{ color: '#9C9A94' }}>
                                                    {p.qty} kg left
                                                </span>
                                                {p.created_at && (
                                                    <span className="text-xs" style={{ color: '#B0ADA6' }}>
                                                        Added {formatTimestamp(p.created_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sell controls row */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={0.1}
                                                step={0.1}
                                                max={p.qty}
                                                value={quantities[p.id] ?? '0.1'}
                                                onChange={e => handleQtyChange(p.id, e.target.value)}
                                                className="w-20 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                                                style={{
                                                    borderColor: '#E2DDD6',
                                                    backgroundColor: '#F7F5F0',
                                                    color: '#1C1C1A',
                                                    paddingRight: '1.8rem',
                                                }}
                                                onFocus={e => (e.currentTarget.style.borderColor = '#5C8A5A')}
                                                onBlur={e => (e.currentTarget.style.borderColor = '#E2DDD6')}
                                            />
                                            <span
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                                                style={{ color: '#9C9A94' }}
                                            >
                                                kg
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleSellAll(p)}
                                            className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
                                            style={{ borderColor: '#E2DDD6', color: '#6B6A66', backgroundColor: 'transparent' }}
                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F7F5F0')}
                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => requestSell(p)}
                                            className="text-sm px-4 py-1.5 rounded-lg font-medium transition-colors"
                                            style={{ backgroundColor: '#3D6B3A', color: 'white' }}
                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2F5229')}
                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#3D6B3A')}
                                        >
                                            Sell
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </>
    )
}