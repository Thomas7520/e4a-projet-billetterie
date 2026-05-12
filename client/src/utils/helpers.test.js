import { describe, it, expect } from 'vitest';
import {
  calculateTotal,
  filterOpenConcerts,
  isQuantityValid,
  isStockSufficient,
  isConcertReservable,
  validatePostalCode,
  validateCardExpiry,
  validateCVV,
  validateCardNumber,
} from './helpers';

const aujourdhui = new Date().toISOString().split('T')[0];

const demain = new Date();
demain.setDate(demain.getDate() + 1);
const demainStr = demain.toISOString().split('T')[0];

const hier = new Date();
hier.setDate(hier.getDate() - 1);
const hierStr = hier.toISOString().split('T')[0];

describe('calculateTotal', () => {
  it('retourne 0 pour un panier vide', () => {
    expect(calculateTotal([])).toBe(0);
  });
  it('calcule le total pour un seul article', () => {
    expect(calculateTotal([{ prixUnitaire: 65, selectedQuantity: 2 }])).toBe(130);
  });
  it('calcule le total pour plusieurs articles', () => {
    const panier = [
      { prixUnitaire: 65, selectedQuantity: 2 },
      { prixUnitaire: 150, selectedQuantity: 1 },
      { prixUnitaire: 85, selectedQuantity: 3 },
    ];
    expect(calculateTotal(panier)).toBe(65 * 2 + 150 + 85 * 3);
  });
  it('gère un article à quantité 1', () => {
    expect(calculateTotal([{ prixUnitaire: 99, selectedQuantity: 1 }])).toBe(99);
  });
  it('gère les prix décimaux correctement', () => {
    expect(calculateTotal([{ prixUnitaire: 65.5, selectedQuantity: 3 }])).toBe(196.5);
  });
});

describe('filterOpenConcerts', () => {
  const concerts = [
    { id: 1, statut: 'ouvert' },
    { id: 2, statut: 'annulé' },
    { id: 3, statut: 'complet' },
    { id: 4, statut: 'ouvert' },
    { id: 5, statut: 'terminé' },
    { id: 6, statut: 'brouillon' },
  ];

  it('ne retient que les concerts ouverts', () => {
    const resultat = filterOpenConcerts(concerts);
    expect(resultat).toHaveLength(2);
    expect(resultat.map(c => c.id)).toEqual([1, 4]);
  });
  it('retourne un tableau vide si aucun concert ouvert', () => {
    expect(filterOpenConcerts([{ statut: 'annulé' }, { statut: 'complet' }])).toEqual([]);
  });
  it('retourne un tableau vide pour une liste vide', () => {
    expect(filterOpenConcerts([])).toEqual([]);
  });
});

describe('isQuantityValid', () => {
  it('0 est invalide', () => expect(isQuantityValid(0)).toBe(false));
  it('-1 est invalide', () => expect(isQuantityValid(-1)).toBe(false));
  it('1 est valide', () => expect(isQuantityValid(1)).toBe(true));
  it('3 est valide', () => expect(isQuantityValid(3)).toBe(true));
  it('6 est valide', () => expect(isQuantityValid(6)).toBe(true));
  it('7 est invalide', () => expect(isQuantityValid(7)).toBe(false));
  it('10 est invalide', () => expect(isQuantityValid(10)).toBe(false));
  it('1.5 est invalide', () => expect(isQuantityValid(1.5)).toBe(false));
  it('NaN est invalide', () => expect(isQuantityValid(NaN)).toBe(false));
});

describe('isStockSufficient', () => {
  it('quantité inférieure au stock : suffisant', () => expect(isStockSufficient(10, 3)).toBe(true));
  it('quantité égale au stock : suffisant', () => expect(isStockSufficient(5, 5)).toBe(true));
  it('quantité supérieure au stock : insuffisant', () => expect(isStockSufficient(3, 4)).toBe(false));
  it('stock à 0 et quantité à 0 : suffisant', () => expect(isStockSufficient(0, 0)).toBe(true));
  it('stock à 0 et quantité à 1 : insuffisant', () => expect(isStockSufficient(0, 1)).toBe(false));
});

