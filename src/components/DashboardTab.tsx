import { useEffect, useRef } from 'react'
import type { Transaction, Product } from '../types/inventory'
import {
    Chart,
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    Tooltip,
    Filler,
} from 'chart.js'

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler)

type Props = {
    transactions: Transaction[]
    products: Product[]
}

export default function DashboardTab({ transactions, products }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const chartRef = useRef<Chart | null>(null)

    const totalSold = transactions.reduce((s, t) => s + t.qty_sold, 0)

    // Group transactions by date
    const salesByDate: Record<string, number> = {}
    transactions.forEach(t => {
        const date = new Date(t.sold_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        salesByDate[date] = (salesByDate[date] || 0) + t.qty_sold
    })
    const labels = Object.keys(salesByDate)
    const data = Object.values(salesByDate)

    useEffect(() => {
        if (!canvasRef.current) return
        if (chartRef.current) chartRef.current.destroy()

        chartRef.current = new Chart(canvasRef.current, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['No data'],
                datasets: [{
                    label: 'Units sold',
                    data: data.length ? data : [0],
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    pointBackgroundColor: '#000000',
                    pointRadius: 4,
                    borderWidth: 1.5,
                    tension: 0.3,
                    fill: true,
                }],
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { color: '#888', font: { size: 12 } },
                    },
                    y: {
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { color: '#888', font: { size: 12 }, stepSize: 1 },
                        beginAtZero: true,
                    },
                },
            },
        })

        return () => { chartRef.current?.destroy() }
    }, [transactions])

    return (
        <div className="space-y-5">
            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total sold', value: totalSold },
                    { label: 'Transactions', value: transactions.length },
                    { label: 'Products', value: products.length },
                ].map(m => (
                    <div key={m.label} className="bg-black/[0.03] rounded-xl p-4 text-center">
                        <p className="text-2xl font-medium">{m.value}</p>
                        <p className="text-xs text-black/40 mt-1">{m.label}</p>
                    </div>
                ))}
            </div>

            {/* Line graph */}
            <div className="border border-black/10 rounded-xl p-5 bg-white">
                <p className="text-sm font-medium mb-4">Sales over time</p>
                <canvas ref={canvasRef} height={220} />
            </div>

            {/* Recent transactions */}
            <div className="border border-black/10 rounded-xl p-5 bg-white">
                <p className="text-sm font-medium mb-4">Recent transactions</p>
                {transactions.length === 0 ? (
                    <p className="text-sm text-black/30 text-center py-6">No transactions yet.</p>
                ) : (
                    <div className="divide-y divide-black/5">
                        {[...transactions].reverse().slice(0, 8).map(t => (
                            <div key={t.id} className="flex items-center justify-between py-3">
                                <div>
                                    <span className="text-sm font-medium">{t.product_name}</span>
                                    <span className="text-xs text-black/40 ml-2">
                                        {new Date(t.sold_at).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric',
                                        })}{' '}
                                        {new Date(t.sold_at).toLocaleTimeString([], {
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <span className="text-xs border border-black/10 rounded-full px-2.5 py-0.5 text-black/50">
                                    -{t.qty_sold}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}