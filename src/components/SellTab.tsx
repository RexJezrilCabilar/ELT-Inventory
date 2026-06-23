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

export default function SellTab({ products, categories, onSell }: Props) {
    const [quantities, setQuantities] = useState<Record<number, string>>({})
    const [filterCategory, setFilterCategory] = useState<string>('all')

    const available = products.filter(p => {
        if (p.qty <= 0) return false
        if (filterCategory === 'all') return true
        return String(p.category_id) === filterCategory
    })

    function handleQtyChange(id: number, val: string) {
        setQuantities(prev => ({ ...prev, [id]: val }))
    }

    async function handleSell(product: Product) {
        const raw = quantities[product.id]
        const qty = parseInt(raw ?? '1')
        if (isNaN(qty) || qty < 1 || qty > product.qty) return

        const { error: updateError } = await supabase
            .from('products')
            .update({ qty: product.qty - qty })
            .eq('id', product.id)

        if (updateError) {
            console.error(updateError.message)
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
            return
        }

        onSell(product.id, qty)
        setQuantities(prev => ({ ...prev, [product.id]: '' }))
    }

    return (
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
                    style={{
                        borderColor: '#E2DDD6',
                        color: '#6B6A66',
                        backgroundColor: '#F7F5F0',
                    }}
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
                            <div key={p.id} className="flex items-center justify-between py-3">
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
                                    <span className="text-xs ml-4" style={{ color: '#9C9A94' }}>
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
                                        className="w-16 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                                        style={{
                                            borderColor: '#E2DDD6',
                                            backgroundColor: '#F7F5F0',
                                            color: '#1C1C1A',
                                        }}
                                        onFocus={e => (e.currentTarget.style.borderColor = '#5C8A5A')}
                                        onBlur={e => (e.currentTarget.style.borderColor = '#E2DDD6')}
                                    />
                                    <button
                                        onClick={() => handleSell(p)}
                                        className="text-sm px-4 py-1.5 rounded-lg font-medium transition-colors"
                                        style={{
                                            backgroundColor: '#3D6B3A',
                                            color: 'white',
                                        }}
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
    )
}