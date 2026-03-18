import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
    // === STATE PENTRU NAVIGARE ===
    const [tabCurent, setTabCurent] = useState('carti'); 

    // === STATE PENTRU CĂRȚI ===
    const [carti, setCarti] = useState([]);
    const [termenCautare, setTermenCautare] = useState('');
    const [arataModalStergere, setArataModalStergere] = useState(false);
    const [idDeSters, setIdDeSters] = useState(null);
    const [arataModal, setArataModal] = useState(false);
    const [idEditare, setIdEditare] = useState(null);
    const [dateFormular, setDateFormular] = useState({
        isbn: '', titlu: '', autor: '', editura: '', categorie: '', pret: '', stoc: '', imagine_url: ''
    });

    // === STATE PENTRU COMENZI ===
    const [comenzi, setComenzi] = useState([]);
    const [arataModalStergereComanda, setArataModalStergereComanda] = useState(false);
    const [idComandaDeSters, setIdComandaDeSters] = useState(null);
    const [arataModalDetalii, setArataModalDetalii] = useState(false);
    const [comandaSelectata, setComandaSelectata] = useState(null);

    useEffect(() => {
        const rol = localStorage.getItem('rol');
        if (rol !== 'admin') {
            window.location.href = '/login';
        } else {
            fetchCarti();
            fetchComenzi(); 
        }
    }, []);

    // === FUNCȚII FETCH ===
    const fetchCarti = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/carti');
            setCarti(response.data);
        } catch (error) {
            toast.error("Nu am putut încărca inventarul.");
        }
    };

    const fetchComenzi = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/comenzi');
            setComenzi(response.data);
        } catch (error) {
            toast.error("Nu am putut încărca comenzile.");
        }
    };

    const handleDelogare = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    // === FUNCȚII CĂRȚI ===
    const deschideModalAdaugare = () => { setIdEditare(null); setDateFormular({ isbn: '', titlu: '', autor: '', editura: '', categorie: '', pret: '', stoc: '', imagine_url: '' }); setArataModal(true); };
    const deschideModalEditare = (carte) => { setIdEditare(carte._id); setDateFormular({ ...carte }); setArataModal(true); };
    const inchideModal = () => { setArataModal(false); };
    
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

    const cereConfirmareStergere = (id) => { setIdDeSters(id); setArataModalStergere(true); };
    
    const confirmaStergerea = async () => {
        if (!idDeSters) return;
        try {
            await axios.delete(`http://localhost:5000/api/carti/${idDeSters}`);
            toast.success("Înregistrarea a fost ștearsă.");
            fetchCarti();
        } catch (error) {
            toast.error("Eroare la ștergere!");
        } finally {
            setArataModalStergere(false);
            setIdDeSters(null);
        }
    };

    // === FUNCȚII COMENZI ===
    const schimbaStatusComanda = async (id, statusNou) => {
        try {
            await axios.patch(`http://localhost:5000/api/comenzi/${id}/status`, { stare: statusNou });
            toast.success(`Status schimbat în: ${statusNou}`);
            fetchComenzi();
        } catch (error) {
            toast.error("Eroare la actualizarea statusului!");
        }
    };

    const deschideDetalii = (comanda) => {
        setComandaSelectata(comanda);
        setArataModalDetalii(true);
    };

    const confirmaStergereaComanda = async () => {
        if (!idComandaDeSters) return;
        try {
            await axios.delete(`http://localhost:5000/api/comenzi/${idComandaDeSters}`);
            toast.success("Comanda a fost ștearsă.");
            fetchComenzi();
        } catch (error) {
            toast.error("Eroare la ștergere!");
        } finally {
            setArataModalStergereComanda(false);
            setIdComandaDeSters(null);
        }
    };

    const cartiFiltrate = carti.filter(carte =>
        `${carte.titlu} ${carte.autor} ${carte.isbn}`.toLowerCase().includes(termenCautare.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-200 font-sans overflow-hidden transition-colors duration-300">
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />

            {/* SIDEBAR */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col hidden md:flex transition-colors duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400 transition-colors">AdminPanel</h2>
                    <p className="text-xs text-gray-500 mt-1">Gestiune Magazin</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setTabCurent('carti')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${tabCurent === 'carti' ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                        📦 Inventar Cărți
                    </button>
                    <button onClick={() => setTabCurent('comenzi')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${tabCurent === 'comenzi' ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                        🛒 Comenzi Clienți
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <button onClick={handleDelogare} className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/40 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 py-2 rounded-lg transition-colors border border-gray-300 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-800">
                        🚪 Delogare
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 transition-colors duration-300">
                    {tabCurent === 'carti' ? (
                        <>
                            <div className="relative w-96">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">🔍</span>
                                <input type="text" placeholder="Caută în inventar (ISBN, Titlu)..." value={termenCautare} onChange={(e) => setTermenCautare(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300" />
                            </div>
                            <button onClick={deschideModalAdaugare} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20">
                                ➕ Adaugă Carte
                            </button>
                        </>
                    ) : (
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Gestionare Comenzi</h2>
                    )}
                </header>

                <div className="flex-1 overflow-auto p-8">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-300">
                        
                        {tabCurent === 'carti' ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                        <th className="px-6 py-4 font-medium">Copertă</th>
                                        <th className="px-6 py-4 font-medium">Detalii</th>
                                        <th className="px-6 py-4 font-medium">Preț</th>
                                        <th className="px-6 py-4 font-medium">Stoc</th>
                                        <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
                                    {cartiFiltrate.map((carte) => (
                                        <tr key={carte._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 w-20"><img src={carte.imagine_url} alt="coperta" className="w-12 h-16 object-cover rounded shadow-sm border border-gray-200 dark:border-gray-700" /></td>
                                            <td className="px-6 py-4"><div className="font-bold">{carte.titlu}</div><div className="text-sm text-gray-500">{carte.autor}</div></td>
                                            <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{carte.pret} RON</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${carte.stoc < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{carte.stoc} buc</span></td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => deschideModalEditare(carte)} className="text-amber-600 hover:text-amber-700 font-medium transition-colors">Editează</button>
                                                <button onClick={() => cereConfirmareStergere(carte._id)} className="text-red-600 hover:text-red-700 font-medium transition-colors">Șterge</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                        <th className="px-6 py-4 font-medium">ID / Dată</th>
                                        <th className="px-6 py-4 font-medium">Client</th>
                                        <th className="px-6 py-4 font-medium">Total</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
                                    {comenzi.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Nu există comenzi.</td></tr>
                                    ) : (
                                        comenzi.map((comanda) => (
                                            <tr key={comanda._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm">#{comanda._id.slice(-6)}</div>
                                                    <div className="text-xs text-gray-500">{comanda.createdAt ? new Date(comanda.createdAt).toLocaleDateString("ro-RO") : "N/A"}</div>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{comanda.dateLivrare?.nume || "Anonim"}</td>
                                                <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{comanda.total} RON</td>
                                                <td className="px-6 py-4">
                                                    <select 
                                                        value={comanda.stare} 
                                                        onChange={(e) => schimbaStatusComanda(comanda._id, e.target.value)}
                                                        className="text-sm border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded p-1 outline-none cursor-pointer"
                                                    >
                                                        <option value="Plasată">Plasată</option>
                                                        <option value="În procesare">În procesare</option>
                                                        <option value="Expediată">Expediată</option>
                                                        <option value="Livrată">Livrată</option>
                                                        <option value="Anulată">Anulată</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-4">
                                                    <button onClick={() => deschideDetalii(comanda)} className="text-blue-600 hover:text-blue-700 font-medium">🔍 Detalii</button>
                                                    <button onClick={() => { setIdComandaDeSters(comanda._id); setArataModalStergereComanda(true); }} className="text-red-600 hover:text-red-700 font-medium">Șterge</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL DETALII COMANDA */}
            {arataModalDetalii && comandaSelectata && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                            <div>
                                <h3 className="text-xl font-bold">Detalii Comandă #{comandaSelectata._id.slice(-6)}</h3>
                                <p className="text-sm text-gray-500">{comandaSelectata.dateLivrare?.nume} • {comandaSelectata.dateLivrare?.telefon}</p>
                            </div>
                            <button onClick={() => setArataModalDetalii(false)} className="text-2xl text-gray-400 hover:text-white">&times;</button>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Adresă Livrare</h4>
                                <p className="text-sm">{comandaSelectata.dateLivrare?.adresa}, {comandaSelectata.dateLivrare?.oras}</p>
                            </div>

                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs uppercase text-gray-500 border-b border-gray-200 dark:border-gray-800">
                                        <th className="py-2">Produs</th>
                                        <th className="py-2 text-center">Cantitate</th>
                                        <th className="py-2 text-right">Preț Unit.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {comandaSelectata.produse.map((p, index) => (
                                        <tr key={index} className="text-sm">
                                            <td className="py-3 font-medium">{p.titlu}</td>
                                            <td className="py-3 text-center">x {p.cantitate}</td>
                                            <td className="py-3 text-right">{p.pret} RON</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
                                <span className="font-bold text-lg">Total de plată:</span>
                                <span className="font-black text-xl text-blue-600 dark:text-blue-400">{comandaSelectata.total} RON</span>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end rounded-b-2xl">
                            <button onClick={() => setArataModalDetalii(false)} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold">Închide</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE STERGE/ADAUGA CARTE SI STERGE COMANDA (DIN CODUL ANTERIOR) */}
            {arataModalStergere && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 text-2xl">⚠️</div>
                        <h3 className="text-xl font-bold mb-2">Ștergi cartea?</h3>
                        <p className="text-gray-500 text-sm mb-6">Acțiunea este ireversibilă.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setArataModalStergere(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg">Anulează</button>
                            <button onClick={confirmaStergerea} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Șterge</button>
                        </div>
                    </div>
                </div>
            )}

            {arataModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-800">
                            <h3 className="text-xl font-bold">{idEditare ? 'Editează Înregistrarea' : 'Adaugă Carte Nouă'}</h3>
                            <button onClick={inchideModal} className="text-2xl">&times;</button>
                        </div>
                        <form onSubmit={salveazaCarte} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            {['isbn', 'titlu', 'autor', 'editura', 'categorie'].map(camp => (
                                <div key={camp}>
                                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">{camp}</label>
                                    <input type="text" required value={dateFormular[camp]} onChange={(e) => setDateFormular({ ...dateFormular, [camp]: e.target.value })} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Preț (RON)</label>
                                <input type="number" required value={dateFormular.pret} onChange={(e) => setDateFormular({ ...dateFormular, pret: e.target.value })} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Stoc (Buc)</label>
                                <input type="number" required value={dateFormular.stoc} onChange={(e) => setDateFormular({ ...dateFormular, stoc: e.target.value })} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Link Imagine Copertă</label>
                                <input type="text" required value={dateFormular.imagine_url} onChange={(e) => setDateFormular({ ...dateFormular, imagine_url: e.target.value })} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-800">
                                <button type="button" onClick={inchideModal} className="px-5 py-2.5 bg-gray-800 rounded-lg font-medium"> Renunță </button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold"> {idEditare ? 'Salvează' : 'Adaugă'} </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {arataModalStergereComanda && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 text-2xl">🗑️</div>
                        <h3 className="text-xl font-bold mb-2">Ștergi comanda?</h3>
                        <p className="text-gray-500 text-sm mb-6">Atenție: Aceasta elimină definitiv comanda din baza de date.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setArataModalStergereComanda(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg">Renunță</button>
                            <button onClick={confirmaStergereaComanda} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Șterge</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;