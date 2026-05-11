import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import ConcertDetail from './pages/ConcertDetail';
import Checkout from './pages/Checkout';
import PaymentForm from './pages/PaymentForm';
import Cart from './pages/Cart'; 
import Orders from './pages/Orders'; 

import { CartProvider } from './context/CartContext'; 
import { UserProvider } from './context/UserContext'; 

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/concert/:id" element={<ConcertDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<PaymentForm />} />
            <Route path="/orders" element={<Orders />} /> 
          </Routes>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;