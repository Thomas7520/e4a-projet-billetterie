import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import './PaymentForm.css';
import toast from 'react-hot-toast';

function PaymentForm() {
  const navigate = useNavigate();
  const { calculateTotal, finalizeOrder, cart } = useCart();
  const { user } = useUser();

  const [form, setForm] = useState({
    nom: '', prenom: '', adresse: '', ville: '', cp: '',
    cardNum: '', exp: '', cvv: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) setForm(prev => ({ ...prev, nom: user.nom || '', prenom: user.prenom || '' }));
  }, [user]);

  const handleExpiryChange = (e) => {
    const value = e.target.value;
    if (value.length < form.exp.length) { setForm({ ...form, exp: value }); return; }
    let digits = value.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length >= 2) formatted = digits.substring(0, 2) + '/' + digits.substring(2, 4);
    setForm({ ...form, exp: formatted });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) { navigate('/login'); return; }

    if (!/^\d{5}$/.test(form.cp)) {
      toast.error('Le code postal doit contenir exactement 5 chiffres.');
      return;
    }

    const [month, year] = form.exp.split('/');
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = parseInt(now.getFullYear().toString().slice(-2));
    if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
      toast.error("Mois d'expiration invalide (01-12).");
      return;
    }
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      toast.error('La carte est expirée.');
      return;
    }

    if (form.cvv.length < 3 || form.cvv.length > 4) {
      toast.error('Le CVV doit contenir 3 ou 4 chiffres.');
      return;
    }
    if (form.cardNum.length < 16) {
      toast.error('Numéro de carte incomplet.');
      return;
    }

    const total = calculateTotal();
    const ticketCount = cart.reduce((sum, item) => sum + item.selectedQuantity, 0);

    setIsLoading(true);
    try {
      const paymentRes = await fetch('http://localhost:5000/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber: form.cardNum, cvv: form.cvv, expiration: form.exp, total }),
      });

      if (!paymentRes.ok) {
        const data = await paymentRes.json();
        navigate('/checkout', { state: { error: data.error || 'Paiement refusé', total } });
        return;
      }

      const orderResult = await finalizeOrder(user.id);
      if (orderResult?.error) {
        navigate('/checkout', { state: { error: orderResult.error, total } });
        return;
      }

      navigate('/checkout', { state: { total, ticketCount } });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="payment-form-container">
      <form className="payment-card" onSubmit={handleSubmit}>
        <h2>Facturation & Paiement</h2>
        <p className="total-to-pay">Montant à régler : <strong>{calculateTotal()} €</strong></p>

        <div className="form-section">
          <h3>Informations Personnelles</h3>
          <div className="row">
            <input type="text" placeholder="Prénom" value={form.prenom} required
              onChange={e => setForm({ ...form, prenom: e.target.value })} />
            <input type="text" placeholder="Nom" value={form.nom} required
              onChange={e => setForm({ ...form, nom: e.target.value })} />
          </div>
          <input type="text" placeholder="Adresse de facturation" required
            onChange={e => setForm({ ...form, adresse: e.target.value })} />
          <div className="row">
            <input type="text" placeholder="Ville" required
              onChange={e => setForm({ ...form, ville: e.target.value })} />
            <input type="text" placeholder="CP (ex: 75001)" maxLength="5" value={form.cp} required
              onChange={e => setForm({ ...form, cp: e.target.value.replace(/\D/g, '') })}
              inputMode="numeric" />
          </div>
        </div>

        <div className="form-section">
          <h3>Détails de la Carte</h3>
          <div className="card-input-wrapper">
            <input type="text" placeholder="Numéro de carte" maxLength="16" value={form.cardNum} required
              onChange={e => setForm({ ...form, cardNum: e.target.value.replace(/\D/g, '') })}
              inputMode="numeric" />
            <div className="card-logos">
              <span className={form.cardNum.startsWith('4') ? 'active' : ''}>Visa</span>
              <span className={form.cardNum.startsWith('5') ? 'active' : ''}>Mastercard</span>
            </div>
          </div>
          <div className="row">
            <input type="text" placeholder="MM/YY" value={form.exp} maxLength="5" required
              onChange={handleExpiryChange} />
            <input type="text" placeholder="CVV" maxLength="4" value={form.cvv} required
              onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '') })}
              inputMode="numeric" />
          </div>
        </div>

        <button type="submit" className="btn-pay-final" disabled={isLoading}>
          {isLoading ? 'Traitement en cours...' : 'Confirmer le paiement'}
        </button>
      </form>
    </div>
  );
}

export default PaymentForm;
