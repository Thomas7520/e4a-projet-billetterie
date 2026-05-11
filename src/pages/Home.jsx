import { useState } from 'react';
import { CONCERTS } from '../data/concerts';
import ConcertCard from '../components/ConcertCard';

function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  // Logique de filtrage (mentionnée dans ton document de validation)
  const filteredConcerts = CONCERTS.filter(concert =>
    concert.artiste.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Billetterie - Concerts</h1>
      
      {/* Zone de recherche */}
      <div style={{ marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Rechercher un artiste..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </div>

      <div className="concert-list">
        {filteredConcerts.length > 0 ? (
          filteredConcerts.map(concert => (
            <ConcertCard key={concert.id} concert={concert} />
          ))
        ) : (
          <p>Aucun concert trouvé pour "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
}

export default Home;