export type Category = {
    id: number
    category_name: string
}

export type Product = {
    id: number
    name: string
    qty: number
    category_id: number | null
}

export type Transaction = {
    id: number
    product_id: number
    product_name: string
    qty_sold: number
    sold_at: string
}