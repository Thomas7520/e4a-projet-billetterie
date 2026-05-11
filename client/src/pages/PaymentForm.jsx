import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './PaymentForm.css';

function PaymentForm() {
  const navigate = useNavigate();
  const { calculateTotal } = useCart();
  const [form, setForm] = useState({
    nom: '', prenom: '', adresse: '', ville: '', cp: '',
    cardNum: '', exp: '', cvv: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulation d'une validation technique
    if (form.cardNum.length < 16 || form.cvv.length < 3) {
      alert("Informations de carte invalides (Test V&V)");
      return;
    }
    navigate('/checkout'); // Vers la page de chargement/succès
  };

  return (
    <div className="payment-form-container">
      <form className="payment-card" onSubmit={handleSubmit}>
        <h2>Facturation & Paiement</h2>
        <p className="total-to-pay">Montant à régler : <strong>{calculateTotal()} €</strong></p>

        <div className="form-section">
          <h3>Informations Personnelles</h3>
          <div className="row">
            <input type="text" placeholder="Prénom" required onChange={e => setForm({...form, prenom: e.target.value})} />
            <input type="text" placeholder="Nom" required onChange={e => setForm({...form, nom: e.target.value})} />
          </div>
          <input type="text" placeholder="Adresse de facturation" required onChange={e => setForm({...form, adresse: e.target.value})} />
          <div className="row">
            <input type="text" placeholder="Ville" required onChange={e => setForm({...form, ville: e.target.value})} />
            <input type="text" placeholder="Code Postal" required onChange={e => setForm({...form, cp: e.target.value})} />
          </div>
        </div>

        <div className="form-section">
          <h3>Détails de la Carte</h3>
          <div className="card-input-wrapper">
            <input 
              type="text" 
              placeholder="0000 0000 0000 0000" 
              maxLength="16" 
              required 
              onChange={e => setForm({...form, cardNum: e.target.value})}
            />
            <div className="card-logos">
              <span className={form.cardNum.startsWith('4') ? 'active' : ''}>Visa</span>
              <span className={form.cardNum.startsWith('5') ? 'active' : ''}>Mastercard</span>
            </div>
          </div>
          <div className="row">
            <input type="text" placeholder="MM/YY" maxLength="5" required onChange={e => setForm({...form, exp: e.target.value})} />
            <input type="text" placeholder="CVV" maxLength="3" required onChange={e => setForm({...form, cvv: e.target.value})} />
          </div>
        </div>

        <button type="submit" className="btn-pay-final">Confirmer le paiement</button>
      </form>
    </div>
  );
}

export default PaymentForm;