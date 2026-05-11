import { useState } from 'react';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  // Regex pour : 1 Maj, 1 Min, 1 Chiffre, 1 Caractère spécial, min 8 caractères
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation Email
    if (!validateEmail(formData.email)) {
      setError('Format d\'email invalide.');
      return;
    }

    // Validation Mot de passe
    if (!validatePassword(formData.password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial (@$!%*?&).');
      return;
    }

    alert("Validation réussie ! Connexion en cours...");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Connexion</h2>
        <p className="login-subtitle">Sécurité renforcée</p>

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

          {error && <div className="error-message" style={{ lineHeight: '1.4' }}>{error}</div>}

          <button type="submit" className="btn-login">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;