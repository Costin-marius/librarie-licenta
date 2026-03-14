import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Profil from './Profil';
import { Link } from 'react-router-dom';

function Home({ cos, setCos, arataCos, setArataCos, termenCautare, userId }) {
    const [carti, setCarti] = useState([]); 
    const [arataProfil, setArataProfil] = useState(false);
    const [arataFormular, setArataFormular] = useState(false);
    const [idEditare, setIdEditare] = useState(null); 
    const [dateFormular, setDateFormular] = useState({
        isbn: '', titlu: '', autor: '', editura: '', categorie: '', pret: '', stoc: '', imagine_url: ''
    });
    const [categorieSelectata, setCategorieSelectata] = useState('Toate');
    const [criteriuSortare, setCriteriuSortare] = useState('default');
    const [metodaPlata, setMetodaPlata] = useState('ramburs'); 
    const [dateLivrare, setDateLivrare] = useState({ nume: '', adresa: '', telefon: '' });
    const [dateCard, setDateCard] = useState({ numar: '', expirare: '', cvv: '' });

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
            isbn: carte.isbn, titlu: carte.titlu, autor: carte.autor, editura: carte.editura, 
            categorie: carte.categorie || '', pret: carte.pret, stoc: carte.stoc, imagine_url: carte.imagine_url
        });
        setIdEditare(carte._id); 
        setArataFormular(true);  
        setArataCos(false); 
        setArataProfil(false);
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

    const plaseazaComanda = async (e) => {
        e.preventDefault();
        const dateComanda = {
            dateLivrare, metodaPlata, total: Number(totalCos.toFixed(2)), 
            produse: cos.map(item => ({ carteId: item._id, titlu: item.titlu, cantitate: item.cantitate, pret: item.pret }))
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

    const categoriiDisponibile = ['Toate', ...new Set(carti.map(c => c.categorie).filter(cat => cat && cat.trim() !== ''))];

    let cartiProcesate = carti.filter(carte => {
        const textDeCautat = `${carte.titlu} ${carte.autor} ${carte.isbn}`.toLowerCase();
        const sePotrivesteCautarea = textDeCautat.includes(termenCautare?.toLowerCase() || '');
        const sePotrivesteCategoria = categorieSelectata === 'Toate' || carte.categorie === categorieSelectata;
        return sePotrivesteCautarea && sePotrivesteCategoria;
    });

    if (criteriuSortare === 'pretCresc') cartiProcesate.sort((a, b) => a.pret - b.pret);
    else if (criteriuSortare === 'pretDesc') cartiProcesate.sort((a, b) => b.pret - a.pret);
    else if (criteriuSortare === 'az') cartiProcesate.sort((a, b) => a.titlu.localeCompare(b.titlu));
    else if (criteriuSortare === 'za') cartiProcesate.sort((a, b) => b.titlu.localeCompare(a.titlu));

    return (
        <div className="flex-1 w-full bg-ivory dark:bg-slate-900 transition-colors duration-300 font-sans overflow-x-hidden">
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />

            <div className="w-full">
                {arataProfil ? (
                    <div className="pt-8 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
                        <Profil inapoiLaHome={() => setArataProfil(false)} />
                    </div>
                ) : (
                    <>
                        <div className="pt-8 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
                            {/* HERO SECTION */}
                            {!arataCos && !arataFormular && (
                                <section className="relative rounded-[2rem] overflow-hidden bg-cream dark:bg-slate-800 mb-16 shadow-inner transition-colors duration-300">
                                    <div className="flex flex-col md:flex-row items-center min-h-[500px]">
                                        <div className="w-full md:w-1/2 p-10 md:p-20 z-10">
                                            <span className="inline-block px-4 py-1 rounded-full bg-amber-100 dark:bg-slate-700 text-amber-700 dark:text-amber-500 text-xs font-semibold tracking-widest uppercase mb-6 transition-colors duration-300">
                                                Cartea Săptămânii
                                            </span>
                                            <h1 className="text-5xl md:text-7xl font-serif font-bold text-anthracite dark:text-stone-100 mb-6 leading-tight transition-colors duration-300">
                                                Umbra Vântului
                                            </h1>
                                            <p className="text-lg text-stone-600 dark:text-stone-400 mb-10 max-w-md leading-relaxed transition-colors duration-300">
                                                O incursiune misterioasă în inima Barcelonei postbelice. Descoperă Cimitirul Cărților Uitate într-o ediție de colecție.
                                            </p>
                                            <button className="px-10 py-4 bg-anthracite dark:bg-slate-700 text-white rounded-full font-medium hover:bg-black dark:hover:bg-slate-600 transition-all transform hover:scale-105 active:scale-95">
                                                Descoperă
                                            </button>
                                        </div>
                                        <div className="w-full md:w-1/2 relative h-[400px] md:h-full">
                                            <img 
                                                alt="Umbra Vantului Book Cover" 
                                                className="absolute inset-0 w-full h-full object-cover" 
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBd_Cznv90MBeDG5BXxGOxPTVVqvDhiA_E2OveGpK0T3vxW69cGJi7kK2WW1whbWfjxktk3sE-IWrXcJ5ub2TKFjHNuE742uOMx6kvWFIRIS-GRvQI9PKlr4YHQZ6-ofGXtWfvPzRparDu0QrDvidAyE1mFG7I2_gqbZhfsNKWFE6ytMVzEdD2rC0AjzcWLfgpR8BA3BT-_arGHvOF3rPp-3X-QOyZ8LIZd6YCbgdkp3eI5cO86ehvWCrChe58pXezCCqHdLvCeCo"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-cream dark:from-slate-800 via-transparent to-transparent transition-colors duration-300"></div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* CATEGORIES & FILTERS SECTION */}
                            {!arataCos && !arataFormular && (
                                <section className="mb-12">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                                        <h2 className="text-3xl font-serif font-bold text-anthracite dark:text-stone-100 transition-colors duration-300">
                                            Răsfoiește Colecțiile
                                        </h2>
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <span className="text-stone-600 dark:text-stone-400 text-sm whitespace-nowrap">Sortează:</span>
                                            <select
                                                value={criteriuSortare}
                                                onChange={(e) => setCriteriuSortare(e.target.value)}
                                                className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-anthracite dark:text-stone-300 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2 outline-none cursor-pointer transition-colors"
                                            >
                                                <option value="default">Relevanță</option>
                                                <option value="pretCresc">Preț: Crescător</option>
                                                <option value="pretDesc">Preț: Descrescător</option>
                                                <option value="az">Titlu: A - Z</option>
                                                <option value="za">Titlu: Z - A</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
                                        {categoriiDisponibile.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategorieSelectata(cat)}
                                                className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                                                    categorieSelectata === cat 
                                                    ? 'bg-amber-500 text-white shadow-md' 
                                                    : 'bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-stone-300 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-500'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* ADMIN FORM */}
                            {arataFormular && !arataCos && (
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg mb-10 border border-stone-200 dark:border-slate-700 transition-colors duration-300">
                                    <h3 className="text-xl font-bold mb-6 text-anthracite dark:text-stone-100 border-b border-stone-100 dark:border-slate-700 pb-3">
                                        {idEditare ? '✏️ Editează detaliile cărții' : '➕ Adaugă o carte nouă'}
                                    </h3>
                                    <form onSubmit={salveazaCarte} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {['isbn', 'titlu', 'autor', 'editura', 'categorie'].map(camp => (
                                            <input key={camp} type="text" placeholder={camp.charAt(0).toUpperCase() + camp.slice(1)} required value={dateFormular[camp]} onChange={(e) => setDateFormular({...dateFormular, [camp]: e.target.value})} className="w-full px-4 py-2 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors" />
                                        ))}
                                        <input type="number" placeholder="Preț (RON)" required value={dateFormular.pret} onChange={(e) => setDateFormular({...dateFormular, pret: e.target.value})} className="w-full px-4 py-2 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors" />
                                        <input type="number" placeholder="Stoc (Buc)" required value={dateFormular.stoc} onChange={(e) => setDateFormular({...dateFormular, stoc: e.target.value})} className="w-full px-4 py-2 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Link Imagine" required value={dateFormular.imagine_url} onChange={(e) => setDateFormular({...dateFormular, imagine_url: e.target.value})} className="w-full px-4 py-2 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none lg:col-span-2 transition-colors" />
                                        
                                        <div className="lg:col-span-3 flex gap-3 mt-2">
                                            <button type="submit" className={`px-6 py-2.5 rounded-lg font-bold text-white transition ${idEditare ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                                                {idEditare ? 'Salvează Modificările' : 'Salvează Cartea'}
                                            </button>
                                            <button type="button" onClick={anuleazaFormular} className="px-6 py-2.5 bg-stone-200 dark:bg-slate-700 hover:bg-stone-300 dark:hover:bg-slate-600 text-stone-800 dark:text-stone-200 rounded-lg font-medium transition">
                                                Anulează
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* CHECKOUT / COS */}
                            {arataCos ? (
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-stone-200 dark:border-slate-700 transition-colors duration-300">
                                    <div className="flex justify-between items-center border-b border-stone-100 dark:border-slate-700 pb-4 mb-6">
                                        <h2 className="text-2xl font-bold text-anthracite dark:text-stone-100">🛒 Finalizare Comandă</h2>
                                        <button onClick={() => setArataCos(false)} className="text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Înapoi la magazin</button>
                                    </div>
                                    
                                    {cos.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-stone-500 dark:text-stone-400 text-lg mb-4">Coșul tău este gol.</p>
                                            <button onClick={() => setArataCos(false)} className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition">
                                                Întoarce-te la magazin
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-anthracite dark:text-stone-300">Produsele tale</h3>
                                                <div className="space-y-4">
                                                    {cos.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center bg-stone-50 dark:bg-slate-900 p-4 rounded-xl border border-stone-200 dark:border-slate-700 transition-colors">
                                                            <div className="flex-1">
                                                                <strong className="text-anthracite dark:text-stone-200 block">{item.titlu}</strong>
                                                                <span className="text-stone-500 dark:text-stone-400 text-sm">{item.pret} RON / buc.</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mx-4">
                                                                <button onClick={() => modificaCantitate(item._id, -1)} className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-700 text-anthracite dark:text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors">-</button>
                                                                <span className="font-bold text-lg w-4 text-center dark:text-stone-200">{item.cantitate}</span>
                                                                <button onClick={() => modificaCantitate(item._id, 1)} className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-700 text-anthracite dark:text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors">+</button>
                                                            </div>
                                                            <button onClick={() => eliminaDinCos(item._id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 transition">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-6 text-right">
                                                    <span className="text-stone-500 dark:text-stone-400 text-lg mr-2">Total de plată:</span>
                                                    <span className="text-3xl font-bold text-anthracite dark:text-white">{totalCos.toFixed(2)} <span className="text-amber-500">RON</span></span>
                                                </div>
                                            </div>

                                            <div className="bg-stone-50 dark:bg-slate-900 p-6 rounded-xl border border-stone-200 dark:border-slate-700 h-fit transition-colors">
                                                <h3 className="text-xl font-semibold mb-4 text-anthracite dark:text-stone-200">Detalii Livrare & Plată</h3>
                                                <form onSubmit={plaseazaComanda} className="space-y-4">
                                                    <input type="text" placeholder="Numele Complet" required value={dateLivrare.nume} onChange={e => setDateLivrare({...dateLivrare, nume: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors" />
                                                    <input type="text" placeholder="Adresa completă de livrare" required value={dateLivrare.adresa} onChange={e => setDateLivrare({...dateLivrare, adresa: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors" />
                                                    <input 
                                                        type="tel" 
                                                        placeholder="Număr de telefon (10 cifre)" 
                                                        required 
                                                        value={dateLivrare.telefon} 
                                                        onChange={e => {
                                                            const doarNumere = e.target.value.replace(/[^0-9]/g, '');
                                                            if(doarNumere.length <= 10) setDateLivrare({...dateLivrare, telefon: doarNumere});
                                                        }} 
                                                        className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl text-anthracite dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                                                            dateLivrare.telefon.length > 0 && dateLivrare.telefon.length !== 10 
                                                            ? 'border-red-500 focus:ring-red-500' 
                                                            : 'border-stone-200 dark:border-slate-600 focus:ring-amber-500'
                                                        }`} 
                                                    />
                                                    
                                                    <div className="pt-4">
                                                        <h4 className="font-medium text-anthracite dark:text-stone-300 mb-3">Metoda de Plată</h4>
                                                        <div className="flex gap-6">
                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                <input type="radio" name="plata" value="ramburs" checked={metodaPlata === 'ramburs'} onChange={() => setMetodaPlata('ramburs')} className="w-4 h-4 text-amber-500 bg-white dark:bg-slate-800 border-stone-300 dark:border-slate-600 focus:ring-amber-500" /> 
                                                                <span className="text-stone-600 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Ramburs (La livrare)</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                <input type="radio" name="plata" value="card" checked={metodaPlata === 'card'} onChange={() => setMetodaPlata('card')} className="w-4 h-4 text-amber-500 bg-white dark:bg-slate-800 border-stone-300 dark:border-slate-600 focus:ring-amber-500" /> 
                                                                <span className="text-stone-600 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Card bancar</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {metodaPlata === 'card' && (
                                                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-stone-200 dark:border-slate-700 shadow-sm mt-4 space-y-4 transition-colors">
                                                            <p className="text-amber-600 dark:text-amber-500 text-sm font-bold flex items-center gap-2">💳 Plată Securizată</p>
                                                            <input 
                                                                type="text" 
                                                                placeholder="Număr Card (16 cifre)" 
                                                                required={metodaPlata === 'card'} 
                                                                value={dateCard.numar}
                                                                onChange={e => {
                                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                                    if(val.length <= 16) setDateCard({...dateCard, numar: val});
                                                                }}
                                                                className={`w-full px-4 py-2 bg-stone-50 dark:bg-slate-900 border rounded-lg text-anthracite dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                                                                    dateCard.numar.length > 0 && dateCard.numar.length !== 16 ? 'border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-slate-600 focus:ring-amber-500'
                                                                }`}
                                                            />
                                                            <div className="flex gap-4">
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Expirare (LL/AA)" 
                                                                    required={metodaPlata === 'card'} 
                                                                    value={dateCard.expirare}
                                                                    onChange={e => {
                                                                        let val = e.target.value.replace(/[^0-9]/g, ''); 
                                                                        if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                                        setDateCard({...dateCard, expirare: val});
                                                                    }}
                                                                    className={`w-1/2 px-4 py-2 bg-stone-50 dark:bg-slate-900 border rounded-lg text-anthracite dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                                                                        dateCard.expirare.length > 0 && dateCard.expirare.length !== 5 ? 'border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-slate-600 focus:ring-amber-500'
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
                                                                    className={`w-1/2 px-4 py-2 bg-stone-50 dark:bg-slate-900 border rounded-lg text-anthracite dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                                                                        dateCard.cvv.length > 0 && dateCard.cvv.length !== 3 ? 'border-red-500 focus:ring-red-500' : 'border-stone-200 dark:border-slate-600 focus:ring-amber-500'
                                                                    }`}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <button type="submit" className="w-full mt-6 bg-anthracite dark:bg-amber-600 hover:bg-black dark:hover:bg-amber-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-lg flex justify-center items-center gap-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                        Finalizează Comanda
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* GRILA DE CĂRȚI (PREMIUM DESIGN) */
                                <>
                                    {cartiProcesate.length === 0 ? (
                                        <div className="text-center py-16">
                                            <p className="text-2xl text-stone-500 dark:text-stone-400 mb-2">😕 Nu am găsit nicio carte care să corespundă criteriilor.</p>
                                            <button onClick={() => {setTermenCautare(''); setCategorieSelectata('Toate');}} className="mt-4 text-amber-600 hover:text-amber-700 underline font-medium">
                                                Resetează filtrele
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pt-10" data-purpose="product-grid">
                                            {cartiProcesate.map((carte) => (
                                                <div key={carte._id} className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.02)] dark:shadow-none dark:border dark:border-slate-700/50 transition-all duration-500" data-purpose="book-card">
                                                    
                                                    <div className="relative mb-4">
                                                        <Link to={`/carte/${carte._id}`}>
                                                            {/* Asymmetric Overlapping Cover cu Link */}
                                                            <div className="absolute top-0 left-0 w-3/4 aspect-[2/3] -translate-y-5 -translate-x-2.5 group-hover:-translate-y-7 group-hover:-translate-x-3 group-hover:scale-105 transition-all duration-500 z-10">
                                                                <img alt={carte.titlu} className="w-full h-full object-cover rounded-md shadow-2xl dark:shadow-slate-950/50" src={carte.imagine_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop"}/>
                                                            </div>
                                                        </Link>
                                                        <div className="aspect-[2/3] w-3/4 opacity-0 pointer-events-none"></div>
                                                        
                                                        {/* Status Badges */}
                                                        <div className="absolute top-0 right-0 z-20 flex flex-col items-end gap-2">
                                                            {carte.stoc <= 3 && carte.stoc > 0 && (
                                                                <span className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-md border border-red-100 dark:border-red-900/50 uppercase tracking-tight">Doar {carte.stoc} în stoc</span>
                                                            )}
                                                            <span className="px-3 py-1 bg-amber-50 dark:bg-slate-700 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-md border border-amber-100 dark:border-slate-600">{carte.pret} Lei</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-8 transition-colors duration-300">
                                                        <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-semibold mb-1">{carte.autor}</p>
                                                        <h3 className="text-xl font-serif font-bold text-anthracite dark:text-stone-100 line-clamp-1">{carte.titlu}</h3>
                                                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 line-clamp-2">Editura: {carte.editura} | Categorie: {carte.categorie}</p>
                                                    </div>

                                                    {/* Animated Button */}
                                                    <div className="mt-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                                        {carte.stoc > 0 ? (
                                                            <button onClick={(e) => { e.preventDefault(); adaugaInCos(carte); }} className="w-full py-3 bg-cream dark:bg-slate-700/50 text-anthracite dark:text-stone-200 border border-stone-200 dark:border-slate-600 rounded-xl font-medium hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white dark:hover:text-white hover:border-amber-500 dark:hover:border-amber-500 transition-all flex items-center justify-center gap-2 shadow-sm">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                                Adaugă în coș
                                                            </button>
                                                        ) : (
                                                            <button disabled className="w-full py-3 bg-stone-100 dark:bg-slate-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-slate-700 rounded-xl font-medium cursor-not-allowed flex items-center justify-center transition-all">
                                                                Stoc Epuizat
                                                            </button>
                                                        )}
                                                    </div>

                                                    {localStorage.getItem('rol') === 'admin' && (
                                                        <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-slate-700">
                                                            <button onClick={() => deschideEditare(carte)} className="flex-1 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 text-stone-600 dark:text-stone-300 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">
                                                                Editează
                                                            </button>
                                                            <button onClick={() => stergeCarte(carte._id)} className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">
                                                                Șterge
                                                            </button>
                                                        </div>
                                                    )}

                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* FOOTER */}
            <footer className="bg-anthracite dark:bg-slate-950 text-stone-300 py-16 px-6 md:px-12 transition-colors duration-300 mt-20" data-purpose="main-footer">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-3xl font-serif font-bold text-white mb-6">InkWell</h2>
                        <p className="max-w-sm text-stone-400 mb-8">
                            Un refugiu digital pentru iubitorii de cuvinte. Selecționăm cu grijă fiecare titlu pentru a-ți oferi nu doar o carte, ci o experiență senzorială completă.
                        </p>
                        <div className="flex space-x-4">
                            <a className="w-10 h-10 rounded-full bg-stone-800 dark:bg-slate-800 flex items-center justify-center hover:bg-amber-500 dark:hover:bg-amber-500 transition-colors" href="#">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                            </a>
                            <a className="w-10 h-10 rounded-full bg-stone-800 dark:bg-slate-800 flex items-center justify-center hover:bg-amber-500 dark:hover:bg-amber-500 transition-colors" href="#">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-6">Explorează</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a className="hover:text-amber-500 transition-colors" href="#">Best Sellers</a></li>
                            <li><a className="hover:text-amber-500 transition-colors" href="#">Noutăți</a></li>
                            <li><a className="hover:text-amber-500 transition-colors" href="#">Ediții de lux</a></li>
                            <li><a className="hover:text-amber-500 transition-colors" href="#">Evenimente</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-6">Asistență</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a className="hover:text-amber-500 transition-colors" href="#">Livrări și Retur</a></li>
                            <li><a className="hover:text-amber-500 transition-colors" href="#">Întrebări Frecvente</a></li>
                            <li><a className="hover:text-amber-500 transition-colors" href="#">Contact</a></li>
                            <li><a className="hover:text-amber-500 transition-colors" href="#">Card Cadou</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-800 dark:border-slate-800 text-xs text-stone-500 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
                    <p>© 2024 InkWell Boutique. Creat cu pasiune pentru cititori.</p>
                    <div className="flex space-x-6">
                        <a className="hover:text-white transition-colors" href="#">Politică de Confidențialitate</a>
                        <a className="hover:text-white transition-colors" href="#">Termeni și Condiții</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;