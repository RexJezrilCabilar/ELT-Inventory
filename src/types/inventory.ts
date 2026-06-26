export type Category = {
    category_id: number
    category_name: string
}

export type Product = {
    id: number
    name: string
    qty: number        // float4 in Supabase (kg)
    category_id: number | null
    created_at?: string
}

export type Transaction = {
    id: number
    product_id: number
    product_name: string
    qty_sold: number   // float4 in Supabase (kg)
    sold_at: string
}

export type SalesByDate = {
    date: string
    total: number
}