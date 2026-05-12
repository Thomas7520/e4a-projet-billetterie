import { Link } from 'react-router-dom';
import './ConcertCard.css';

function ConcertCard({ concert }) {
  const isAvailable = concert.stock > 0;

  return (
    <div className="concert-card">
      <div className="concert-info">
        <h3>{concert.titre || concert.artiste}</h3>
        <p className="concert-artist">{concert.artiste}</p>
        <p>{concert.lieu}</p>
        <p>
          {new Date(concert.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          {concert.heure ? ` à ${concert.heure.replace(':', 'h')}` : ''}
        </p>
      </div>

      <div className="concert-status">
        <span className="price-tag">À partir de {concert.prixBase} €</span>
        
        {isAvailable ? (
          <Link to={`/concert/${concert.id}`} className="btn-detail">
            Réserver
          </Link>
        ) : (
          <span className="sold-out">Complet</span>
        )}
      </div>
    </div>
  );
}

export default ConcertCard;