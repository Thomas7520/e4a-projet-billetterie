import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './Admin.css';

const EMPTY_FORM = {
  titre: '', artiste: '', date: '', lieu: '', description: '', statut: 'ouvert',
};
const EMPTY_CATEGORY = { nom: '', prix: '', stock_initial: '' };

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
  const [categoryRows, setCategoryRows] = useState([{ ...EMPTY_CATEGORY }]);

  const [expandedId, setExpandedId] = useState(null);
  const [categoriesCache, setCategoriesCache] = useState({});
  const [newCategory, setNewCategory] = useState({ ...EMPTY_CATEGORY });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryData, setEditingCategoryData] = useState({});

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  // ── Formulaire concert ───────────────────────────────────────────────────────

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCategoryRowChange = (i, field, value) =>
    setCategoryRows(prev => prev.map((r, j) => j === i ? { ...r, [field]: value } : r));

  const addCategoryRow = () => setCategoryRows(prev => [...prev, { ...EMPTY_CATEGORY }]);
  const removeCategoryRow = (i) => setCategoryRows(prev => prev.filter((_, j) => j !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editId && categoryRows.every(r => !r.nom)) {
      toast.error('Ajoutez au moins une catégorie de place.');
      return;
    }

    const url = editId
      ? `http://localhost:5000/api/admin/concerts/${editId}`
      : 'http://localhost:5000/api/admin/concerts';

    const body = editId
      ? { ...form, userId: user.id }
      : { ...form, userId: user.id, categories: categoryRows.filter(r => r.nom) };

    const res = await fetch(url, {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editId ? 'Concert mis à jour !' : 'Concert créé !');
      setForm(EMPTY_FORM);
      setCategoryRows([{ ...EMPTY_CATEGORY }]);
      setEditId(null);
      refreshConcerts();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Erreur');
    }
  };

  const handleEdit = (concert) => {
    setEditId(concert.id);
    setForm({
      titre: concert.titre, artiste: concert.artiste, date: concert.date,
      lieu: concert.lieu, description: concert.description || '', statut: concert.statut,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setCategoryRows([{ ...EMPTY_CATEGORY }]);
    setEditId(null);
  };


  const handleStatut = async (id, statut) => {
    const res = await fetch(`http://localhost:5000/api/admin/concerts/${id}/statut`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, statut }),
    });
    if (res.ok) { toast.success(`Statut : ${statut}`); refreshConcerts(); }
  };


  const refreshCategories = async (concertId) => {
    const res = await fetch(`http://localhost:5000/api/concerts/${concertId}/categories`);
    const data = await res.json();
    setCategoriesCache(prev => ({ ...prev, [concertId]: data }));
    refreshConcerts();
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!categoriesCache[id]) {
      const res = await fetch(`http://localhost:5000/api/concerts/${id}/categories`);
      const data = await res.json();
      setCategoriesCache(prev => ({ ...prev, [id]: data }));
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryData({
      nom: category.nom, prix: category.prix,
      stock_initial: category.stock_initial, stock_restant: category.stock_restant,
    });
  };

  const handleSaveCategory = async (categoryId, concertId) => {
    const res = await fetch(`http://localhost:5000/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...editingCategoryData }),
    });
    if (res.ok) {
      toast.success('Catégorie mise à jour !');
      setEditingCategoryId(null);
      await refreshCategories(concertId);
    } else {
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  const handleDeleteCategory = async (categoryId, concertId) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/categories/${categoryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (res.ok) {
      toast.success('Catégorie supprimée.');
      await refreshCategories(concertId);
    } else {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleAddCategory = async (concertId) => {
    if (!newCategory.nom || !newCategory.prix || !newCategory.stock_initial) {
      toast.error('Remplissez tous les champs de la catégorie.');
      return;
    }
    const res = await fetch(`http://localhost:5000/api/admin/concerts/${concertId}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...newCategory }),
    });
    if (res.ok) {
      toast.success('Catégorie ajoutée !');
      setNewCategory({ ...EMPTY_CATEGORY });
      await refreshCategories(concertId);
    }
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

          {!editId && (
            <div className="category-builder">
              <h3>Catégories de places</h3>
              {categoryRows.map((row, i) => (
                <div key={i} className="category-row">
                  <input placeholder="Nom (ex: Fosse)" value={row.nom}
                    onChange={e => handleCategoryRowChange(i, 'nom', e.target.value)}
                    className="input-field" />
                  <input type="number" placeholder="Prix (€)" value={row.prix} min="0" step="0.01"
                    onChange={e => handleCategoryRowChange(i, 'prix', e.target.value)}
                    className="input-field" />
                  <input type="number" placeholder="Stock" value={row.stock_initial} min="0"
                    onChange={e => handleCategoryRowChange(i, 'stock_initial', e.target.value)}
                    className="input-field" />
                  {categoryRows.length > 1 && (
                    <button type="button" className="btn-admin-danger btn-icon"
                      onClick={() => removeCategoryRow(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-admin-secondary btn-add-category" onClick={addCategoryRow}>
                + Ajouter une catégorie
              </button>
            </div>
          )}

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
            <div key={c.id} className="admin-concert-block">
              <div className="admin-concert-row">
                <div className="admin-concert-info">
                  <strong>{c.titre}</strong>
                  <span>{c.artiste} · {c.lieu} · {new Date(c.date).toLocaleDateString('fr-FR')}</span>
                  <span className="admin-statut" style={{ color: STATUT_COLORS[c.statut] || '#6b7280' }}>
                    ● {c.statut} — {c.stock} places restantes · à partir de {c.prixBase} €
                  </span>
                </div>
                <div className="admin-concert-actions">
                  <button className="btn-admin-categories" onClick={() => toggleExpand(c.id)}>
                    Catégories {expandedId === c.id ? '▲' : '▼'}
                  </button>
                  <button className="btn-admin-edit" onClick={() => handleEdit(c)}>Modifier</button>
                  {c.statut !== 'annulé'
                    ? <button className="btn-admin-danger" onClick={() => handleStatut(c.id, 'annulé')}>Annuler</button>
                    : <button className="btn-admin-secondary" onClick={() => handleStatut(c.id, 'ouvert')}>Rouvrir</button>
                  }
                </div>
              </div>

              {expandedId === c.id && (
                <div className="category-panel">
                  <div className="category-panel-list">
                    {(categoriesCache[c.id] || []).length === 0
                      ? <p className="category-empty">Aucune catégorie.</p>
                      : (categoriesCache[c.id] || []).map(category => (
                          <div key={category.id} className="category-panel-row">
                            {editingCategoryId === category.id ? (
                              <>
                                <input value={editingCategoryData.nom}
                                  onChange={e => setEditingCategoryData(p => ({ ...p, nom: e.target.value }))}
                                  className="input-field category-edit-input" placeholder="Nom" />
                                <input type="number" value={editingCategoryData.prix} min="0" step="0.01"
                                  onChange={e => setEditingCategoryData(p => ({ ...p, prix: e.target.value }))}
                                  className="input-field category-edit-input" placeholder="Prix €" />
                                <input type="number" value={editingCategoryData.stock_restant} min="0"
                                  onChange={e => setEditingCategoryData(p => ({ ...p, stock_restant: e.target.value }))}
                                  className="input-field category-edit-input" placeholder="Stock restant" />
                                <input type="number" value={editingCategoryData.stock_initial} min="0"
                                  onChange={e => setEditingCategoryData(p => ({ ...p, stock_initial: e.target.value }))}
                                  className="input-field category-edit-input" placeholder="Stock initial" />
                                <button className="btn-admin-primary btn-icon"
                                  onClick={() => handleSaveCategory(category.id, c.id)}>✓</button>
                                <button className="btn-admin-secondary btn-icon"
                                  onClick={() => setEditingCategoryId(null)}>✕</button>
                              </>
                            ) : (
                              <>
                                <span className="category-panel-nom">{category.nom}</span>
                                <span>{category.prix} €</span>
                                <span>{category.stock_restant} / {category.stock_initial} places</span>
                                <div className="category-panel-actions">
                                  <button className="btn-admin-edit" onClick={() => handleEditCategory(category)}>Modifier</button>
                                  <button className="btn-admin-danger" onClick={() => handleDeleteCategory(category.id, c.id)}>Supprimer</button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                    }
                  </div>
                  <div className="category-add-form">
                    <p className="category-add-title">Ajouter une catégorie</p>
                    <div className="category-row">
                      <input placeholder="Nom" value={newCategory.nom}
                        onChange={e => setNewCategory(p => ({ ...p, nom: e.target.value }))}
                        className="input-field" />
                      <input type="number" placeholder="Prix (€)" value={newCategory.prix} min="0" step="0.01"
                        onChange={e => setNewCategory(p => ({ ...p, prix: e.target.value }))}
                        className="input-field" />
                      <input type="number" placeholder="Stock" value={newCategory.stock_initial} min="0"
                        onChange={e => setNewCategory(p => ({ ...p, stock_initial: e.target.value }))}
                        className="input-field" />
                      <button type="button" className="btn-admin-primary btn-icon"
                        onClick={() => handleAddCategory(c.id)}>+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Admin;
