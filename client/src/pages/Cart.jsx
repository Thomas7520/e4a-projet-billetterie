import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

function Cart() {
  const { cart, removeFromCart, calculateTotal } = useCart();
  const navigate = useNavigate();

  return (
    
    <div className="cart-container">
      <h1>Mon Panier</h1>
      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.artiste}</span>
                  <span className="cart-item-details">{item.selectedQuantity} billet(s) x {item.prixBase} €</span>
                </div>
                <button className="btn-remove" onClick={() => removeFromCart(index)}>Supprimer</button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Total à régler</h3>
            <div className="total-price">{calculateTotal()} €</div>
              <button className="btn-checkout" onClick={() => navigate('/payment')}>
                Procéder au paiement
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default Cart;