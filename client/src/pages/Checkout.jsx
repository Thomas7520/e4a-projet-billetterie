import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Checkout.css';

function Checkout() {
  const [isProcessing, setIsProcessing] = useState(true);
  const { cart, calculateTotal, finalizeOrder } = useCart(); 
  const navigate = useNavigate();
  
  const [finalTotal] = useState(calculateTotal());
  const [ticketCount] = useState(
    cart.reduce((sum, item) => sum + item.selectedQuantity, 0)
  );
  useEffect(() => {
    const timer = setTimeout(async () => {
      await finalizeOrder(); // succès paiement
      setIsProcessing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleReturn = () => {
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
          <div className="success-icon"></div>
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