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

  const getSuggestions = (name) => {
    const saisie = filters[name].toLowerCase();
    if (!saisie) return [];
    const valeurs = [...new Set(concerts.map(c => c[name]).filter(Boolean))];
    return valeurs.filter(v => v.toLowerCase().includes(saisie) && v.toLowerCase() !== saisie).slice(0, 5);
  };

  const filteredConcerts = concerts.filter(concert => {
    const search = filters.artiste.toLowerCase();
    const matchArtiste = concert.artiste.toLowerCase().includes(search) ||
                         (concert.titre || '').toLowerCase().includes(search);
    return matchArtiste &&
           concert.lieu.toLowerCase().includes(filters.lieu.toLowerCase()) &&
           (filters.date === "" || concert.date === filters.date) &&
           (filters.prixMax === "" || concert.prixBase <= parseFloat(filters.prixMax));
  });

  return (
    <div className="home-container">
      <h1>Billetterie</h1>

      <div className="filter-panel">
        <div className="filter-group">
          <label>Artiste / Titre :</label>
          <input
            type="text" name="artiste" value={filters.artiste}
            onChange={handleChange} className="input-field" placeholder="Ex: Daft Punk"
            onBlur={() => setTimeout(() => setShowSuggestions(p => ({ ...p, artiste: false })), 150)}
          />
          {showSuggestions.artiste && getSuggestions('artiste').length > 0 && (
            <ul className="suggestion-list">
              {getSuggestions('artiste').map(v => (
                <li key={v} className="suggestion-item" onMouseDown={() => selectSuggestion('artiste', v)}>{v}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="filter-group">
          <label>Lieu :</label>
          <input
            type="text" name="lieu" value={filters.lieu}
            onChange={handleChange} className="input-field" placeholder="Ex: Paris"
            onBlur={() => setTimeout(() => setShowSuggestions(p => ({ ...p, lieu: false })), 150)}
          />
          {showSuggestions.lieu && getSuggestions('lieu').length > 0 && (
            <ul className="suggestion-list">
              {getSuggestions('lieu').map(v => (
                <li key={v} className="suggestion-item" onMouseDown={() => selectSuggestion('lieu', v)}>{v}</li>
              ))}
            </ul>
          )}
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