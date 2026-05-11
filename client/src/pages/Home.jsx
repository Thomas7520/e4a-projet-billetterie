import { useState } from 'react';
import { useCart } from '../context/CartContext'; 
import ConcertCard from '../components/ConcertCard';
import './Home.css';

function Home() {
  const { concerts } = useCart(); 
  const [filters, setFilters] = useState({ artiste: "", lieu: "", date: "", prixMax: "" });
  const [showSuggestions, setShowSuggestions] = useState({ artiste: false, lieu: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setShowSuggestions(prev => ({ ...prev, [name]: true }));
  };

  const selectSuggestion = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setShowSuggestions(prev => ({ ...prev, [name]: false }));
  };

  // On filtre sur 'concerts'
  const filteredConcerts = concerts.filter(concert => {
    return concert.artiste.toLowerCase().includes(filters.artiste.toLowerCase()) &&
           concert.lieu.toLowerCase().includes(filters.lieu.toLowerCase()) &&
           (filters.date === "" || concert.date === filters.date) &&
           (filters.prixMax === "" || concert.prixBase <= parseFloat(filters.prixMax));
  });

  return (
    <div className="home-container">
      <h1>Billetterie</h1>
      
      <div className="filter-panel">
        <div className="filter-group">
          <label>Artiste :</label>
          <input type="text" name="artiste" value={filters.artiste} onChange={handleChange} className="input-field" placeholder="Ex: Daft Punk" />
        </div>
        <div className="filter-group">
          <label>Lieu :</label>
          <input type="text" name="lieu" value={filters.lieu} onChange={handleChange} className="input-field" placeholder="Ex: Paris" />
        </div>
        <div className="filter-group">
          <label>Date :</label>
          <input type="date" name="date" value={filters.date} onChange={handleChange} className="input-field" />
        </div>
        <div className="filter-group">
          <label>Prix Max :</label>
          <input type="number" name="prixMax" value={filters.prixMax} onChange={handleChange} className="input-field" placeholder="En €" />
        </div>
      </div>

      <div className="concert-list">
        <h3 className="concert-count">{filteredConcerts.length} résultat(s) trouvé(s)</h3>
        {filteredConcerts.map(concert => <ConcertCard key={concert.id} concert={concert} />)}
      </div>
    </div>
  );
}

export default Home;