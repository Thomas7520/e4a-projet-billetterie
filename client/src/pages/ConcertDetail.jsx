
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import './ConcertDetail.css';

function ConcertDetail() {
  const { id } = useParams();
  const { concerts, addToCart } = useCart(); 
  const [quantity, setQuantity] = useState(1); 

  const concert = concerts.find(c => c.id === parseInt(id));

  if (!concert) return <div className="detail-container"><p>Chargement...</p></div>;

  return (
    <div className="detail-container">
      <Link to="/" className="back-link">← Retour à la liste</Link>
      
      <article className="concert-sheet">
        <h1>{concert.artiste}</h1>
        <p className="concert-meta">{concert.lieu} | {concert.date}</p>
        
        <div className="description-section">
          <h3>Description</h3>
          <p>{concert.description}</p>
        </div>
        
        <div className="booking-card">
          <div className="price-info">
            <div className="price-value">{concert.prixBase} €</div>
            <div className="stock-info">{concert.stock} places restantes</div>
          </div>
          
          {concert.stock > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label>Quantité (max 6) :</label>
              <input 
                type="number" min="1" max={Math.min(6, concert.stock)} 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="input-field"
              />
              <button className="btn-buy" onClick={() => { 
                if(addToCart(concert, quantity)) 
                  toast.success(`${quantity} place(s) ajoutée(s) au panier !`);
                }}>
                Ajouter au panier
              </button>
            </div>
          ) : (
            <button className="btn-buy btn-disabled" disabled>Complet</button>
          )}
        </div>
      </article>
    </div>
  );
}

export default ConcertDetail;