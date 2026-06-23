import { useState, useEffect } from 'react'
import type { Product, Transaction, Category } from '../types/inventory'
import { supabase } from '../lib/supabase'
import ProductsTab from '../components/ProductsTab'
import SellTab from '../components/SellTab'
import DashboardTab from '../components/DashboardTab'

type Tab = 'products' | 'sell' | 'dashboard'

export default function Inventory() {
    const [activeTab, setActiveTab] = useState<Tab>('products')
    const [products, setProducts] = useState<Product[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    async function handleSignOut() {
        await supabase.auth.signOut()
    }

    useEffect(() => {
        async function fetchData() {
            const [
                { data: productData },
                { data: transactionData },
                { data: categoryData },
            ] = await Promise.all([
                supabase.from('products').select('*').order('id', { ascending: true }),
                supabase.from('transactions').select('*').order('sold_at', { ascending: true }),
                supabase.from('category').select('*').order('category_id', { ascending: true }),
            ])

            if (productData) setProducts(productData)
            if (transactionData) setTransactions(transactionData)
            if (categoryData) setCategories(categoryData)
        }

        fetchData()
    }, [])

    function handleAddProduct(id: number, name: string, qty: number, category_id: number | null) {
        setProducts(prev => [...prev, { id, name, qty, category_id }])
    }

    function handleRemoveProduct(id: number) {
        setProducts(prev => prev.filter(p => p.id !== id))
    }

    async function handleSell(_productId: number, _qty: number) {
        // Re-fetch fresh data from Supabase instead of mutating local state
        const [{ data: productData }, { data: transactionData }] = await Promise.all([
            supabase.from('products').select('*').order('id', { ascending: true }),
            supabase.from('transactions').select('*').order('sold_at', { ascending: true }),
        ])

        if (productData) setProducts(productData)
        if (transactionData) setTransactions(transactionData)
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'products', label: 'Products' },
        { key: 'sell', label: 'Sell' },
        { key: 'dashboard', label: 'Dashboard' },
    ]

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F7F5F0' }}>
            <div className="max-w-2xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1
                            className="text-xl font-semibold tracking-tight"
                            style={{ color: '#1C1C1A' }}
                        >
                            ELT Inventory
                        </h1>
                        <p className="text-sm mt-1" style={{ color: '#9C9A94' }}>
                            Manage products and track sales
                        </p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                        style={{
                            borderColor: '#E2DDD6',
                            color: '#9C9A94',
                            backgroundColor: 'white',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#1C1C1A')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#9C9A94')}
                    >
                        Sign out
                    </button>
                </div>

                {/* Tabs */}
                <div
                    className="flex mb-6 p-1 rounded-xl gap-1"
                    style={{ backgroundColor: '#EDEAE3' }}
                >
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className="flex-1 px-4 py-2 text-sm rounded-lg transition-all font-medium"
                            style={
                                activeTab === t.key
                                    ? {
                                        backgroundColor: 'white',
                                        color: '#1C1C1A',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                    }
                                    : {
                                        backgroundColor: 'transparent',
                                        color: '#9C9A94',
                                    }
                            }
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {activeTab === 'products' && (
                    <ProductsTab
                        products={products}
                        categories={categories}
                        onAdd={handleAddProduct}
                        onRemove={handleRemoveProduct}
                    />
                )}
                {activeTab === 'sell' && (
                    <SellTab
                        products={products}
                        categories={categories}
                        onSell={handleSell}
                    />
                )}
                {activeTab === 'dashboard' && (
                    <DashboardTab
                        transactions={transactions}
                        products={products}
                        categories={categories}
                    />
                )}
            </div>
        </div>
    )
}