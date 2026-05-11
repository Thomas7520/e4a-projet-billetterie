import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [concerts, setConcerts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/concerts')
      .then(res => res.json())
      .then(data => setConcerts(data));
  }, []);

  const addToCart = (concert, quantity) => {
    setCart(prev => [...prev, { ...concert, selectedQuantity: quantity }]);
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
    <CartContext.Provider value={{ concerts, cart, addToCart, removeFromCart, finalizeOrder, calculateTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);