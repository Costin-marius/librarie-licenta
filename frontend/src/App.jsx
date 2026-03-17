import { useState, useEffect } from 'react';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DetaliiCarte from './pages/DetaliiCarte';
import Profil from './pages/Profil';
import WishlistDrawer from './components/WishlistDrawer';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
    const [rolUtilizator, setRolUtilizator] = useState(localStorage.getItem('rol'));
    const [numeUtilizator, setNumeUtilizator] = useState(localStorage.getItem('nume'));
    const [userId, setUserId] = useState(localStorage.getItem('userId'));
    const [vizualizare, setVizualizare] = useState(window.location.pathname === '/login' ? 'login' : 'magazin');
    
    const [cos, setCos] = useState(() => {
        const saved = localStorage.getItem('cos');
        return saved ? JSON.parse(saved) : [];
    });
    const [arataCos, setArataCos] = useState(false);

    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });
    const [arataWishlist, setArataWishlist] = useState(false);

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

        if (token) {
            const fetchCos = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/user/cos', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data) {
                        const parsedCos = response.data.map(p => ({ ...p.carte, cantitate: p.cantitate }));
                        setCos(parsedCos);
                    }
                } catch (error) {
                    console.error("Eroare la aducerea coșului din baza de date:", error);
                }
            };
            fetchCos();

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
                }
            };
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
        <Router>
            <div className="min-h-screen bg-ivory text-anthracite dark:bg-slate-900 dark:text-stone-300 font-sans transition-colors duration-300 antialiased overflow-x-hidden flex flex-col">
                
                {vizualizare !== 'login' && (
                    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/80 border-b border-stone-200/50 dark:border-slate-800/50 h-20 flex items-center px-6 md:px-12 transition-colors duration-300">
                        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-8">
                            
                            <div className="flex-shrink-0 flex items-center gap-6">
                                <Link to="/" onClick={() => { setVizualizare('magazin'); setArataCos(false); setTermenCautare(''); }} className="text-3xl font-serif font-bold tracking-tight text-amber-900 dark:text-amber-500 hover:text-amber-700 transition-colors">
                                    BookIo
                                </Link>
                            </div>
                            {vizualizare === 'magazin' && !arataCos && (
                                <div className="flex-grow max-w-2xl hidden md:block">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Caută titluri, autori sau genuri..."
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
                                    <Link to="/dashboard" onClick={() => { setVizualizare('dashboard'); setArataCos(false); }} className="hidden md:block text-sm font-medium text-amber-700 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-3 py-1.5 rounded-full transition-colors">
                                        ⚙️ Dashboard
                                    </Link>
                                )}

                                <button onClick={toggleTheme} className="text-anthracite dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800" aria-label="Toggle Dark Mode">
                                    {isDarkMode ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                                    )}
                                </button>

                                {vizualizare === 'magazin' && (
                                    <button onClick={() => { setArataCos(!arataCos); setArataWishlist(false); }} className="text-anthracite dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors relative">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                            {cos.reduce((total, produs) => total + (produs.cantitate || 1), 0)}
                                        </span>
                                    </button>
                                )}

                                {vizualizare === 'magazin' && (
                                    <button onClick={() => { setArataWishlist(!arataWishlist); setArataCos(false); }} className="text-anthracite dark:text-stone-300 hover:text-red-500 transition-colors relative ml-2" title="Wishlist">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                            {wishlist.length}
                                        </span>
                                    </button>
                                )}

                                {rolUtilizator ? (
                                    <>
                                        <Link to="/profil" onClick={() => { setVizualizare('profil'); setArataCos(false); }} className="text-anthracite dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        </Link>
                                        <button onClick={() => { handleDelogare(); window.location.href = '/'; }} title="Delogare" className="text-anthracite dark:text-stone-300 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" onClick={() => setVizualizare('login')} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full shadow-sm transition-all">
                                        Autentificare
                                    </Link>
                                )}
                            </div>
                        </div>
                    </nav>
                )}

                <main className="flex-1 flex overflow-hidden mt-20">
                    <Routes>
                        <Route path="/" element={
                            <Home cos={cos} setCos={setCos} arataCos={arataCos} setArataCos={setArataCos} termenCautare={termenCautare} userId={userId} wishlist={wishlist} setWishlist={setWishlist} rolUtilizator={rolUtilizator} />
                        } />
                        <Route path="/login" element={
                            <Login setRolUtilizator={setRolUtilizator} setVizualizare={setVizualizare} setNumeUtilizator={setNumeUtilizator} setUserId={setUserId} />
                        } />
                        <Route path="/dashboard" element={<AdminDashboard />} />
                        <Route path="/carte/:id" element={<DetaliiCarte cos={cos} setCos={setCos} wishlist={wishlist} setWishlist={setWishlist} userId={userId} />} />
                        <Route path="/profil" element={<Profil inapoiLaHome={() => { setVizualizare('magazin'); window.location.href = '/'; }} />} />
                    </Routes>
                </main>

                <WishlistDrawer deschis={arataWishlist} setDeschis={setArataWishlist} wishlist={wishlist} setWishlist={setWishlist} />
            </div>
        </Router>
    );
}

export default App;