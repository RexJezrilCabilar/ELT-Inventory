import { useState } from 'react'
import ProductsTab from './components/ProductsTab'
import SellTab from './components/SellTab'
import DashboardTab from './components/DashboardTab'
import type { Product, Transaction } from './types/inventory'

type Tab = 'products' | 'sell' | 'dashboard'

export default function Inventory() {
    const [activeTab, setActiveTab] = useState<Tab>('products')
    const [products, setProducts] = useState<Product[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])

    function handleAddProduct(name: string, qty: number) {
        setProducts(prev => {
            const existing = prev.find(p => p.name.toLowerCase() === name.toLowerCase())
            if (existing) {
                return prev.map(p => p.id === existing.id ? { ...p, qty: p.qty + qty } : p)
            }
            return [...prev, { id: Date.now(), name, qty }]
        })
    }

    function handleRemoveProduct(id: number) {
        setProducts(prev => prev.filter(p => p.id !== id))
    }

    function handleSell(productId: number, qty: number) {
        const product = products.find(p => p.id === productId)
        if (!product) return

        setProducts(prev =>
            prev
                .map(p => p.id === productId ? { ...p, qty: p.qty - qty } : p)
                .filter(p => p.qty > 0)
        )

        setTransactions(prev => [
            ...prev,
            {
                id: Date.now(),
                product_id: productId,
                product_name: product.name,
                qty_sold: qty,
                sold_at: new Date().toISOString(),
            },
        ])
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'products', label: 'Products' },
        { key: 'sell', label: 'Sell' },
        { key: 'dashboard', label: 'Dashboard' },
    ]

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-xl font-medium">Inventory</h1>
                    <p className="text-sm text-black/40 mt-1">Manage your products and sales</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-black/10 mb-6">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`px-5 py-2.5 text-sm border-b-2 transition-colors ${
                                activeTab === t.key
                                    ? 'border-black text-black font-medium'
                                    : 'border-transparent text-black/40 hover:text-black/70'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {activeTab === 'products' && (
                    <ProductsTab
                        products={products}
                        onAdd={handleAddProduct}
                        onRemove={handleRemoveProduct}
                    />
                )}
                {activeTab === 'sell' && (
                    <SellTab
                        products={products}
                        onSell={handleSell}
                    />
                )}
                {activeTab === 'dashboard' && (
                    <DashboardTab
                        transactions={transactions}
                        products={products}
                    />
                )}
            </div>
        </div>
    )
}