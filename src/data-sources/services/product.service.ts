export interface IProductService<T> {
  createProducts(products: T[]): Promise<T[]>
  getProductById(id: string): Promise<T | null>
  getProductsByProducerId(producerId: string): Promise<T[]>
  updateProduct(product: T): Promise<T | null>
  deleteProducts(ids: string[]): Promise<boolean | any>
}
