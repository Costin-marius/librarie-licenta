import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function App() {

    const [rolUtilizator, setRolUtilizator] = useState(localStorage.getItem('rol'));
    const [vizualizare, setVizualizare] = useState('magazin');
    const [cos, setCos] = useState([]);
    const [arataCos, setArataCos] = useState(false);

    useEffect(() => {
        const rol = localStorage.getItem('rol');
        setRolUtilizator(rol);
    }, []);

    const handleDelogare = () => {
        localStorage.clear();
        setRolUtilizator(null);
        setCos([]);
        setArataCos(false);
        setVizualizare('magazin');
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col font-sans">

            {/* Dacă NU e logat → afișăm Login */}
            {!rolUtilizator ? (
                <Login setRolUtilizator={setRolUtilizator} setVizualizare={setVizualizare} />
            ) : (
                <>
                    {/* NAVBAR */}
                    <nav className="bg-gray-900 border-b border-gray-800 p-4 px-8 flex justify-between items-center shadow-md relative z-10">

                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-extrabold text-blue-400">
                                📚 Librăria Ta
                            </h1>

                            <div className="space-x-3">

                                <button
                                    onClick={() => { setVizualizare('magazin'); setArataCos(false); }}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        vizualizare === 'magazin' && !arataCos
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                                >
                                    🏠 Vitrină
                                </button>

                                {rolUtilizator === 'admin' && (
                                    <button
                                        onClick={() => { setVizualizare('dashboard'); setArataCos(false); }}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            vizualizare === 'dashboard'
                                                ? 'bg-amber-600 text-white shadow-md'
                                                : 'text-amber-500 hover:text-amber-400 hover:bg-gray-800 border border-amber-900/30'
                                        }`}
                                    >
                                        ⚙️ Dashboard Admin
                                    </button>
                                )}

                            </div>
                        </div>

                        <div className="flex items-center gap-6">

                            {vizualizare === 'magazin' && (
                                <button
                                    onClick={() => setArataCos(!arataCos)}
                                    className="relative bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold transition flex items-center gap-2 shadow-lg shadow-blue-900/20"
                                >
                                    🛒 Coșul meu
                                    <span className="bg-white text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                                        {cos.length}
                                    </span>
                                </button>
                            )}

                            <div className="flex items-center gap-4 border-l border-gray-800 pl-6">
                                <span className="text-gray-400 text-sm">
                                    Logat ca <strong className="text-white">{rolUtilizator}</strong>
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

                    {/* CONTINUT */}
                    <main className="flex-1 flex overflow-hidden">

                        {vizualizare === 'magazin' && (
                            <Home
                                cos={cos}
                                setCos={setCos}
                                arataCos={arataCos}
                                setArataCos={setArataCos}
                            />
                        )}

                        {vizualizare === 'dashboard' && (
                            <AdminDashboard />
                        )}

                    </main>
                </>
            )}

        </div>
    );
}

export default App;