import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

function Orders() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/orders/${user.id}`)
        .then(res => res.json())
        .then(data => setOrders(data));
    }
  }, [user]);

  if (!user) return <p>Veuillez vous connecter pour voir vos commandes.</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Mon Historique de Commandes</h1>
      {orders.length === 0 ? <p>Aucune commande passée.</p> : (
        orders.map(o => (
          <div key={o.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
            <p><strong>Commande #{o.id}</strong> - le {o.date_commande}</p>
            <p>Articles : {o.items}</p>
            <p>Total : <strong>{o.total} €</strong></p>
          </div>
        ))
      )}
    </div>
  );
}
export default Orders;