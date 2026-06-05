import { useState } from 'react'
import type { Product } from '../types/inventory'

type Props = {
    products: Product[]
    onAdd: (name: string, qty: number) => void
    onRemove: (id: number) => void
}

export default function ProductsTab({ products, onAdd, onRemove }: Props) {
    const [name, setName] = useState('')
    const [qty, setQty] = useState('')

    function handleAdd() {
        const parsedQty = parseInt(qty)
        if (!name.trim() || isNaN(parsedQty) || parsedQty < 1) return
        onAdd(name.trim(), parsedQty)
        setName('')
        setQty('')
    }

    return (
        <div className="space-y-6">
            {/* Add Product Form */}
            <div className="border border-black/10 rounded-xl p-5 bg-white">
                <p className="text-sm font-medium mb-4">Add product</p>

                <label className="text-xs text-black/50 block mb-1">Product name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Rice (5kg)"
                    className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-black/40"
                />

                <label className="text-xs text-black/50 block mb-1">Quantity</label>
                <input
                    type="number"
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    placeholder="e.g. 50"
                    min={1}
                    className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:border-black/40"
                />

                <button
                    onClick={handleAdd}
                    className="bg-black text-white text-sm px-5 py-2 rounded-lg hover:bg-black/80 transition-colors"
                >
                    Add product
                </button>
            </div>

            {/* Product List */}
            <div className="border border-black/10 rounded-xl p-5 bg-white">
                <p className="text-sm font-medium mb-4">Inventory</p>

                {products.length === 0 ? (
                    <p className="text-sm text-black/30 text-center py-8">No products yet.</p>
                ) : (
                    <div className="divide-y divide-black/5">
                        {products.map(p => (
                            <div key={p.id} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">{p.name}</span>
                                    <span className="text-xs border border-black/10 rounded-full px-2.5 py-0.5 text-black/50">
                                        {p.qty} in stock
                                    </span>
                                </div>
                                <button
                                    onClick={() => onRemove(p.id)}
                                    className="text-xs border border-red-200 text-red-400 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}