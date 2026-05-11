import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Checkout.css';

function Checkout() {
  const [isProcessing, setIsProcessing] = useState(true);
  const { cart, calculateTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  // On stocke le total avant de vider le panier
  const [finalTotal] = useState(calculateTotal());
  const [ticketCount] = useState(cart.length);

  useEffect(() => {
    // Simulation du délai bancaire
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleReturn = () => {
    clearCart();
    navigate('/');
  };

  return (
    <div className="checkout-container">
      {isProcessing ? (
        <div className="loader-wrapper">
          <h2>Vérification de la transaction...</h2>
          <div className="loader"></div>
          <p>Communication sécurisée avec votre banque</p>
        </div>
      ) : (
        <div className="success-card">
          <div className="success-icon"></div> {/* L'icône SVG vient du CSS */}
          <h1>Paiement Accepté</h1>
          <p>Votre commande a été validée avec succès.</p>
          
          <div className="order-info">
            <p><strong>Total payé :</strong> {finalTotal} €</p>
            <p><strong>Billets réservés :</strong> {ticketCount}</p>
            <p><strong>N° de transaction :</strong> TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>

          <button className="btn-buy" onClick={handleReturn}>
            Retourner à l'accueil
          </button>
        </div>
      )}
    </div>
  );
}

export default Checkout;