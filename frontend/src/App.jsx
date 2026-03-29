import { useState, useEffect } from 'react';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DetaliiCarte from './pages/DetaliiCarte';
import Profil from './pages/Profil';
import DespreNoi from './pages/DespreNoi';
import Contact from './pages/Contact';
import Livrare from './pages/Livrare';
import Termeni from './pages/Termeni';
import WishlistDrawer from './components/WishlistDrawer';
import ChatWidget from './components/ChatWidget';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();

  const [rolUtilizator, setRolUtilizator] = useState(localStorage.getItem('rol'));
  const [numeUtilizator, setNumeUtilizator] = useState(localStorage.getItem('nume'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  const [vizualizare, setVizualizare] = useState(location.pathname === '/login' ? 'login' : 'magazin');

  const [cos, setCos] = useState(() => {
    try {
      const saved = localStorage.getItem('cos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [arataCos, setArataCos] = useState(false);

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [arataWishlist, setArataWishlist] = useState(false);

  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/register') {
      setVizualizare('login');
    } else if (location.pathname === '/dashboard') {
      setVizualizare('dashboard');
    } else if (location.pathname === '/profil') {
      setVizualizare('profil');
    } else {
      setVizualizare('magazin');
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('cos', JSON.stringify(cos));
  }, [cos]);

  const [termenCautare, setTermenCautare] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const token = localStorage.getItem('token');
  useEffect(() => {
    const id = localStorage.getItem('userId');
    setRolUtilizator(localStorage.getItem('rol'));
    setNumeUtilizator(localStorage.getItem('nume'));
    setUserId(id);

    // Ne asigurăm că token-ul există pe bune și nu este textul "null"
    if (token && token !== 'null' && token !== 'undefined') {
      const fetchCos = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/user/cos', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.data && response.data.produse) {
            const parsedCos = response.data.produse
              .filter(p => p.carteId !== null)
              .map(p => ({
                ...p.carteId,
                cantitate: p.cantitate,
                _id: p.carteId._id
              }));
            setCos(parsedCos);
          }
        } catch (error) {
          console.error("Eroare la aducerea coșului din baza de date:", error);
          if (error.response && (error.response.status === 403 || error.response.status === 401)) {
            localStorage.removeItem('token');
          }
        }
      };

      const fetchWishlist = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/user/wishlist', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data) {
            setWishlist(response.data.map(w => w._id || w));
          }
        } catch (error) {
          console.error("Eroare la aducerea wishlist-ului din baza de date:", error);
          // Dacă tokenul e expirat, îl curățăm automat
          if (error.response && (error.response.status === 403 || error.response.status === 401)) {
            localStorage.removeItem('token');
          }
        }
      };

      fetchCos();
      fetchWishlist();
    }
  }, [token]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleDelogare = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nume');
    localStorage.removeItem('userId');
    localStorage.removeItem('cos');
    localStorage.removeItem('wishlist');
    setRolUtilizator(null);
    setNumeUtilizator(null);
    setUserId(null);
    setCos([]);
    setWishlist([]);
    setArataCos(false);
    setArataWishlist(false);
    setVizualizare('magazin');
    setTermenCautare('');
  };

  return (
    <div className="min-h-screen bg-ivory text-anthracite dark:bg-slate-900 dark:text-stone-300 font-sans transition-colors duration-300 antialiased overflow-x-hidden flex flex-col">
      {vizualizare !== 'login' && (
        <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/80 border-b border-stone-200/50 dark:border-slate-800/50 h-20 flex items-center px-6 md:px-12 transition-colors duration-300">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-8">
            <div className="flex-shrink-0 flex items-center gap-6">
              <Link to="/" onClick={() => {
                setVizualizare('magazin');
                setArataCos(false);
                setTermenCautare('');
              }} className="text-3xl font-serif font-bold tracking-tight text-amber-900 dark:text-amber-500 hover:text-amber-700 transition-colors">
                BookIo
              </Link>
            </div>
            {vizualizare === 'magazin' && (
              <div className="flex-grow max-w-2xl hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Caută titluri, autori sau ISBN..."
                    value={termenCautare}
                    onChange={(e) => setTermenCautare(e.target.value)}
                    className="w-full h-12 pl-12 pr-12 bg-stone-100/50 dark:bg-slate-800/50 border-none rounded-full text-sm dark:text-stone-200 focus:ring-2 focus:ring-amber-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 placeholder-stone-400 dark:placeholder-stone-500"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  {termenCautare && (
                    <button
                      onClick={() => setTermenCautare('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-red-500 transition-colors p-1"
                      title="Șterge căutarea"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center space-x-4 md:space-x-6">
              {rolUtilizator === 'admin' && (
                <Link to="/dashboard" onClick={() => {
                  setVizualizare('dashboard');
                  setArataCos(false);
                }} className="hidden md:block text-sm font-medium text-amber-700 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-3 py-1.5 rounded-full transition-colors">
                  ⚙️ Dashboard
                </Link>
              )}
              <button
                onClick={toggleTheme}
                className="text-anthracite dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                )}
              </button>
              <div className="relative group">
                <Link
                  to={rolUtilizator ? "/profil" : "/login"}
                  onClick={() => {
                    if (rolUtilizator) {
                      setVizualizare('profil');
                      setArataCos(false);
                    } else {
                      setVizualizare('login');
                    }
                  }}
                  className="flex items-center gap-2 text-anthracite dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors py-2"
                >
                  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span className="text-sm font-medium hidden lg:block whitespace-nowrap">
                    {rolUtilizator && numeUtilizator ? numeUtilizator.split(' ')[0] : 'Contul meu'}
                  </span>
                </Link>
                
                <div className="absolute top-full right-0 mt-0 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-stone-200 dark:border-slate-700 p-4 text-anthracite dark:text-stone-200">
                    {!rolUtilizator ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm font-medium">Intră în cont pentru a-ți vedea comenzile</p>
                        <Link
                          to="/login"
                          onClick={() => setVizualizare('login')}
                          className="w-full text-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md transition-all text-sm"
                        >
                          Autentificare
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link
                          to="/profil"
                          onClick={() => setVizualizare('profil')}
                          className="text-sm font-medium hover:text-amber-600 dark:hover:text-amber-500 py-1"
                        >
                          Contul meu
                        </Link>
                        <hr className="border-stone-200 dark:border-slate-700 my-1" />
                        <button
                          onClick={() => {
                            handleDelogare();
                            window.location.href = '/';
                          }}
                          className="text-sm text-left text-red-500 hover:text-red-600 py-1 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                          </svg>
                          Delogare
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {vizualizare === 'magazin' && (
                <div className="relative group flex items-center">
                  <button
                    onClick={() => {
                      setArataWishlist(!arataWishlist);
                      setArataCos(false);
                    }}
                    className="flex items-center gap-2 text-anthracite dark:text-stone-300 hover:text-red-500 transition-colors relative py-2"
                  >
                    <div className="relative">
                      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {wishlist.length}
                      </span>
                    </div>
                    <span className="text-sm font-medium hidden lg:block whitespace-nowrap">Favorite</span>
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                    <div className="bg-white dark:bg-slate-800 shadow-xl rounded border border-stone-200 dark:border-slate-700 px-3 py-1.5 text-anthracite dark:text-stone-200 text-xs whitespace-nowrap">
                      {wishlist.length === 0 ? 'Nu ai favorite încă' : `Ai ${wishlist.length} produse favorite`}
                    </div>
                  </div>
                </div>
              )}

              {vizualizare === 'magazin' && (
                <div className="relative group flex items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setArataCos(true);
                      setArataWishlist(false);
                    }}
                    className="flex items-center gap-2 text-anthracite dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors relative py-2"
                  >
                    <div className="relative">
                      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {cos.reduce((total, produs) => total + (produs.cantitate || 1), 0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium hidden lg:block whitespace-nowrap">Coșul meu</span>
                  </button>
                  <div className="absolute top-full right-0 lg:left-1/2 lg:-translate-x-1/2 mt-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                    <div className="bg-white dark:bg-slate-800 shadow-xl rounded border border-stone-200 dark:border-slate-700 px-3 py-1.5 text-anthracite dark:text-stone-200 text-xs whitespace-nowrap">
                      Vezi produsele din coș
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1 flex overflow-hidden mt-20">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                cos={cos}
                setCos={setCos}
                arataCos={arataCos}
                setArataCos={setArataCos}
                termenCautare={termenCautare}
                userId={userId}
                wishlist={wishlist}
                setWishlist={setWishlist}
                rolUtilizator={rolUtilizator}
              />
            }
          />
          <Route
            path="/login"
            element={
              <Login
                setRolUtilizator={setRolUtilizator}
                setVizualizare={setVizualizare}
                setNumeUtilizator={setNumeUtilizator}
                setUserId={setUserId}
              />
            }
          />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route
            path="/carte/:id"
            element={<DetaliiCarte cos={cos} setCos={setCos} wishlist={wishlist} setWishlist={setWishlist} userId={userId} />}
          />
          <Route
            path="/profil"
            element={<Profil inapoiLaHome={() => {
              setVizualizare('magazin');
              window.location.href = '/';
            }} />}
          />
          <Route path="/despre-noi" element={<DespreNoi />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/livrare" element={<Livrare />} />
          <Route path="/termeni" element={<Termeni />} />
        </Routes>
      </main>

      <WishlistDrawer deschis={arataWishlist} setDeschis={setArataWishlist} wishlist={wishlist} setWishlist={setWishlist} />
      <ChatWidget cos={cos} setCos={setCos} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
export default App;