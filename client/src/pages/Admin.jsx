import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './Admin.css';

const EMPTY_FORM = {
  titre: '', artiste: '', date: '', lieu: '',
  description: '', statut: 'ouvert', prixBase: '', stock: '',
};

const STATUT_COLORS = {
  ouvert: '#22c55e', complet: '#f59e0b',
  annulé: '#ef4444', terminé: '#6b7280', brouillon: '#a78bfa',
};

function Admin() {
  const { user } = useUser();
  const { concerts, refreshConcerts } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId
      ? `http://localhost:5000/api/admin/concerts/${editId}`
      : 'http://localhost:5000/api/admin/concerts';

    const res = await fetch(url, {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        userId: user.id,
        prixBase: parseFloat(form.prixBase),
        stock: parseInt(form.stock),
      }),
    });

    if (res.ok) {
      toast.success(editId ? 'Concert mis à jour !' : 'Concert créé !');
      setForm(EMPTY_FORM);
      setEditId(null);
      refreshConcerts();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Erreur lors de l\'opération');
    }
  };

  const handleEdit = (concert) => {
    setEditId(concert.id);
    setForm({
      titre: concert.titre,
      artiste: concert.artiste,
      date: concert.date,
      lieu: concert.lieu,
      description: concert.description || '',
      statut: concert.statut,
      prixBase: concert.prixBase,
      stock: concert.stock,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatut = async (id, statut) => {
    const res = await fetch(`http://localhost:5000/api/admin/concerts/${id}/statut`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, statut }),
    });
    if (res.ok) {
      toast.success(`Statut : ${statut}`);
      refreshConcerts();
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-container">
      <h1>Espace Administration</h1>

      <section className="admin-form-section">
        <h2>{editId ? `Modifier le concert #${editId}` : 'Créer un concert'}</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <input name="titre" value={form.titre} onChange={handleChange}
              placeholder="Titre *" required className="input-field" />
            <input name="artiste" value={form.artiste} onChange={handleChange}
              placeholder="Artiste *" required className="input-field" />
          </div>
          <div className="form-row">
            <input type="date" name="date" value={form.date} onChange={handleChange}
              required className="input-field" />
            <input name="lieu" value={form.lieu} onChange={handleChange}
              placeholder="Lieu *" required className="input-field" />
          </div>
          <div className="form-row">
            <input type="number" name="prixBase" value={form.prixBase} onChange={handleChange}
              placeholder="Prix de base (€) *" required min="0" step="0.01" className="input-field" />
            <input type="number" name="stock" value={form.stock} onChange={handleChange}
              placeholder="Stock total *" required min="0" className="input-field" />
          </div>
          <div className="form-row">
            <select name="statut" value={form.statut} onChange={handleChange} className="input-field">
              <option value="brouillon">Brouillon</option>
              <option value="ouvert">Ouvert à la vente</option>
              <option value="complet">Complet</option>
              <option value="annulé">Annulé</option>
              <option value="terminé">Terminé</option>
            </select>
          </div>
          <textarea name="description" value={form.description} onChange={handleChange}
            placeholder="Description" className="input-field" rows="3" />
          <div className="form-actions">
            <button type="submit" className="btn-admin-primary">
              {editId ? 'Mettre à jour' : 'Créer le concert'}
            </button>
            {editId && (
              <button type="button" className="btn-admin-secondary" onClick={handleCancel}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-list-section">
        <h2>Concerts ({concerts.length})</h2>
        <div className="admin-concert-list">
          {concerts.map(c => (
            <div key={c.id} className="admin-concert-row">
              <div className="admin-concert-info">
                <strong>{c.titre}</strong>
                <span>{c.artiste} · {c.lieu} · {new Date(c.date).toLocaleDateString('fr-FR')}</span>
                <span className="admin-statut" style={{ color: STATUT_COLORS[c.statut] || '#6b7280' }}>
                  ● {c.statut} — {c.stock} places restantes
                </span>
              </div>
              <div className="admin-concert-actions">
                <button className="btn-admin-edit" onClick={() => handleEdit(c)}>
                  Modifier
                </button>
                {c.statut !== 'annulé' && (
                  <button className="btn-admin-danger"
                    onClick={() => handleStatut(c.id, 'annulé')}>
                    Annuler
                  </button>
                )}
                {c.statut === 'annulé' && (
                  <button className="btn-admin-secondary"
                    onClick={() => handleStatut(c.id, 'ouvert')}>
                    Rouvrir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Admin;
