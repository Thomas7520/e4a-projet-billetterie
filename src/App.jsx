import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import ConcertDetail from './pages/ConcertDetail';
import Checkout from './pages/Checkout';
import PaymentForm from './pages/PaymentForm';
import { CartProvider } from './context/CartContext'; 
import Cart from './pages/Cart'; 

function App() {
  return (
    <CartProvider> {/* On enveloppe tout ici */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/concert/:id" element={<ConcertDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<PaymentForm />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}
export default App;