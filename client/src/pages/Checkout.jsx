import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Checkout.css';

function Checkout() {
  const [isProcessing, setIsProcessing] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!state) { navigate('/'); return; }
    const timer = setTimeout(() => setIsProcessing(false), 2000);
    return () => clearTimeout(timer);
  }, [user, navigate, state]);

  if (!user || !state) return null;

  return (
    <div className="checkout-container">
      {isProcessing ? (
        <div className="loader-wrapper">
          <h2>Vérification de la transaction...</h2>
          <div className="loader"></div>
          <p>Utilisateur : {user.email}</p>
        </div>
      ) : state.error ? (
        <div className="failure-card">
          <div className="failure-icon"></div>
          <h1>Paiement refusé</h1>
          <p className="failure-reason">{state.error}</p>
          <button className="btn-retry" onClick={() => navigate('/payment')}>
            Réessayer
          </button>
        </div>
      ) : (
        <div className="success-card">
          <div className="success-icon"></div>
          <h1>Paiement Accepté</h1>
          <p>Merci {user.prenom}, votre commande est validée.</p>

          <div className="order-info">
            <p><strong>Total payé :</strong> {state.total} €</p>
            <p><strong>Billets réservés :</strong> {state.ticketCount}</p>
            <p><strong>N° de transaction :</strong> TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>

          <button className="btn-buy" onClick={() => navigate('/')}>
            Retourner à l'accueil
          </button>
        </div>
      )}
    </div>
  );
}

export default Checkout;