describe('isConcertReservable', () => {
  const dateFuture = '2030-01-01';
  const datePassee = '2020-01-01';

  it('date future, ouvert, places dispo : réservable', () => {
    expect(isConcertReservable({ date: dateFuture, statut: 'ouvert', stock: 10 })).toBe(true);
  });
  it('date future, ouvert, plus de places : non réservable', () => {
    expect(isConcertReservable({ date: dateFuture, statut: 'ouvert', stock: 0 })).toBe(false);
  });
  it('date future, annulé, places dispo : non réservable', () => {
    expect(isConcertReservable({ date: dateFuture, statut: 'annulé', stock: 10 })).toBe(false);
  });
  it('date future, annulé, plus de places : non réservable', () => {
    expect(isConcertReservable({ date: dateFuture, statut: 'annulé', stock: 0 })).toBe(false);
  });
  it('date passée, ouvert, places dispo : non réservable', () => {
    expect(isConcertReservable({ date: datePassee, statut: 'ouvert', stock: 10 })).toBe(false);
  });
  it('date passée, ouvert, plus de places : non réservable', () => {
    expect(isConcertReservable({ date: datePassee, statut: 'ouvert', stock: 0 })).toBe(false);
  });
  it('date passée, annulé, places dispo : non réservable', () => {
    expect(isConcertReservable({ date: datePassee, statut: 'annulé', stock: 10 })).toBe(false);
  });
  it('date passée, annulé, plus de places : non réservable', () => {
    expect(isConcertReservable({ date: datePassee, statut: 'annulé', stock: 0 })).toBe(false);
  });
  it('statut "complet" : non réservable', () => {
    expect(isConcertReservable({ date: dateFuture, statut: 'complet', stock: 0 })).toBe(false);
  });
  it('statut "terminé" : non réservable', () => {
    expect(isConcertReservable({ date: datePassee, statut: 'terminé', stock: 0 })).toBe(false);
  });
  it('statut "brouillon" : non réservable', () => {
    expect(isConcertReservable({ date: dateFuture, statut: 'brouillon', stock: 10 })).toBe(false);
  });

  it('concert aujourd\'hui à 00:00 : non réservable (heure déjà passée)', () => {
    expect(isConcertReservable({ date: aujourdhui, heure: '00:00', statut: 'ouvert', stock: 10 })).toBe(false);
  });
  it('concert aujourd\'hui à 23:59 : réservable (heure pas encore passée)', () => {
    expect(isConcertReservable({ date: aujourdhui, heure: '23:59', statut: 'ouvert', stock: 10 })).toBe(true);
  });
  it('concert demain à 20:00 : réservable', () => {
    expect(isConcertReservable({ date: demainStr, heure: '20:00', statut: 'ouvert', stock: 10 })).toBe(true);
  });
  it('concert hier à 20:00 : non réservable', () => {
    expect(isConcertReservable({ date: hierStr, heure: '20:00', statut: 'ouvert', stock: 10 })).toBe(false);
  });
});

describe('validatePostalCode', () => {
  it('"75001" est valide', () => expect(validatePostalCode('75001')).toBe(true));
  it('"13000" est valide', () => expect(validatePostalCode('13000')).toBe(true));
  it('"1234" est invalide (4 chiffres)', () => expect(validatePostalCode('1234')).toBe(false));
  it('"123456" est invalide (6 chiffres)', () => expect(validatePostalCode('123456')).toBe(false));
  it('"abcde" est invalide (lettres)', () => expect(validatePostalCode('abcde')).toBe(false));
  it('chaîne vide est invalide', () => expect(validatePostalCode('')).toBe(false));
  it('"7500a" est invalide (alphanumérique)', () => expect(validatePostalCode('7500a')).toBe(false));
});

describe('validateCardExpiry', () => {
  const maintenant = new Date();
  const moisCourant = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  const moisPrecedent = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
  const fmt = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;

  it('"12/30" est valide (date future)', () => expect(validateCardExpiry('12/30')).toBe(true));
  it('"01/20" est invalide (date passée)', () => expect(validateCardExpiry('01/20')).toBe(false));
  it('mois courant est encore valide', () => expect(validateCardExpiry(fmt(moisCourant))).toBe(true));
  it('mois précédent est expiré', () => expect(validateCardExpiry(fmt(moisPrecedent))).toBe(false));
  it('"13/30" est invalide (mois inexistant)', () => expect(validateCardExpiry('13/30')).toBe(false));
  it('"00/30" est invalide (mois à zéro)', () => expect(validateCardExpiry('00/30')).toBe(false));
  it('"1226" est invalide (pas de séparateur)', () => expect(validateCardExpiry('1226')).toBe(false));
  it('chaîne vide est invalide', () => expect(validateCardExpiry('')).toBe(false));
});

describe('validateCVV', () => {
  it('"123" est valide (3 chiffres)', () => expect(validateCVV('123')).toBe(true));
  it('"1234" est valide (4 chiffres)', () => expect(validateCVV('1234')).toBe(true));
  it('"12" est invalide (trop court)', () => expect(validateCVV('12')).toBe(false));
  it('"12345" est invalide (trop long)', () => expect(validateCVV('12345')).toBe(false));
  it('chaîne vide est invalide', () => expect(validateCVV('')).toBe(false));
});

describe('validateCardNumber', () => {
  it('16 chiffres est valide', () => expect(validateCardNumber('4111111111111111')).toBe(true));
  it('15 chiffres est invalide', () => expect(validateCardNumber('411111111111111')).toBe(false));
  it('17 chiffres est invalide', () => expect(validateCardNumber('41111111111111111')).toBe(false));
  it('chaîne vide est invalide', () => expect(validateCardNumber('')).toBe(false));
});
