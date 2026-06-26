import { useState } from 'react'
import type { Product, Category } from '../types/inventory'
import { supabase } from '../lib/supabase'

type Props = {
    products: Product[]
    categories: Category[]
    onAdd: (id: number, name: string, qty: number, category_id: number) => void
    onRemove: (id: number) => void
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

export default function ProductsTab({ products, categories, onAdd, onRemove }: Props) {
    const [name, setName] = useState('')
    const [qty, setQty] = useState('')
    const [categoryId, setCategoryId] = useState<string>('')
    const [error, setError] = useState<string>('')

    async function handleAdd() {
        setError('')
        const parsedQty = parseFloat(qty)

        if (!name.trim()) {
            setError('Product name is required.')
            return
        }
        if (!categoryId) {
            setError('Please select a category.')
            return
        }
        if (isNaN(parsedQty) || parsedQty <= 0) {
            setError('Please enter a valid quantity in kg.')
            return
        }

        const payload = {
            name: name.trim(),
            qty: parsedQty,
            category_id: parseInt(categoryId),
        }

        const { data, error: supabaseError } = await supabase
            .from('products')
            .insert(payload)
            .select()
            .single()

        if (supabaseError) {
            console.error(supabaseError.message)
            setError('Failed to add product. Please try again.')
            return
        }

        onAdd(data.id, name.trim(), parsedQty, parseInt(categoryId))
        setName('')
        setQty('')
        setCategoryId('')
    }

    const inputClass = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
    const inputStyle = {
        borderColor: '#E2DDD6',
        backgroundColor: 'white',
        color: '#1C1C1A',
    }

    return (
        <div className="space-y-5">
            {/* Add Product Form */}
            <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'white', border: '1px solid #E2DDD6' }}
            >
                <p className="text-sm font-semibold mb-4" style={{ color: '#1C1C1A' }}>
                    Add product
                </p>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: '#9C9A94' }}>
                            Product name <span style={{ color: '#C0616A' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Tomato"
                            className={inputClass}
                            style={inputStyle}
                            onFocus={e => (e.currentTarget.style.borderColor = '#5C8A5A')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#E2DDD6')}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: '#9C9A94' }}>
                            Category <span style={{ color: '#C0616A' }}>*</span>
                        </label>
                        <select
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            className={inputClass}
                            style={{
                                ...inputStyle,
                                appearance: 'auto',
                                color: categoryId ? '#1C1C1A' : '#9C9A94',
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = '#5C8A5A')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#E2DDD6')}
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map(c => (
                                <option key={c.category_id} value={c.category_id}>
                                    {c.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: '#9C9A94' }}>
                            Quantity (kg) <span style={{ color: '#C0616A' }}>*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={qty}
                                onChange={e => setQty(e.target.value)}
                                placeholder="e.g. 12.5"
                                min={0.01}
                                step={0.01}
                                className={inputClass}
                                style={{ ...inputStyle, paddingRight: '2.5rem' }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#5C8A5A')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#E2DDD6')}
                            />
                            <span
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none"
                                style={{ color: '#9C9A94' }}
                            >
                                kg
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="mt-3 text-xs" style={{ color: '#C0616A' }}>
                        {error}
                    </p>
                )}

                <button
                    onClick={handleAdd}
                    className="mt-4 text-sm px-5 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: '#3D6B3A', color: 'white' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2F5229')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#3D6B3A')}
                >
                    Add product
                </button>
            </div>

            {/* Product List */}
            <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'white', border: '1px solid #E2DDD6' }}
            >
                <p className="text-sm font-semibold mb-4" style={{ color: '#1C1C1A' }}>
                    Inventory
                </p>

                {products.length === 0 ? (
                    <p className="text-sm text-center py-8" style={{ color: '#C5C2BB' }}>
                        No products yet. Add one above.
                    </p>
                ) : (
                    <div className="divide-y" style={{ borderColor: '#F0EDE6' }}>
                        {products.map(p => {
                            const catStyle = getCategoryStyle(p.category_id)
                            const cat = categories.find(c => c.category_id === p.category_id)
                            return (
                                <div key={p.id} className="flex items-center justify-between py-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium" style={{ color: '#1C1C1A' }}>
                                            {p.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-xs rounded-full px-2.5 py-0.5"
                                                style={{ backgroundColor: '#F3F2EF', color: '#6B6A66' }}
                                            >
                                                {p.qty} kg
                                            </span>
                                            {cat && (
                                                <span
                                                    className="text-xs rounded-full px-2.5 py-0.5 flex items-center gap-1"
                                                    style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
                                                >
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full inline-block"
                                                        style={{ backgroundColor: catStyle.dot }}
                                                    />
                                                    {cat.category_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemove(p.id)}
                                        className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                                        style={{ borderColor: '#FADADD', color: '#C0616A', backgroundColor: 'transparent' }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEF1F2')}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}