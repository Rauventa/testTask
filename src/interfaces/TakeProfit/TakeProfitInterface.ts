export interface ITakeProfitRow {
  id: number,
  profitPercent: number,
  price: number,
  sellAmount: number,
}

export interface ITakeProfitErrors {
  profitPercent?: string,
  price?: string,
  amount?: string
}