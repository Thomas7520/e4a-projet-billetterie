
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Login.css';

import toast from 'react-hot-toast';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    nom: '',
    prenom: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useUser();

  // Regex de validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pass) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Format d\'email invalide.');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial (@$!%*?&).');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!isLogin && (!formData.nom || !formData.prenom)) {
      setError('Veuillez renseigner votre nom et prénom.');
      return;
    }

    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nom: formData.nom,
          prenom: formData.prenom
        })
      });

      const data = await response.json();

      if (data.success) {
        login(isLogin ? data.user : { id: data.userId, ...formData });
        navigate('/'); 

        toast.success(isLogin ? `Ravi de vous revoir, ${data.user.prenom} !` : "Compte créé avec succès !");
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur. Vérifiez qu'il est lancé.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
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
          {!isLogin && (
            <div className="row">
              <div className="form-group">
                <label>Prénom</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  placeholder="Jean"
                />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  placeholder="Dupont"
                />
              </div>
            </div>
          )}

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

          {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}

          <button type="submit" className="btn-login">
            {isLogin ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;