import { useState } from 'react';
import { CONCERTS } from '../data/concerts';
import ConcertCard from '../components/ConcertCard';
import './Home.css'; // Importation du CSS

function Home() {
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

  const getSuggestions = (field) => {
    if (!filters[field]) return [];
    const allValues = CONCERTS.map(c => c[field]);
    const uniqueValues = [...new Set(allValues)];
    return uniqueValues
      .filter(v => v.toLowerCase().includes(filters[field].toLowerCase()) && v.toLowerCase() !== filters[field].toLowerCase())
      .slice(0, 5);
  };

  const filteredConcerts = CONCERTS.filter(concert => {
    return concert.artiste.toLowerCase().includes(filters.artiste.toLowerCase()) &&
           concert.lieu.toLowerCase().includes(filters.lieu.toLowerCase()) &&
           (filters.date === "" || concert.date === filters.date) &&
           (filters.prixMax === "" || concert.prixBase <= parseFloat(filters.prixMax));
  });

  return (
    <div className="home-container">
      <h1>Billetterie - Recherche Avancée</h1>
      
      <div className="filter-panel">
        <div className="filter-group">
          <label>Artiste :</label>
          <input 
            type="text" 
            name="artiste" 
            value={filters.artiste} 
            onChange={handleChange} 
            onBlur={() => setTimeout(() => setShowSuggestions(prev => ({...prev, artiste: false})), 200)} 
            className="input-field" 
            placeholder="Ex: Daft Punk" 
          />
          {showSuggestions.artiste && getSuggestions('artiste').length > 0 && (
            <ul className="suggestion-list">
              {getSuggestions('artiste').map(s => (
                <li key={s} onClick={() => selectSuggestion('artiste', s)} className="suggestion-item">{s}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="filter-group">
          <label>Lieu :</label>
          <input 
            type="text" 
            name="lieu" 
            value={filters.lieu} 
            onChange={handleChange} 
            onBlur={() => setTimeout(() => setShowSuggestions(prev => ({...prev, lieu: false})), 200)} 
            className="input-field" 
            placeholder="Ex: Paris" 
          />
          {showSuggestions.lieu && getSuggestions('lieu').length > 0 && (
            <ul className="suggestion-list">
              {getSuggestions('lieu').map(s => (
                <li key={s} onClick={() => selectSuggestion('lieu', s)} className="suggestion-item">{s}</li>
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