import { Link } from 'react-router-dom';
import './ConcertCard.css';

function ConcertCard({ concert }) {
  const annule = concert.statut === 'annulé';
  const complet = !annule && concert.stock === 0;

  return (
    <div className={`concert-card${annule ? ' concert-card--annule' : ''}`}>
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
        {!annule && <span className="price-tag">À partir de {concert.prixBase} €</span>}

        {annule && <span className="badge-annule">Annulé</span>}
        {complet && <span className="sold-out">Complet</span>}
        {!annule && !complet && (
          <Link to={`/concert/${concert.id}`} className="btn-detail">
            Réserver
          </Link>
        )}
      </div>
    </div>
  );
}

export default ConcertCard;