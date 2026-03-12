import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Profil from './Profil';
import { Link } from 'react-router-dom';

function Home({ cos, setCos, arataCos, setArataCos, termenCautare }) {
    // State-uri principale
    const [carti, setCarti] = useState([]); 
    const [arataProfil, setArataProfil] = useState(false);
    
    // State-uri pentru Admin
    const [arataFormular, setArataFormular] = useState(false);
    const [idEditare, setIdEditare] = useState(null); 
    const [dateFormular, setDateFormular] = useState({
        isbn: '', titlu: '', autor: '', editura: '', categorie: '', pret: '', stoc: '', imagine_url: ''
    });

    // Filtrare și Sortare
    const [categorieSelectata, setCategorieSelectata] = useState('Toate');
    const [criteriuSortare, setCriteriuSortare] = useState('default');

    // Date pentru comandă
    const [metodaPlata, setMetodaPlata] = useState('ramburs'); 
    const [dateLivrare, setDateLivrare] = useState({ nume: '', adresa: '', telefon: '' });
    const [dateCard, setDateCard] = useState({ numar: '', expirare: '', cvv: '' });

    // Preluăm cărțile la montarea componentei
    useEffect(() => {
        fetchCarti();
    }, []);

    const fetchCarti = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/carti');
            setCarti(response.data);
        } catch (error) {
            console.error("Eroare:", error);
            toast.error("Nu am putut încărca cărțile.");
        }
    };

    // Funcții pentru Admin
    const salveazaCarte = async (e) => {
        e.preventDefault(); 
        try {
            if (idEditare) {
                await axios.put(`http://localhost:5000/api/carti/${idEditare}`, dateFormular);
                toast.success('Cartea a fost actualizată!');
            } else {
                await axios.post('http://localhost:5000/api/carti', dateFormular);
                toast.success('Cartea a fost adăugată!');
            }
            anuleazaFormular(); 
            fetchCarti();       
        } catch (error) {
            toast.error('Eroare la salvare!');
        }
    };

    const deschideEditare = (carte) => {
        setDateFormular({
            isbn: carte.isbn, 
            titlu: carte.titlu, 
            autor: carte.autor, 
            editura: carte.editura, 
            categorie: carte.categorie || '', 
            pret: carte.pret, 
            stoc: carte.stoc, 
            imagine_url: carte.imagine_url
        });
        setIdEditare(carte._id); 
        setArataFormular(true);  
        setArataCos(false); 
        setArataProfil(false); // Ne asigurăm că profilul e închis când deschidem editarea
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const stergeCarte = async (id) => {
        if (window.confirm("Ești sigur că vrei să ștergi această carte?")) {
            try {
                await axios.delete(`http://localhost:5000/api/carti/${id}`);
                toast.success("Cartea a fost ștearsă!");
                fetchCarti(); 
            } catch (error) {
                toast.error("Eroare la ștergere!");
            }
        }
    };

    const anuleazaFormular = () => {
        setArataFormular(false);
        setIdEditare(null);
        setDateFormular({ isbn: '', titlu: '', autor: '', editura: '', categorie: '', pret: '', stoc: '', imagine_url: '' });
    };

    // Funcții pentru coș
    const adaugaInCos = (carte) => {
        const existaInCos = cos.find(item => item._id === carte._id);
        if (existaInCos) {
            setCos(cos.map(item => item._id === carte._id ? { ...item, cantitate: item.cantitate + 1 } : item));
        } else {
            setCos([...cos, { ...carte, cantitate: 1 }]);
        }
        toast.success(`"${carte.titlu}" a fost adăugată în coș!`);
    };

    const modificaCantitate = (id, delta) => {
        setCos(cos.map(item => {
            if (item._id === id) {
                const nouaCantitate = item.cantitate + delta;
                return { ...item, cantitate: nouaCantitate > 0 ? nouaCantitate : 1 };
            }
            return item;
        }));
    };

    const eliminaDinCos = (id) => {
        setCos(cos.filter(item => item._id !== id));
        toast.error('Produs eliminat din coș.');
    };

    const totalCos = cos.reduce((total, item) => total + (item.pret * item.cantitate), 0);

    // Finalizare comandă
    const plaseazaComanda = async (e) => {
        e.preventDefault();
        const dateComanda = {
            dateLivrare,
            metodaPlata,
            total: Number(totalCos.toFixed(2)), 
            produse: cos.map(item => ({
                carteId: item._id, titlu: item.titlu, cantitate: item.cantitate, pret: item.pret
            }))
        };

        try {
            await axios.post('http://localhost:5000/api/comenzi', dateComanda);
            toast.success(`Comanda plasată cu succes!`);
            setCos([]);
            setDateLivrare({ nume: '', adresa: '', telefon: '' });
            setDateCard({ numar: '', expirare: '', cvv: '' });
            setArataCos(false);
            fetchCarti(); 
        } catch (error) {
            toast.error("Eroare la plasarea comenzii.");
        }
    };

    // Logică pentru filtrarea și sortarea listei de cărți
    const categoriiDisponibile = ['Toate', ...new Set(carti.map(c => c.categorie).filter(cat => cat && cat.trim() !== ''))];

    let cartiProcesate = carti.filter(carte => {
        const textDeCautat = `${carte.titlu} ${carte.autor} ${carte.isbn}`.toLowerCase();
        const sePotrivesteCautarea = textDeCautat.includes(termenCautare?.toLowerCase() || '');
        const sePotrivesteCategoria = categorieSelectata === 'Toate' || carte.categorie === categorieSelectata;
        
        return sePotrivesteCautarea && sePotrivesteCategoria;
    });

    if (criteriuSortare === 'pretCresc') {
        cartiProcesate.sort((a, b) => a.pret - b.pret);
    } else if (criteriuSortare === 'pretDesc') {
        cartiProcesate.sort((a, b) => b.pret - a.pret);
    } else if (criteriuSortare === 'az') {
        cartiProcesate.sort((a, b) => a.titlu.localeCompare(b.titlu));
    } else if (criteriuSortare === 'za') {
        cartiProcesate.sort((a, b) => b.titlu.localeCompare(a.titlu));
    }

    return (
        <div className="flex-1 w-full bg-gray-950 text-gray-200 p-8 font-sans overflow-auto">
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />

            <div className="max-w-7xl mx-auto">
                
                {/* AICI ESTE LOGICA PRINCIPALĂ: Dacă arataProfil e TRUE, arătăm Profilul. Dacă e FALSE, arătăm restul paginii */}
                {arataProfil ? (
                    <Profil inapoiLaHome={() => setArataProfil(false)} />
                ) : (
                    <>
                        {/* Filtre și Sortare */}
                        {!arataCos && !arataFormular && (
                            <div className="flex flex-col md:flex-row gap-4 mb-10 justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
                                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" style={{ scrollbarWidth: 'none' }}>
                                    {categoriiDisponibile.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategorieSelectata(cat)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                                categorieSelectata === cat 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <span className="text-gray-400 text-sm whitespace-nowrap">Sortează:</span>
                                    <select
                                        value={criteriuSortare}
                                        onChange={(e) => setCriteriuSortare(e.target.value)}
                                        className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none cursor-pointer"
                                    >
                                        <option value="default">Relevanță</option>
                                        <option value="pretCresc">Preț: Crescător</option>
                                        <option value="pretDesc">Preț: Descrescător</option>
                                        <option value="az">Titlu: A - Z</option>
                                        <option value="za">Titlu: Z - A</option>
                                    </select>

                                    {/* BUTON TEMPORAR DE PROFIL (Poți să îl muți în meniul tău de sus mai târziu) */}
                                    <button 
                                        onClick={() => setArataProfil(true)} 
                                        className="ml-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold whitespace-nowrap"
                                    >
                                        👤 Profilul Meu
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Formular Admin (Adăugare / Editare) */}
                        {arataFormular && !arataCos && (
                            <div className="bg-gray-900 p-8 rounded-2xl shadow-lg mb-10 border border-gray-800">
                                <h3 className="text-xl font-bold mb-6 text-gray-100 border-b border-gray-700 pb-3">
                                    {idEditare ? '✏️ Editează detaliile cărții' : '➕ Adaugă o carte nouă'}
                                </h3>
                                <form onSubmit={salveazaCarte} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {['isbn', 'titlu', 'autor', 'editura', 'categorie'].map(camp => (
                                        <input key={camp} type="text" placeholder={camp.charAt(0).toUpperCase() + camp.slice(1)} required value={dateFormular[camp]} onChange={(e) => setDateFormular({...dateFormular, [camp]: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                                    ))}
                                    <input type="number" placeholder="Preț (RON)" required value={dateFormular.pret} onChange={(e) => setDateFormular({...dateFormular, pret: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                                    <input type="number" placeholder="Stoc (Buc)" required value={dateFormular.stoc} onChange={(e) => setDateFormular({...dateFormular, stoc: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                                    <input type="text" placeholder="Link Imagine" required value={dateFormular.imagine_url} onChange={(e) => setDateFormular({...dateFormular, imagine_url: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none lg:col-span-2"/>
                                    
                                    <div className="lg:col-span-3 flex gap-3 mt-2">
                                        <button type="submit" className={`px-6 py-2.5 rounded-lg font-bold text-white transition ${idEditare ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                            {idEditare ? 'Salvează Modificările' : 'Salvează Cartea'}
                                        </button>
                                        <button type="button" onClick={anuleazaFormular} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition">
                                            Anulează
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Pagina de Checkout */}
                        {arataCos ? (
                            <div className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800">
                                <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-gray-100">🛒 Finalizare Comandă</h2>
                                    <button onClick={() => setArataCos(false)} className="text-gray-400 hover:text-white transition">Înapoi la magazin</button>
                                </div>
                                
                                {cos.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-400 text-lg mb-4">Coșul tău este gol.</p>
                                        <button onClick={() => setArataCos(false)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                                            Întoarce-te la magazin
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        
                                        {/* Lista Produse din Coș */}
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4 text-gray-300">Produsele tale</h3>
                                            <div className="space-y-4">
                                                {cos.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700">
                                                        <div className="flex-1">
                                                            <strong className="text-gray-200 block">{item.titlu}</strong>
                                                            <span className="text-gray-400 text-sm">{item.pret} RON / buc.</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 mx-4">
                                                            <button onClick={() => modificaCantitate(item._id, -1)} className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded flex items-center justify-center font-bold">-</button>
                                                            <span className="font-bold text-lg w-4 text-center">{item.cantitate}</span>
                                                            <button onClick={() => modificaCantitate(item._id, 1)} className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded flex items-center justify-center font-bold">+</button>
                                                        </div>
                                                        <button onClick={() => eliminaDinCos(item._id)} className="text-red-400 hover:text-red-300 p-2 transition">
                                                            ❌
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 text-right">
                                                <span className="text-gray-400 text-lg mr-2">Total de plată:</span>
                                                <span className="text-3xl font-bold text-green-400">{totalCos.toFixed(2)} RON</span>
                                            </div>
                                        </div>

                                        {/* Formular Date Livrare și Plată */}
                                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
                                            <h3 className="text-xl font-semibold mb-4 text-gray-200">Detalii Livrare & Plată</h3>
                                            <form onSubmit={plaseazaComanda} className="space-y-4">
                                                <input type="text" placeholder="Numele Complet" required value={dateLivrare.nume} onChange={e => setDateLivrare({...dateLivrare, nume: e.target.value})} className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                                <input type="text" placeholder="Adresa completă de livrare" required value={dateLivrare.adresa} onChange={e => setDateLivrare({...dateLivrare, adresa: e.target.value})} className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                                <input 
                                                    type="tel" 
                                                    placeholder="Număr de telefon (10 cifre, ex: 0712345678)" 
                                                    required 
                                                    value={dateLivrare.telefon} 
                                                    onChange={e => {
                                                        const doarNumere = e.target.value.replace(/[^0-9]/g, '');
                                                        if(doarNumere.length <= 10) setDateLivrare({...dateLivrare, telefon: doarNumere});
                                                    }} 
                                                    className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                                                        dateLivrare.telefon.length > 0 && dateLivrare.telefon.length !== 10 
                                                        ? 'border-red-500 focus:ring-red-500' 
                                                        : 'border-gray-600 focus:ring-blue-500'
                                                    }`} 
                                                />
                                                
                                                <div className="pt-4">
                                                    <h4 className="font-medium text-gray-300 mb-3">Metoda de Plată</h4>
                                                    <div className="flex gap-6">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="radio" name="plata" value="ramburs" checked={metodaPlata === 'ramburs'} onChange={() => setMetodaPlata('ramburs')} className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600" /> 
                                                            <span className="text-gray-300">Ramburs</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="radio" name="plata" value="card" checked={metodaPlata === 'card'} onChange={() => setMetodaPlata('card')} className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600" /> 
                                                            <span className="text-gray-300">Card bancar</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {metodaPlata === 'card' && (
                                                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-700 shadow-inner mt-4 space-y-4">
                                                        <p className="text-blue-400 text-sm font-bold flex items-center gap-2">💳 Plată Securizată</p>
                                                        
                                                        <input 
                                                            type="text" 
                                                            placeholder="Număr Card (16 cifre)" 
                                                            required={metodaPlata === 'card'} 
                                                            value={dateCard.numar}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                if(val.length <= 16) setDateCard({...dateCard, numar: val});
                                                            }}
                                                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                                                                dateCard.numar.length > 0 && dateCard.numar.length !== 16 ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                                                            }`}
                                                        />
                                                        
                                                        <div className="flex gap-4">
                                                            <input 
                                                                type="text" 
                                                                placeholder="LL/AA (ex: 12/25)" 
                                                                required={metodaPlata === 'card'} 
                                                                value={dateCard.expirare}
                                                                onChange={e => {
                                                                    let val = e.target.value.replace(/[^0-9]/g, ''); 
                                                                    if (val.length >= 3) {
                                                                        val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                                    }
                                                                    setDateCard({...dateCard, expirare: val});
                                                                }}
                                                                className={`w-1/2 px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                                                                    dateCard.expirare.length > 0 && dateCard.expirare.length !== 5 ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                                                                }`}
                                                            />
                                                            
                                                            <input 
                                                                type="text" 
                                                                placeholder="CVV (3 cifre)" 
                                                                required={metodaPlata === 'card'} 
                                                                value={dateCard.cvv}
                                                                onChange={e => {
                                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                                    if(val.length <= 3) setDateCard({...dateCard, cvv: val});
                                                                }}
                                                                className={`w-1/2 px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                                                                    dateCard.cvv.length > 0 && dateCard.cvv.length !== 3 ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                                                                }`}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <button type="submit" className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-md text-lg">
                                                    ✅ Finalizează Comanda
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Grila cu Cărți */
                            <>
                                {cartiProcesate.length === 0 ? (
                                    <div className="text-center py-16">
                                        <p className="text-2xl text-gray-500 mb-2">😕 Nu am găsit nicio carte care să corespundă criteriilor.</p>
                                        <button onClick={() => {setTermenCautare(''); setCategorieSelectata('Toate');}} className="mt-4 text-blue-400 hover:text-blue-300 underline">
                                            Resetează filtrele
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                        {cartiProcesate.map((carte) => (
                                            <div key={carte._id} className="bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-300 overflow-hidden flex flex-col border border-gray-800 relative">
                                                <Link to={`/carte/${carte._id}`} className="h-56 overflow-hidden block">
                                                    <img 
                                                        src={carte.imagine_url} 
                                                        alt={carte.titlu} 
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                                                    />
                                                </Link>
                                                
                                                <div className="p-5 flex flex-col flex-grow">
                                                    
                                                    <div className="mb-2">
                                                        <span className="bg-blue-900/40 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border border-blue-800/50">
                                                            {carte.categorie || 'Fără categorie'}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-gray-100 mb-1 line-clamp-2">{carte.titlu}</h3>
                                                    <p className="text-sm text-gray-400 mb-2">{carte.autor}</p>
                                                    
                                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                                        <span className="text-2xl font-black text-blue-400">{carte.pret} lei</span>
                                                        <span className="text-xs font-medium bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700">Stoc: {carte.stoc}</span>
                                                    </div>
                                                    
                                                    {carte.stoc > 0 ? (
                                                        <button 
                                                            onClick={() => adaugaInCos(carte)} 
                                                            className="w-full mt-4 bg-gray-800 hover:bg-blue-600 text-white border border-gray-700 hover:border-blue-600 font-semibold py-2.5 rounded-lg transition-colors"
                                                        >
                                                            Adaugă în coș
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            disabled
                                                            className="w-full mt-4 bg-red-900/40 text-red-400 border border-red-800 font-semibold py-2.5 rounded-lg cursor-not-allowed opacity-80"
                                                        >
                                                            Stoc insuficient
                                                        </button>
                                                    )}

                                                    {localStorage.getItem('rol') === 'admin' && (
                                                        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-800">
                                                            <button onClick={() => deschideEditare(carte)} className="flex-1 bg-amber-900/40 hover:bg-amber-800/60 text-amber-400 py-1.5 rounded-md text-sm font-medium transition">
                                                                ✏️ Edit
                                                            </button>
                                                            <button onClick={() => stergeCarte(carte._id)} className="flex-1 bg-red-900/40 hover:bg-red-800/60 text-red-400 py-1.5 rounded-md text-sm font-medium transition">
                                                                🗑️ Șterge
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;