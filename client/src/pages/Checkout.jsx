import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext'; 
import './Checkout.css';

import toast from 'react-hot-toast';

function Checkout() {
  const [isProcessing, setIsProcessing] = useState(true);
  const { cart, calculateTotal, finalizeOrder } = useCart();
  const { user } = useUser(); 
  const navigate = useNavigate();
  
  const [finalTotal] = useState(calculateTotal());
  const [ticketCount] = useState(cart.reduce((sum, item) => sum + item.selectedQuantity, 0));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleReturn = async () => {
  try {
    const result = await finalizeOrder(user.id);
    if (result && result.error) {
      toast.error("Erreur lors de la validation : " + result.error);
    } else {
      navigate('/');
    }
  } catch (err) {
    toast.error("Une erreur technique est survenue.");
  }
};
  if (!user) return null;

  return (
    <div className="checkout-container">
      {isProcessing ? (
        <div className="loader-wrapper">
          <h2>Vérification de la transaction...</h2>
          <div className="loader"></div>
          <p>Utilisateur : {user.email}</p>
        </div>
      ) : (
        <div className="success-card">
          <div className="success-icon"></div>
          <h1>Paiement Accepté</h1>
          <p>Merci {user.prenom}, votre commande est validée.</p>
          
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