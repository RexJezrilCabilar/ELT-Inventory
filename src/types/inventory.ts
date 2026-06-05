export type Product = {
    id: number
    name: string
    qty: number
    created_at?: string
}

export type Transaction = {
    id: number
    product_id: number
    product_name: string
    qty_sold: number
    sold_at: string
}

export type SalesByDate = {
    date: string
    total: number
}