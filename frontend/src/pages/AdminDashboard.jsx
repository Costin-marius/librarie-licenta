import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
    const [carti, setCarti] = useState([]);
    const [termenCautare, setTermenCautare] = useState('');
    
    // state pt modalul de adaugare/editare
    const [arataModal, setArataModal] = useState(false);
    const [idEditare, setIdEditare] = useState(null);
    const [dateFormular, setDateFormular] = useState({
        isbn: '', titlu: '', autor: '', editura: '', pret: '', stoc: '', imagine_url: ''
    });

    useEffect(() => {
        // teoretic aici ar trebui sa verificam daca e admin inainte sa il lasam sa vada pagina
        const rol = localStorage.getItem('rol');
        if (rol !== 'admin') {
            window.location.href = '/login';
        } else {
            fetchCarti();
        }
    }, []);

    const fetchCarti = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/carti');
            setCarti(response.data);
        } catch (error) {
            toast.error("Nu am putut încărca inventarul.");
        }
    };

    const handleDelogare = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const deschideModalAdaugare = () => {
        setIdEditare(null);
        setDateFormular({ isbn: '', titlu: '', autor: '', editura: '', pret: '', stoc: '', imagine_url: '' });
        setArataModal(true);
    };

    const deschideModalEditare = (carte) => {
        setIdEditare(carte._id);
        setDateFormular({ ...carte });
        setArataModal(true);
    };

    const inchideModal = () => {
        setArataModal(false);
    };

    const salveazaCarte = async (e) => {
        e.preventDefault();
        try {
            if (idEditare) {
                await axios.put(`http://localhost:5000/api/carti/${idEditare}`, dateFormular);
                toast.success('Cartea a fost actualizată!');
            } else {
                await axios.post('http://localhost:5000/api/carti', dateFormular);
                toast.success('Cartea a fost adăugată în inventar!');
            }
            inchideModal();
            fetchCarti();
        } catch (error) {
            toast.error('Eroare la salvare!');
        }
    };

    const stergeCarte = async (id) => {
        if (window.confirm("Atenție! Ștergi definitiv această carte. Ești sigur?")) {
            try {
                await axios.delete(`http://localhost:5000/api/carti/${id}`);
                toast.success("Înregistrarea a fost ștearsă.");
                fetchCarti();
            } catch (error) {
                toast.error("Eroare la ștergere!");
            }
        }
    };

    const cartiFiltrate = carti.filter(carte => 
        `${carte.titlu} ${carte.autor} ${carte.isbn}`.toLowerCase().includes(termenCautare.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-950 text-gray-200 font-sans overflow-hidden">
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />

            {/* SIDEBAR */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-black text-blue-400">AdminPanel</h2>
                    <p className="text-xs text-gray-500 mt-1">Librăria Ta - Gestiune</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {/* aici putem adauga mai multe tab-uri pe viitor */}
                    <button className="w-full flex items-center gap-3 bg-blue-600/10 text-blue-400 px-4 py-3 rounded-lg font-medium border border-blue-900/50">
                        📦 Inventar Cărți
                    </button>
                    <button className="w-full flex items-center gap-3 hover:bg-gray-800 text-gray-400 px-4 py-3 rounded-lg font-medium transition">
                        🛒 Comenzi Clienți
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleDelogare} className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-900/40 text-gray-300 hover:text-red-400 py-2 rounded-lg transition border border-gray-700 hover:border-red-800">
                        🚪 Delogare
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* TOP HEADER */}
                <header className="h-20 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8">
                    <div className="relative w-96">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Caută în inventar (ISBN, Titlu)..." 
                            value={termenCautare}
                            onChange={(e) => setTermenCautare(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    
                    <button onClick={deschideModalAdaugare} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg shadow-blue-900/20">
                        ➕ Adaugă Carte
                    </button>
                </header>

                {/* AREA TABEL */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
                                    <th className="px-6 py-4 font-medium">Copertă</th>
                                    <th className="px-6 py-4 font-medium">Detalii Carte</th>
                                    <th className="px-6 py-4 font-medium">Preț</th>
                                    <th className="px-6 py-4 font-medium">Stoc</th>
                                    <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {cartiFiltrate.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            Nu am găsit date conform căutării.
                                        </td>
                                    </tr>
                                ) : (
                                    cartiFiltrate.map((carte) => (
                                        <tr key={carte._id} className="hover:bg-gray-800/50 transition">
                                            <td className="px-6 py-4 w-20">
                                                <img src={carte.imagine_url} alt="coperta" className="w-12 h-16 object-cover rounded shadow border border-gray-700" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-200">{carte.titlu}</div>
                                                <div className="text-sm text-gray-400">{carte.autor} • <span className="text-gray-500 text-xs">ISBN: {carte.isbn}</span></div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-blue-400">
                                                {carte.pret} RON
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${carte.stoc < 5 ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
                                                    {carte.stoc} buc
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => deschideModalEditare(carte)} className="text-amber-400 hover:text-amber-300 font-medium transition">
                                                    Editează
                                                </button>
                                                <button onClick={() => stergeCarte(carte._id)} className="text-red-400 hover:text-red-300 font-medium transition">
                                                    Șterge
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL ADAUGARE/EDITARE CARTE */}
            {arataModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-800">
                            <h3 className="text-xl font-bold text-gray-100">
                                {idEditare ? 'Editează Înregistrarea' : 'Adaugă Carte Nouă'}
                            </h3>
                            <button onClick={inchideModal} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                        </div>
                        
                        <form onSubmit={salveazaCarte} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            {['isbn', 'titlu', 'autor', 'editura'].map(camp => (
                                <div key={camp}>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{camp}</label>
                                    <input type="text" required value={dateFormular[camp]} onChange={(e) => setDateFormular({...dateFormular, [camp]: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Preț (RON)</label>
                                <input type="number" required value={dateFormular.pret} onChange={(e) => setDateFormular({...dateFormular, pret: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Stoc (Buc)</label>
                                <input type="number" required value={dateFormular.stoc} onChange={(e) => setDateFormular({...dateFormular, stoc: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Link Imagine Copertă</label>
                                <input type="text" required value={dateFormular.imagine_url} onChange={(e) => setDateFormular({...dateFormular, imagine_url: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-800">
                                <button type="button" onClick={inchideModal} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition">
                                    Renunță
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition">
                                    {idEditare ? 'Salvează Modificările' : 'Adaugă în Inventar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;