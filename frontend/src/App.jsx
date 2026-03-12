import { useState, useEffect } from 'react';
import axios from 'axios'; // NOU: Adăugăm axios pentru a vorbi cu backend-ul
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DetaliiCarte from './DetaliiCarte';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
    // Aici ținem minte cine folosește aplicația și ce rol are
    const [rolUtilizator, setRolUtilizator] = useState(localStorage.getItem('rol'));
    const [numeUtilizator, setNumeUtilizator] = useState(localStorage.getItem('nume')); 
    
    // NOU: Avem nevoie de ID-ul utilizatorului pentru a-i găsi coșul în baza de date
    const [userId, setUserId] = useState(localStorage.getItem('userId')); 
    
    // Păstrăm vizualizarea pentru a ști ce butoane/elemente ascundem în Navbar
    const [vizualizare, setVizualizare] = useState('magazin');
    
    // Tot ce ține de coșul de cumpărături
    const [cos, setCos] = useState([]);
    const [arataCos, setArataCos] = useState(false);
    
    // Bara de search
    const [termenCautare, setTermenCautare] = useState(''); 

    // NOU: Acest useEffect se declanșează când se încarcă aplicația SAU când un utilizator se loghează
    useEffect(() => {
        const id = localStorage.getItem('userId');
        setRolUtilizator(localStorage.getItem('rol'));
        setNumeUtilizator(localStorage.getItem('nume'));
        setUserId(id);

        // Dacă avem un utilizator logat (adică avem un ID), îi aducem coșul din baza de date
        if (id) {
            const fetchCos = async () => {
                try {
                    // Facem request la ruta pe care am creat-o pe server
                    const response = await axios.get(`http://localhost:5000/api/cos/${id}`);
                    // Punem produsele venite de la server în state-ul nostru
                    setCos(response.data.produse || []);
                } catch (error) {
                    console.error("Eroare la aducerea coșului din baza de date:", error);
                }
            };
            fetchCos();
        }
    }, [rolUtilizator]); // Se re-rulează ori de câte ori 'rolUtilizator' se schimbă (ex: la login)

    // Funcția de delogare
    const handleDelogare = () => {
        localStorage.clear();
        setRolUtilizator(null);
        setNumeUtilizator(null);
        setUserId(null); // NOU: Ștergem și ID-ul din state
        setCos([]); // Coșul redevine gol în interfață la delogare
        setArataCos(false);
        setVizualizare('magazin');
        setTermenCautare('');
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-950 flex flex-col font-sans">
                {!rolUtilizator ? (
                    // NOU: Am pasat și setUserId către Login, ca să poată fi setat când intră în cont
                    <Login 
                        setRolUtilizator={setRolUtilizator} 
                        setVizualizare={setVizualizare} 
                        setNumeUtilizator={setNumeUtilizator} 
                        setUserId={setUserId} 
                    />
                ) : (
                    <>
                        {/* --- MENIUL DE SUS (NAVBAR) --- */}
                        <nav className="bg-gray-900 border-b border-gray-800 p-4 px-8 flex justify-between items-center shadow-md relative z-10 gap-4">
                            <div className="flex items-center gap-6">
                                
                                {/*Am schimbat <button> în <Link to="/"> pentru navigare corectă */}
                                <Link 
                                    to="/"
                                    onClick={() => { setVizualizare('magazin'); setArataCos(false); setTermenCautare(''); }}
                                    className="text-2xl font-extrabold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                                >
                                    📚 Librarie
                                </Link>

                                {rolUtilizator === 'admin' && (
                                    /*Am schimbat și butonul de Dashboard într-un <Link> */
                                    <Link
                                        to="/dashboard"
                                        onClick={() => { setVizualizare('dashboard'); setArataCos(false); }}
                                        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                                            vizualizare === 'dashboard'
                                                ? 'bg-amber-600 text-white shadow-md'
                                                : 'text-amber-500 hover:bg-gray-800 border border-amber-900/30'
                                        }`}
                                    >
                                        ⚙️ Dashboard
                                    </Link>
                                )}
                            </div>

                            {/* Bara de căutare */}
                            {vizualizare === 'magazin' && !arataCos && (
                                <div className="flex-1 max-w-xl relative hidden md:block">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Caută după titlu, autor sau ISBN..."
                                        value={termenCautare}
                                        onChange={(e) => setTermenCautare(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
                                    />
                                </div>
                            )}

                            {/* Coșul și Delogarea */}
                            <div className="flex items-center gap-6">
                                {vizualizare === 'magazin' && (
                                    <button
                                        onClick={() => setArataCos(!arataCos)}
                                        className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 shadow-lg shadow-blue-900/20"
                                    >
                                        🛒 Coșul meu
                                        <span className="bg-white text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">
                                            {/* Aici arătăm câte produse diferite sunt în coș */}
                                            {cos.length}
                                        </span>
                                    </button>
                                )}

                                <div className="flex items-center gap-4 border-l border-gray-800 pl-6">
                                    <span className="text-gray-400 text-sm hidden sm:block">
                                        Salut, <strong className="text-white">{numeUtilizator || rolUtilizator}</strong>
                                    </span>

                                    <button
                                        onClick={handleDelogare}
                                        className="text-gray-400 hover:text-red-400 transition font-medium text-sm border border-gray-800 hover:border-red-900/50 hover:bg-red-900/20 px-3 py-1.5 rounded-md"
                                    >
                                        🚪 Delogare
                                    </button>
                                </div>
                            </div>
                        </nav>

                        {/* --- ZONA DE CONȚINUT --- */}
                        <main className="flex-1 flex overflow-hidden">
                            <Routes>
                                {/* Ruta principală (Magazinul) */}
                                <Route path="/" element={
                                    <Home
                                        cos={cos}
                                        setCos={setCos}
                                        arataCos={arataCos}
                                        setArataCos={setArataCos}
                                        termenCautare={termenCautare}
                                        userId={userId} // NOU: Trimitem și ID-ul mai departe către Home ca să poată adăuga produse
                                    />
                                } />

                                {/* Ruta pentru Dashboard Admin */}
                                <Route path="/dashboard" element={<AdminDashboard />} />

                                {/* Ruta pentru Detalii Carte */}
                                <Route path="/carte/:id" element={<DetaliiCarte />} />
                            </Routes>
                        </main>
                    </>
                )}
            </div>
        </Router>
    );
}

export default App;