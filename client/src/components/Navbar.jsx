import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import './Navbar.css';

function Navbar() {
  useCart();
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      Billetterie
      
      <ul className="nav-links">
        <li><Link to="/">Accueil</Link></li>
        
        {user ? (
          <li className="nav-item-dropdown">
            <button 
              className="dropdown-trigger" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)} 
            >
              Mon Profil ▾
            </button>

            {isMenuOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="dropdown-orders">
                    Mes Commandes
                  </Link>
                </li>
                {user.role === 'admin' && (
                  <>
                    <li className="dropdown-divider"></li>
                    <li>
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="dropdown-admin">
                        Administration
                      </Link>
                    </li>
                  </>
                )}
                <li className="dropdown-divider"></li>
                <li>
                  <button onClick={handleLogout} className="dropdown-logout">
                    Se déconnecter
                  </button>
                </li>
              </ul>
            )}
          </li>
        ) : (
          <li><Link to="/login">Connexion</Link></li>
        )}
        
        <li>
          <Link to="/cart" className="nav-cart">
            🛒 Panier
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;