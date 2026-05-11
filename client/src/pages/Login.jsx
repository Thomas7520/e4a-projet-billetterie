import { useState } from 'react';
import './Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true); // Switch entre Login et Register
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pass) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pass);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Format d\'email invalide.');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.');
      return;
    }

    // Logique spécifique à l'inscription (Register)
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const mode = isLogin ? "Connexion" : "Inscription";
    alert(`${mode} réussie ! (Simulation)`);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* Les deux rectangles (onglets) au dessus */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Se connecter
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            S'inscrire
          </button>
        </div>

        <h2>{isLogin ? 'Connexion' : 'Créer un compte'}</h2>


        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Adresse Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="exemple@mail.com"
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              className="input-field" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>

          {/* Champ supplémentaire si on est en mode Inscription */}
          {!isLogin && (
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input 
                type="password" 
                className="input-field" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login">
            {isLogin ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;