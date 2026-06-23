import { useEffect, useRef, useState } from 'react'
import type { Transaction, Product, Category } from '../types/inventory'
import {
    Chart,
    BarElement,
    BarController,
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    Tooltip,
    Filler,
} from 'chart.js'

Chart.register(
    BarElement,
    BarController,
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    Tooltip,
    Filler,
)

type Props = {
    transactions: Transaction[]
    products: Product[]
    categories: Category[]
}

const CATEGORY_COLORS: Record<number, { bar: string; barBg: string; dot: string }> = {
    1: { bar: '#3D8B45', barBg: '#D0EAD2', dot: '#4CAF50' },   // Fresh Produce
    2: { bar: '#C0524B', barBg: '#F5CECA', dot: '#E57373' },   // Meat
    3: { bar: '#B8882A', barBg: '#F8E8C0', dot: '#F5B942' },   // Eggs
    4: { bar: '#4A6CC0', barBg: '#C9D5F5', dot: '#5C7ADB' },   // Grains
}

const DEFAULT_COLOR = { bar: '#6B7B6A', barBg: '#D8DDD8', dot: '#9C9A94' }

export default function DashboardTab({ transactions, products, categories }: Props) {
    const salesChartRef = useRef<HTMLCanvasElement>(null)
    const salesChart = useRef<Chart | null>(null)
    const trendChartRef = useRef<HTMLCanvasElement>(null)
    const trendChart = useRef<Chart | null>(null)

    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    // Filter products by selected category
    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => String(p.category_id) === selectedCategory)

    const filteredProductIds = new Set(filteredProducts.map(p => p.id))

    // Filter transactions by filtered products
    const filteredTransactions = transactions.filter(t => filteredProductIds.has(t.product_id))

    // Metric calculations
    const totalSold = filteredTransactions.reduce((s, t) => s + t.qty_sold, 0)
    const totalTransactions = filteredTransactions.length
    const productCount = filteredProducts.length

    // Sales per product (bar chart)
    const salesByProduct: Record<string, number> = {}
    filteredTransactions.forEach(t => {
        salesByProduct[t.product_name] = (salesByProduct[t.product_name] || 0) + t.qty_sold
    })
    const barLabels = Object.keys(salesByProduct)
    const barData = Object.values(salesByProduct)

    // Sales over time (line chart)
    const salesByDate: Record<string, number> = {}
    filteredTransactions.forEach(t => {
        const date = new Date(t.sold_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        salesByDate[date] = (salesByDate[date] || 0) + t.qty_sold
    })
    const lineLabels = Object.keys(salesByDate)
    const lineData = Object.values(salesByDate)

    const catId = selectedCategory !== 'all' ? parseInt(selectedCategory) : null
    const catColor = catId && CATEGORY_COLORS[catId] ? CATEGORY_COLORS[catId] : DEFAULT_COLOR

    // Bar chart
    useEffect(() => {
        if (!salesChartRef.current) return
        if (salesChart.current) salesChart.current.destroy()

        salesChart.current = new Chart(salesChartRef.current, {
            type: 'bar',
            data: {
                labels: barLabels.length ? barLabels : ['No data'],
                datasets: [{
                    label: 'Units sold',
                    data: barData.length ? barData : [0],
                    backgroundColor: catColor.barBg,
                    borderColor: catColor.bar,
                    borderWidth: 1.5,
                    borderRadius: 6,
                }],
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9C9A94', font: { size: 11 } },
                        border: { display: false },
                    },
                    y: {
                        grid: { color: '#F0EDE6' },
                        ticks: { color: '#9C9A94', font: { size: 11 }, stepSize: 1 },
                        beginAtZero: true,
                        border: { display: false },
                    },
                },
            },
        })

        return () => { salesChart.current?.destroy() }
    }, [filteredTransactions, selectedCategory])

    // Line chart
    useEffect(() => {
        if (!trendChartRef.current) return
        if (trendChart.current) trendChart.current.destroy()

        trendChart.current = new Chart(trendChartRef.current, {
            type: 'line',
            data: {
                labels: lineLabels.length ? lineLabels : ['No data'],
                datasets: [{
                    label: 'Units sold',
                    data: lineData.length ? lineData : [0],
                    borderColor: catColor.bar,
                    backgroundColor: catColor.barBg + '66',
                    pointBackgroundColor: catColor.bar,
                    pointRadius: 4,
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                }],
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9C9A94', font: { size: 11 } },
                        border: { display: false },
                    },
                    y: {
                        grid: { color: '#F0EDE6' },
                        ticks: { color: '#9C9A94', font: { size: 11 }, stepSize: 1 },
                        beginAtZero: true,
                        border: { display: false },
                    },
                },
            },
        })

        return () => { trendChart.current?.destroy() }
    }, [filteredTransactions, selectedCategory])

    const cardStyle = {
        backgroundColor: 'white',
        border: '1px solid #E2DDD6',
        borderRadius: '16px',
        padding: '20px',
    }

    return (
        <div className="space-y-5">

            {/* Category slicer */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs px-3 py-1.5 rounded-full font-medium border transition-all"
                    style={
                        selectedCategory === 'all'
                            ? { backgroundColor: '#1C1C1A', color: 'white', borderColor: '#1C1C1A' }
                            : { backgroundColor: 'white', color: '#6B6A66', borderColor: '#E2DDD6' }
                    }
                >
                    All
                </button>
                {categories.map(c => {
                    const col = CATEGORY_COLORS[c.category_id] ?? DEFAULT_COLOR
                    const isActive = selectedCategory === String(c.category_id)
                    return (
                        <button
                            key={c.category_id}
                            onClick={() => setSelectedCategory(String(c.category_id))}
                            className="text-xs px-3 py-1.5 rounded-full font-medium border transition-all flex items-center gap-1.5"
                            style={
                                isActive
                                    ? {
                                        backgroundColor: col.bar,
                                        color: 'white',
                                        borderColor: col.bar,
                                    }
                                    : {
                                        backgroundColor: 'white',
                                        color: '#6B6A66',
                                        borderColor: '#E2DDD6',
                                    }
                            }
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: isActive ? 'white' : col.dot }}
                            />
                            {c.category_name}
                        </button>
                    )
                })}
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Units sold', value: totalSold },
                    { label: 'Transactions', value: totalTransactions },
                    { label: 'Products', value: productCount },
                ].map(m => (
                    <div
                        key={m.label}
                        className="rounded-2xl p-4 text-center"
                        style={{ backgroundColor: 'white', border: '1px solid #E2DDD6' }}
                    >
                        <p
                            className="text-2xl font-semibold"
                            style={{ color: catId ? catColor.bar : '#1C1C1A' }}
                        >
                            {m.value}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#9C9A94' }}>
                            {m.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Bar chart — units per product */}
            <div style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold" style={{ color: '#1C1C1A' }}>
                        Units sold by product
                    </p>
                    {selectedCategory !== 'all' && (
                        <span
                            className="text-xs px-2.5 py-0.5 rounded-full"
                            style={{ backgroundColor: catColor.barBg, color: catColor.bar }}
                        >
                            {categories.find(c => String(c.category_id) === selectedCategory)?.category_name}
                        </span>
                    )}
                </div>
                {barLabels.length === 0 ? (
                    <p className="text-sm text-center py-8" style={{ color: '#C5C2BB' }}>
                        No sales in this category yet.
                    </p>
                ) : (
                    <canvas ref={salesChartRef} height={200} />
                )}
            </div>

            {/* Line chart — trend over time */}
            <div style={cardStyle}>
                <p className="text-sm font-semibold mb-4" style={{ color: '#1C1C1A' }}>
                    Sales trend over time
                </p>
                {lineLabels.length === 0 ? (
                    <p className="text-sm text-center py-8" style={{ color: '#C5C2BB' }}>
                        No transactions recorded yet.
                    </p>
                ) : (
                    <canvas ref={trendChartRef} height={200} />
                )}
            </div>

            {/* Recent transactions */}
            <div style={cardStyle}>
                <p className="text-sm font-semibold mb-4" style={{ color: '#1C1C1A' }}>
                    Recent transactions
                </p>
                {filteredTransactions.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: '#C5C2BB' }}>
                        No transactions yet.
                    </p>
                ) : (
                    <div className="divide-y" style={{ borderColor: '#F0EDE6' }}>
                        {[...filteredTransactions].reverse().slice(0, 8).map(t => {
                            const prod = products.find(p => p.id === t.product_id)
                            const tCatId = prod?.category_id ?? null
                            const tColor = tCatId && CATEGORY_COLORS[tCatId]
                                ? CATEGORY_COLORS[tCatId]
                                : DEFAULT_COLOR
                            return (
                                <div key={t.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: tColor.dot }}
                                        />
                                        <div>
                                            <span className="text-sm font-medium" style={{ color: '#1C1C1A' }}>
                                                {t.product_name}
                                            </span>
                                            <span className="text-xs ml-2" style={{ color: '#9C9A94' }}>
                                                {new Date(t.sold_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric',
                                                })}{' '}
                                                {new Date(t.sold_at).toLocaleTimeString([], {
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className="text-xs rounded-full px-2.5 py-0.5 font-medium"
                                        style={{ backgroundColor: tColor.barBg, color: tColor.bar }}
                                    >
                                        −{t.qty_sold}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}