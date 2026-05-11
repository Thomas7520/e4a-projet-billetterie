function ConcertCard({ concert }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '10px', backgroundColor: '#f9f9f9' }}>
      <h2>{concert.artiste}</h2>
      <p><strong>Lieu :</strong> {concert.lieu}</p>
      <p><strong>Date :</strong> {new Date(concert.date).toLocaleDateString()}</p>
      <p>{concert.description}</p>
      <p><strong>Prix :</strong> {concert.prixBase} €</p>
      
      {concert.stock > 0 ? (
        <button style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
          Réserver ({concert.stock} places restantes)
        </button>
      ) : (
        <p style={{ color: 'red', fontWeight: 'bold' }}>COMPLET</p>
      )}
    </div>
  );
}

export default ConcertCard;