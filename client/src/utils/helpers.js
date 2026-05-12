export const calculateTotal = (cart) =>
  cart.reduce((sum, item) => sum + item.prixUnitaire * item.selectedQuantity, 0);

export const filterOpenConcerts = (concerts) =>
  concerts.filter(c => c.statut === 'ouvert');

export const isQuantityValid = (qty) =>
  Number.isInteger(qty) && qty >= 1 && qty <= 6;

export const isStockSufficient = (stock, qty) => qty <= stock;

export const isConcertReservable = (concert) => {
  if (concert.statut !== 'ouvert') return false;
  if (concert.stock <= 0) return false;
  const now = new Date();
  if (concert.heure) {
    return new Date(`${concert.date}T${concert.heure}`) > now;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(concert.date) >= today;
};

export const validatePostalCode = (cp) => /^\d{5}$/.test(cp);

export const validateCardExpiry = (exp) => {
  const parts = exp.split('/');
  if (parts.length !== 2) return false;
  const m = parseInt(parts[0]);
  const y = parseInt(parts[1]);
  if (isNaN(m) || isNaN(y) || m < 1 || m > 12) return false;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = parseInt(now.getFullYear().toString().slice(-2));
  if (y < currentYear) return false;
  if (y === currentYear && m < currentMonth) return false;
  return true;
};

export const validateCVV = (cvv) => cvv.length >= 3 && cvv.length <= 4;

export const validateCardNumber = (num) => num.length === 16;
