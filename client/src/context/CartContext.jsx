import { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [concerts, setConcerts] = useState([]);
  const [cart, setCart] = useState([]);

  const refreshConcerts = () => {
    fetch('http://localhost:5000/api/concerts')
      .then(res => res.json())
      .then(data => setConcerts(data));
  };

  useEffect(() => {
    refreshConcerts();
  }, []);

  const addToCart = (concert, quantity) => {
  // Chercher si l'article est déjà dans le panier
  const existingItemIndex = cart.findIndex(item => item.id === concert.id);
  
  let currentQtyInCart = 0;
  if (existingItemIndex !== -1) {
    currentQtyInCart = cart[existingItemIndex].selectedQuantity;
  }

  const totalRequested = currentQtyInCart + quantity;

  // Vérification stricte du stock 
  if (totalRequested > concert.stock) {
    toast.error(`Stock insuffisant ! Il ne reste que ${concert.stock} places.`);
    return false;
  }

  // Mise à jour ou Ajout
  if (existingItemIndex !== -1) {
    const newCart = [...cart];
    newCart[existingItemIndex].selectedQuantity = totalRequested;
    setCart(newCart);
  } else {
    setCart(prev => [...prev, { ...concert, selectedQuantity: quantity }]);
  }

  return true;
};

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.prixBase * item.selectedQuantity), 0);
  };

  const finalizeOrder = async (userId) => {
  if (!userId) return; 

  const total = calculateTotal();
  
  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      cart, 
      total, 
      userId: userId 
    })
  });

  if (response.ok) {
    const updatedRes = await fetch('http://localhost:5000/api/concerts');
    const updatedData = await updatedRes.json();
    setConcerts(updatedData);
    setCart([]);
  }
};

  return (
    <CartContext.Provider value={{ concerts, cart, addToCart, removeFromCart, finalizeOrder, calculateTotal, refreshConcerts }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);