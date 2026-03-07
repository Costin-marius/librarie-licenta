import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

const RutaProtejata = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    return children;
};


const stilCentrat = {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    width: '100vw', 
    minHeight: '100vh',
    paddingTop: '10vh' 
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Acum aplicăm aceeași regulă peste tot */}
        <Route path="/register" element={<div style={stilCentrat}><Register /></div>} />
        <Route path="/login" element={<div style={stilCentrat}><Login /></div>} />
        
        <Route path="/" element={
          <RutaProtejata>
             <div style={stilCentrat}>
                <Home />
             </div>
          </RutaProtejata>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;