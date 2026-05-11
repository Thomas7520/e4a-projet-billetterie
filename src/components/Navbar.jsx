import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import './Navbar.css';


function Navbar() {
  const { cart } = useCart();

  return (
    <nav className="navbar">
      <div className="nav-logo">Billetterie</div>
      <ul className="nav-links">
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/login">Connexion</Link></li>
        <li><Link to="/cart">🛒 Panier ({cart.length})</Link></li>
      </ul>
    </nav>
  );
}
export default Navbar;