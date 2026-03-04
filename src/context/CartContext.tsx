'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface CartItem {
  _id: string;
  name: string;
  nameEn: string;
  price: number;
  quantity: number;
  image: string;
  slug?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  validateCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Validate cart items against current product data
  const validateCart = async () => {
    if (items.length === 0) return;

    try {
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          try {
            // Fetch latest product data
            const res = await axios.get(`/api/products?id=${item._id}`);
            const product = res.data;

            if (!product) {
              // Product no longer exists - remove from cart
              return null;
            }

            // Check if price changed
            const currentPrice = product.isOnSale && product.salePrice 
              ? product.salePrice 
              : product.price;

            // If price changed, update with new price
            if (currentPrice !== item.price) {
              return {
                ...item,
                name: product.name,
                nameEn: product.nameEn,
                price: currentPrice,
                image: product.images?.[0] || item.image,
                slug: product.slug,
              };
            }

            // Product exists and price same - keep as is
            return item;
          } catch (error) {
            // Product not found or error - remove from cart
            console.error('Error validating cart item:', error);
            return null;
          }
        })
      );

      // Filter out null items (deleted products)
      const validItems = updatedItems.filter((item): item is CartItem => item !== null);
      
      if (validItems.length !== items.length) {
        setItems(validItems);
      }
    } catch (error) {
      console.error('Error validating cart:', error);
    }
  };

  // Validate cart on mount and when items change
  useEffect(() => {
    validateCart();
  }, []);

  const addToCart = (product: any) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item._id === product._id);
      
      const currentPrice = product.isOnSale && product.salePrice 
        ? product.salePrice 
        : product.price;

      if (existingItem) {
        return currentItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, {
        _id: product._id,
        name: product.name,
        nameEn: product.nameEn,
        price: currentPrice,
        quantity: 1,
        image: product.images?.[0] || '',
        slug: product.slug,
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item._id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item._id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      validateCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}