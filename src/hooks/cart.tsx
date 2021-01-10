import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { cos } from 'react-native-reanimated';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const json = await AsyncStorage.getItem('@shoppingCart');
      const productStoraged = JSON.parse(json || '');
      setProducts(productStoraged);
    }

    loadProducts();
  }, []);

  async function updateProducts(updatedProducts: Product[]): Promise<void> {
    const productsJSON = JSON.stringify(updatedProducts);
    await AsyncStorage.setItem('@shoppingCart', productsJSON);
  }

  const increment = useCallback(
    async id => {
      const product = products.find(x => x.id === id);
      const productIndex = products.findIndex(x => x.id === id);

      if (product) {
        const newQuantity = product.quantity + 1;
        product.quantity = newQuantity;

        setProducts([
          ...products.slice(0, productIndex),
          product,
          ...products.slice(productIndex + 1),
        ]);
        updateProducts([
          ...products.slice(0, productIndex),
          product,
          ...products.slice(productIndex + 1),
        ]);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(x => x.id === id);
      const productIndex = products.findIndex(x => x.id === id);

      if (product) {
        const newQuantity = product.quantity - 1;
        if (newQuantity === 0) {
          setProducts([
            ...products.slice(0, productIndex),
            ...products.slice(productIndex + 1),
          ]);

          updateProducts([
            ...products.slice(0, productIndex),
            ...products.slice(productIndex + 1),
          ]);
        } else {
          product.quantity = newQuantity;

          setProducts([
            ...products.slice(0, productIndex),
            product,
            ...products.slice(productIndex + 1),
          ]);

          updateProducts([
            ...products.slice(0, productIndex),
            product,
            ...products.slice(productIndex + 1),
          ]);
        }
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const productExists = products.find(x => x.id === product.id);

      if (!productExists) {
        const newProduct = product;
        newProduct.quantity = 1;
        setProducts([...products, newProduct]);

        updateProducts([...products, newProduct]);
      } else {
        increment(product.id);
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
