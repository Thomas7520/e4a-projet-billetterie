import { useParams, Link } from 'react-router-dom';
import { CONCERTS } from '../data/concerts';
import './ConcertDetail.css';

function ConcertDetail() {
  const { id } = useParams();
  const concert = CONCERTS.find(c => c.id === parseInt(id));

  if (!concert) {
    return (
      <div className="detail-container">
        <p>Concert non trouvé.</p>
        <Link to="/" className="back-link">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <Link to="/" className="back-link">← Retour à la liste</Link>
      
      <article className="concert-sheet">
        <h1>{concert.artiste}</h1>
        <p className="concert-meta">
          {concert.lieu} | {new Date(concert.date).toLocaleDateString()}
        </p>
        
        <div className="description-section">
          <h3>Description</h3>
          <p>{concert.description}</p>
        </div>
        
        <div className="booking-card">
          <div className="price-info">
            <h4>Prix unitaire</h4>
            <div className="price-value">{concert.prixBase} €</div>
            <div className="stock-info">{concert.stock} places disponibles</div>
          </div>
          
          {concert.stock > 0 ? (
            <button className="btn-buy">
              Réserver maintenant
            </button>
          ) : (
            <button className="btn-buy btn-disabled" disabled>
              Complet
            </button>
          )}
        </div>
      </article>
    </div>
  );
}

export default ConcertDetail;