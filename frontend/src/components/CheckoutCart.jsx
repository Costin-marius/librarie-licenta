import { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PromoContext } from '../context/PromoContext';

function CheckoutCart({
    cos,
    totalCos,
    setArataCos,
    modificaCantitate,
    eliminaDinCos,
    setCos,
    userId,
    fetchCarti
}) {
    const [metodaPlata, setMetodaPlata] = useState('ramburs');
    const [dateLivrare, setDateLivrare] = useState({ nume: '', adresa: '', telefon: '' });
    const [codReducere, setCodReducere] = useState('');
    const [mesajReducere, setMesajReducere] = useState({ text: '', type: '' });
    const [reducereAplicata, setReducereAplicata] = useState(false);
    
    // NOU: Extragem contextul comunicat în interfață pentru a ști dacă el a ascuns banner-ul din tavan.
    const { isBannerVisible } = useContext(PromoContext);

    const aplicaReducere = (e) => {
        e.preventDefault();
        if (codReducere.trim().toUpperCase() === 'LIBRARIE10') {
            if (totalCos >= 180) {
                setReducereAplicata(true);
                setMesajReducere({ text: 'Cod aplicat! Ai primit 10% reducere.', type: 'success' });
            } else {
                setReducereAplicata(false);
                setMesajReducere({ text: 'Comanda trebuie să fie de minim 180 lei pentru a aplica acest cod.', type: 'error' });
            }
        } else {
            if (codReducere.trim() !== '') {
                setReducereAplicata(false);
                setMesajReducere({ text: 'Cod invalid sau expirat.', type: 'error' });
            } else {
                setReducereAplicata(false);
                setMesajReducere({ text: '', type: '' });
            }
        }
    };

    const plaseazaComanda = async (e) => {
        e.preventDefault();
        const idUtilizator = userId || localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        if (!idUtilizator && !localStorage.getItem('rol')) {
            toast.error("Trebuie să fii autentificat pentru a plasa o comandă!");
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
            return;
        }

        const valoareReducere = reducereAplicata ? totalCos * 0.1 : 0;
        const totalDupaReducere = totalCos - valoareReducere;
        const costTransport = totalDupaReducere >= 150 ? 0 : 30;
        const totalFinal = totalDupaReducere + costTransport;

        const dateComanda = {
            userId: idUtilizator,
            dateLivrare,
            metodaPlata,
            total: Number(totalFinal.toFixed(2)),
            sumaReducere: Number(valoareReducere.toFixed(2)),
            codReducereAplicat: reducereAplicata ? 'LIBRARIE10' : null,
            produse: cos.map(item => ({ 
                carteId: item._id, 
                titlu: item.titlu, 
                cantitate: item.cantitate, 
                pret: item.pret 
            }))
        };

        try {
            if (metodaPlata === 'card') {
                toast.info("Te redirecționăm către platforma de plată securizată Stripe...");
                
                // Trimitem toate datele direct către sesiunea Stripe (nu salvăm încă în DB)
                const resStripe = await axios.post('http://localhost:5000/api/stripe/create-checkout-session', {
                    userId: idUtilizator,
                    produse: dateComanda.produse,
                    dateLivrare: dateComanda.dateLivrare,
                    totalFinal: dateComanda.total,
                    sumaReducere: dateComanda.sumaReducere,
                    codReducereAplicat: dateComanda.codReducereAplicat
                });
                
                window.location.href = resStripe.data.url;
                return;
            }

            // Dacă e Ramburs, păstrăm fluxul clasic
            const response = await axios.post('http://localhost:5000/api/comenzi', dateComanda);
            toast.success(`Comanda plasată cu succes!`);
            
            if (token) {
                try {
                    await axios.delete('http://localhost:5000/api/user/cos/goleste', { 
                        headers: { Authorization: `Bearer ${token}` } 
                    });
                } catch (err) {
                    console.error("Nu am putut goli coșul din baza de date", err);
                }
            }
            
            setCos([]);
            setDateLivrare({ nume: '', adresa: '', telefon: '' });
            setArataCos(false);
            if (fetchCarti) fetchCarti();
        } catch (error) {
            console.error(error);
            toast.error("Eroare la procesarea comenzii. Verifică datele introduse!");
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-stone-200 dark:border-slate-700 transition-colors duration-300">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-slate-700 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-anthracite dark:text-stone-100">🛒 Finalizare Comandă</h2>
            </div>

            {cos.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-stone-500 dark:text-stone-400 text-lg mb-4">Coșul tău este gol.</p>
                    <button 
                        onClick={() => setArataCos(false)} 
                        className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
                    >
                        Întoarce-te la magazin
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Partea stanga: Lista de produse */}
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
                        <div className="mt-8 border-t border-stone-200 dark:border-slate-700 pt-6">
                            <div className="flex flex-col gap-2 mb-6">
                                {(!reducereAplicata && !isBannerVisible) && (
                                    <div className="flex items-center gap-3 mb-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 shadow-sm transition-colors">
                                        <span className="text-xl">🎁</span>
                                        <p className="text-sm font-medium">Nu uita! Poți folosi codul <strong>LIBRARIE10</strong> pentru a primi extra reducere.</p>
                                    </div>
                                )}
                                <label className="text-sm font-semibold text-anthracite dark:text-stone-300">Ai un cod de reducere?</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Introdu codul aici..."
                                        value={codReducere}
                                        onChange={(e) => setCodReducere(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 rounded-lg text-anthracite dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors"
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); aplicaReducere(e); } }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={aplicaReducere}
                                        className="bg-stone-200 hover:bg-stone-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-anthracite dark:text-stone-200 px-4 py-2 rounded-lg font-semibold transition-colors"
                                    >
                                        Aplică
                                    </button>
                                </div>
                                {mesajReducere.text && (
                                    <p className={`text-sm mt-1 ${mesajReducere.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {mesajReducere.text}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-stone-500 dark:text-stone-400">Subtotal:</span>
                                <span className="font-semibold text-anthracite dark:text-stone-300">{totalCos.toFixed(2)} RON</span>
                            </div>
                            {reducereAplicata && (
                                <div className="flex justify-between items-center mb-2 text-green-600 dark:text-green-400">
                                    <span>Reducere (10%):</span>
                                    <span className="font-semibold">-{(totalCos * 0.1).toFixed(2)} RON</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-200 dark:border-slate-700">
                                <span className="text-stone-600 dark:text-stone-300 text-lg font-bold">Total produse:</span>
                                <span className="text-3xl font-bold text-anthracite dark:text-white">
                                    {(reducereAplicata ? totalCos * 0.9 : totalCos).toFixed(2)} <span className="text-amber-500 text-lg">RON</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Partea dreapta: Formularul de comanda */}
                    <div className="bg-stone-50 dark:bg-slate-900 p-6 rounded-xl border border-stone-200 dark:border-slate-700 h-fit transition-colors">
                        <h3 className="text-xl font-semibold mb-4 text-anthracite dark:text-stone-200">Detalii Livrare & Plată</h3>
                        <form onSubmit={plaseazaComanda} className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Numele Complet" 
                                required 
                                value={dateLivrare.nume} 
                                onChange={e => setDateLivrare({...dateLivrare, nume: e.target.value})} 
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors" 
                            />
                            <input 
                                type="text" 
                                placeholder="Adresa completă de livrare" 
                                required 
                                value={dateLivrare.adresa} 
                                onChange={e => setDateLivrare({...dateLivrare, adresa: e.target.value})} 
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors" 
                            />
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

                            {/* Metoda de plata */}
                            <div className="pt-4">
                                <h4 className="font-medium text-anthracite dark:text-stone-300 mb-3">Metoda de Plată</h4>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            name="plata" 
                                            value="ramburs" 
                                            checked={metodaPlata === 'ramburs'} 
                                            onChange={() => setMetodaPlata('ramburs')} 
                                            className="w-4 h-4 text-amber-500 bg-white dark:bg-slate-800 border-stone-300 dark:border-slate-600 focus:ring-amber-500" 
                                        />
                                        <span className="text-stone-600 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Ramburs (La livrare)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            name="plata" 
                                            value="card" 
                                            checked={metodaPlata === 'card'} 
                                            onChange={() => setMetodaPlata('card')} 
                                            className="w-4 h-4 text-amber-500 bg-white dark:bg-slate-800 border-stone-300 dark:border-slate-600 focus:ring-amber-500" 
                                        />
                                        <span className="text-stone-600 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Card bancar</span>
                                    </label>
                                </div>
                            </div>

                            {/* Info Stripe pentru Card */}
                            {metodaPlata === 'card' && (
                                <div className="bg-stone-50 dark:bg-slate-900 p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm mt-4 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        <p className="text-amber-600 dark:text-amber-500 font-bold">Plată Securizată Stripe</p>
                                    </div>
                                    <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                                        Vei fi redirecționat către platforma securizată Stripe pentru a efectua plata. Aplicația noastră nu colectează și nu stochează datele cardului tău.
                                    </p>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="w-full mt-6 bg-anthracite dark:bg-amber-600 hover:bg-black dark:hover:bg-amber-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-lg flex justify-center items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Finalizează Comanda
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CheckoutCart;