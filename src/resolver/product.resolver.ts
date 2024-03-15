// // The root provides a resolver function for each API endpoint
// const root = {
//   product: ({ id }: { id: string }) => {
//     return products.find(product => product.id === id);
//   },
//   addProduct: ({ input }: { input: any }) => {
//     const newProduct = { id: String(products.length + 1), ...input };
//     products.push(newProduct);
//     return newProduct;
//   },
//   updateProduct: ({ id, input }: { id: string, input: any }) => {
//     const index = products.findIndex(product => product.id === id);
//     if (index === -1) {
//       throw new Error('Product not found');
//     }
//     products[index] = { id, ...input };
//     return products[index];
//   },
//   deleteProduct: ({ id }: { id: string }) => {
//     const index = products.findIndex(product => product.id === id);
//     if (index === -1) {
//       throw new Error('Product not found');
//     }
//     products.splice(index, 1);
//     return true;
//   },
// };