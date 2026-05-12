import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import './ConcertDetail.css';

function ConcertDetail() {
  const { id } = useParams();
  const { concerts, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);

  const concert = concerts.find(c => c.id === parseInt(id));

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/api/concerts/${id}/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        const firstAvailable = data.find(c => c.stock_restant > 0);
        if (firstAvailable) setSelectedCat(firstAvailable);
      });
  }, [id]);

  if (!concert) return <div className="detail-container"><p>Chargement...</p></div>;

  if (concert.statut === 'annulé') return (
    <div className="detail-container">
      <Link to="/" className="back-link">← Retour à la liste</Link>
      <article className="concert-sheet">
        <h1>{concert.titre || concert.artiste}</h1>
        <p className="concert-meta">{concert.artiste} · {concert.lieu}</p>
        <p style={{ color: '#e74c3c', fontWeight: 'bold', marginTop: '20px' }}>Ce concert a été annulé.</p>
      </article>
    </div>
  );

  const maxQty = selectedCat ? Math.min(6, selectedCat.stock_restant) : 0;

  const handleSelectCat = (cat) => {
    if (cat.stock_restant === 0) return;
    setSelectedCat(cat);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedCat) return;
    if (addToCart(concert, quantity, selectedCat))
      toast.success(`${quantity} place(s) ${selectedCat.nom} ajoutée(s) au panier !`);
  };

  return (
    <div className="detail-container">
      <Link to="/" className="back-link">← Retour à la liste</Link>

      <article className="concert-sheet">
        <h1>{concert.titre || concert.artiste}</h1>
        <p className="concert-meta">
          {concert.artiste} · {concert.lieu} · {new Date(concert.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          {concert.heure ? ` à ${concert.heure.replace(':', 'h')}` : ''}
        </p>

        <div className="description-section">
          <h3>Description</h3>
          <p>{concert.description}</p>
        </div>

        <div className="booking-card">
          {categories.length > 0 ? (
            <>
              <div className="category-selector">
                <h3>Catégorie de place</h3>
                <div className="category-options">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`category-btn${selectedCat?.id === cat.id ? ' active' : ''}${cat.stock_restant === 0 ? ' sold-out' : ''}`}
                      onClick={() => handleSelectCat(cat)}
                      disabled={cat.stock_restant === 0}
                    >
                      <span className="category-nom">{cat.nom}</span>
                      <span className="category-prix">{cat.prix} €</span>
                      <span className="category-stock">
                        {cat.stock_restant > 0 ? `${cat.stock_restant} places` : 'Complet'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCat && selectedCat.stock_restant > 0 ? (
                <div className="quantity-section">
                  <label>Quantité (max {maxQty}) :</label>
                  <input
                    type="number" min="1" max={maxQty}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, maxQty))}
                    className="input-field"
                  />
                  <button className="btn-buy" onClick={handleAddToCart}>
                    Ajouter au panier
                  </button>
                </div>
              ) : (
                <button className="btn-buy btn-disabled" disabled>Complet</button>
              )}
            </>
          ) : (
            concert.stock > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="price-info">
                  <div className="price-value">{concert.prixBase} €</div>
                  <div className="stock-info">{concert.stock} places restantes</div>
                </div>
                <label>Quantité (max 6) :</label>
                <input
                  type="number" min="1" max={Math.min(6, concert.stock)}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="input-field"
                />
                <button className="btn-buy" onClick={() => {
                  if (addToCart(concert, quantity))
                    toast.success(`${quantity} place(s) ajoutée(s) au panier !`);
                }}>
                  Ajouter au panier
                </button>
              </div>
            ) : (
              <button className="btn-buy btn-disabled" disabled>Complet</button>
            )
          )}
        </div>
      </article>
    </div>
  );
}

export default ConcertDetail;
