import { CONCERTS } from '../data/concerts';

function Home() {
  return (
    <div className="home">
      <h1>Concerts à venir</h1>
      <div className="concert-list">
        {CONCERTS.map(concert => (
          <div key={concert.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h2>{concert.artiste}</h2>
            <p>{concert.lieu} - {new Date(concert.date).toLocaleDateString()}</p>
            {concert.stock > 0 ? (
              <button>Réserver</button>
            ) : (
              <span style={{ color: 'red' }}>Complet</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;