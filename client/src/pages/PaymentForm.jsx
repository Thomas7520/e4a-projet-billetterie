import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext'; 
import './PaymentForm.css';

function PaymentForm() {
  const navigate = useNavigate();
  const { calculateTotal } = useCart();
  const { user } = useUser();

  const [form, setForm] = useState({
    nom: '', prenom: '', adresse: '', ville: '', cp: '',
    cardNum: '', exp: '', cvv: ''
  });
  const [error, setError] = useState('');

  // Pré-remplissage automatique (il pourra changer si besoin)
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        nom: user.nom || '',
        prenom: user.prenom || ''
      }));
    }
  }, [user]);


  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setForm({ ...form, exp: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');


    // Validation Code Postal Format FR: 5 chiffres
    if (!/^\d{5}$/.test(form.cp)) {
      setError("Le code postal doit contenir exactement 5 chiffres.");
      return;
    }

    // Validation Date d'expiration
    const [month, year] = form.exp.split('/');
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = parseInt(now.getFullYear().toString().slice(-2)); // Ex: 24

    if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
      setError("Mois d'expiration invalide (01-12).");
      return;
    }
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      setError("La carte est expirée.");
      return;
    }

    // Validation CVV 3 ou 4 chiffres
    if (form.cvv.length < 3 || form.cvv.length > 4) {
      setError("Le CVV doit contenir 3 ou 4 chiffres.");
      return;
    }

    // Validation Numéro de carte 
    if (form.cardNum.length < 16) {
      setError("Numéro de carte incomplet.");
      return;
    }

    navigate('/checkout');
  };

  return (
    <div className="payment-form-container">
      <form className="payment-card" onSubmit={handleSubmit}>
        <h2>Facturation & Paiement</h2>
        <p className="total-to-pay">Montant à régler : <strong>{calculateTotal()} €</strong></p>

        <div className="form-section">
          <h3>Informations Personnelles</h3>
          <div className="row">
            <input type="text" placeholder="Prénom" value={form.prenom} required 
                   onChange={e => setForm({...form, prenom: e.target.value})} />
            <input type="text" placeholder="Nom" value={form.nom} required 
                   onChange={e => setForm({...form, nom: e.target.value})} />
          </div>
          <input type="text" placeholder="Adresse de facturation" required 
                 onChange={e => setForm({...form, adresse: e.target.value})} />
          <div className="row">
            <input type="text" placeholder="Ville" required 
                   onChange={e => setForm({...form, ville: e.target.value})} />
            <input type="text" placeholder="CP (ex: 75001)" maxLength="5" required 
                   onChange={e => setForm({...form, cp: e.target.value.replace(/\D/g, '')})} />
          </div>
        </div>

        <div className="form-section">
          <h3>Détails de la Carte</h3>
          <div className="card-input-wrapper">
            <input type="text" placeholder="Numéro de carte" maxLength="16" required 
                   onChange={e => setForm({...form, cardNum: e.target.value.replace(/\D/g, '')})} />
            <div className="card-logos">
              <span className={form.cardNum.startsWith('4') ? 'active' : ''}>Visa</span>
              <span className={form.cardNum.startsWith('5') ? 'active' : ''}>Mastercard</span>
            </div>
          </div>
          <div className="row">
            <input type="text" placeholder="MM/YY" value={form.exp} maxLength="5" required 
                   onChange={handleExpiryChange} />
            <input type="text" placeholder="CVV" maxLength="4" required 
                   onChange={e => setForm({...form, cvv: e.target.value.replace(/\D/g, '')})} />
          </div>
        </div>

        {error && <div className="error-message" style={{marginBottom: '15px'}}>{error}</div>}

        <button type="submit" className="btn-pay-final">Confirmer le paiement</button>
      </form>
    </div>
  );
}

export default PaymentForm;