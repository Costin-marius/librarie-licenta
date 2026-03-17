import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profil = ({ inapoiLaHome }) => {
    const [dateUser, setDateUser] = useState({ nume: '', email: '', adresa: '' });
    const [parole, setParole] = useState({ parolaVeche: '', parolaNoua: '' });
    
    // --- NOU: State pentru Comenzi ---
    const [comenzi, setComenzi] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    // 1. Aducem datele de la backend când se deschide pagina
    useEffect(() => {
        if (!token && !rol) {
            toast.error("Trebuie să fii autentificat pentru a accesa profilul!");
            setLoading(false);
            return;
        }

        const fetchProfilSiComenzi = async () => {
            try {
                // Aducem datele profilului
                const resProfil = await fetch('http://localhost:5000/api/user/profil', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (resProfil.ok) {
                    const data = await resProfil.json();
                    setDateUser({ nume: data.nume, email: data.email, adresa: data.adresa || '' });
                } else {
                    toast.error("Sesiune invalida. Te rugam sa te loghezi din nou.");
                    return;
                }

                // --- NOU: Aducem istoricul de comenzi securizat ---
                const resComenzi = await fetch('http://localhost:5000/api/user/comenzi', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (resComenzi.ok) {
                    const dataComenzi = await resComenzi.json();
                    setComenzi(dataComenzi);
                }
                
            } catch (error) {
                console.error("Eroare:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfilSiComenzi();

        // --- NOU: Refresh automat la comenzi (opțional, pentru efect Wow la prezentare) ---
        // Aducem comenzile din nou o dată la 30 de secunde, ca să vedem CronJob-ul în acțiune fără refresh manual
        const intervalId = setInterval(async () => {
             try {
                const res = await fetch('http://localhost:5000/api/user/comenzi', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setComenzi(data);
                }
             } catch (err) { console.error("Eroare la refresh comenzi"); }
        }, 30000);

        return () => clearInterval(intervalId); // Curățăm intervalul când plecăm de pe pagină

    }, [token, rol]);


    // 2. Salvare date personale (Nume și Adresă)
    const handleSalvareDate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/user/actualizare', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nume: dateUser.nume, adresa: dateUser.adresa })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(data.mesaj || "Profil actualizat cu succes!");
                localStorage.setItem('nume', dateUser.nume);
            } else {
                toast.error(data.mesaj);
            }
        } catch (error) {
            toast.error('Eroare la server privind actualizarea datelor.');
        }
    };

    // 3. Schimbare parolă
    const handleSchimbareParola = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/user/schimba-parola', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(parole)
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(data.mesaj || "Parola schimbată cu succes!");
                setParole({ parolaVeche: '', parolaNoua: '' });
            } else {
                toast.error(data.mesaj);
            }
        } catch (error) {
            toast.error('Eroare la server privind schimbarea parolei.');
        }
    };

    // --- NOU: Funcție helper pentru randarea Stepper-ului de status ---
    const randeazaStatusComanda = (statusCurent) => {
        const stari = ['Plasată', 'În procesare', 'Expediată', 'Livrată'];
        const indexCurent = stari.indexOf(statusCurent) !== -1 ? stari.indexOf(statusCurent) : 0;

        return (
            <div className="w-full mt-6 mb-4 px-2">
                <div className="flex items-center justify-between relative">
                    {/* Linia din spate care leagă bulinele */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-slate-700 -z-10 rounded"></div>
                    
                    {/* Linia verde care arată progresul (se lungește în funcție de status) */}
                    <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-500 -z-10 rounded transition-all duration-500 ease-in-out"
                        style={{ width: `${(indexCurent / (stari.length - 1)) * 100}%` }}
                    ></div>

                    {/* Bulinele pentru fiecare pas */}
                    {stari.map((stare, index) => {
                        const completat = index <= indexCurent;
                        return (
                            <div key={stare} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-800 px-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 shadow-sm
                                    ${completat ? 'bg-amber-500 border-amber-500 text-white' : 'bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-gray-500'}
                                `}>
                                    {completat ? '✓' : index + 1}
                                </div>
                                <span className={`text-xs font-semibold uppercase tracking-wider hidden sm:block ${completat ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {stare}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- RENDER CONDITIONAL LOADING / ERROR ---
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-anthracite dark:text-stone-300">Încărcare...</div>
    }

    if (!token && !rol) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-ivory dark:bg-slate-900 transition-colors duration-300">
                <ToastContainer position="top-right" theme="dark" autoClose={3000}/>
                <h2 className="text-3xl font-serif text-anthracite dark:text-stone-100 mb-6">Acces restricționat</h2>
                <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-md text-center">Trebuie să fii autentificat pentru a accesa setările profilului tău.</p>
                <div className="flex gap-4">
                    <button onClick={() => window.location.href = '/login'} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all shadow-md">
                        Autentificare
                    </button>
                    <button onClick={inapoiLaHome} className="px-8 py-3 bg-white dark:bg-slate-800 text-anthracite dark:text-stone-200 border border-stone-200 dark:border-slate-700 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-slate-700 transition-all">
                        Înapoi la Magazin
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER PRINCIPAL PROFIL ---
    return (
        <div className="w-full bg-ivory dark:bg-slate-900 transition-colors duration-300 font-sans pb-20">
            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Profil (Neschimbat) */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-12 border-b border-stone-200 dark:border-slate-700/50 pb-8 pt-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer inline-block">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-3xl font-serif font-bold shadow-lg overflow-hidden border-4 border-white dark:border-slate-800">
                                {dateUser.nume ? dateUser.nume.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-anthracite dark:text-stone-100 flex items-center gap-3">
                                {dateUser.nume || 'Utilizator'}
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-1 rounded-md font-semibold font-sans tracking-wide">VERIFICAT</span>
                            </h2>
                            <p className="text-stone-500 dark:text-stone-400 font-medium mt-1">{dateUser.email || 'Email neconectat'}</p>
                        </div>
                    </div>
                    
                    <button onClick={inapoiLaHome} className="mt-6 md:mt-0 flex items-center gap-2 text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 font-medium transition-colors bg-white dark:bg-slate-800 px-6 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Înapoi la Magazin
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* COLOANA STÂNGA: Setări Profil (Ocupă 4 coloane din 12 pe ecrane mari) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Date Personale */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-stone-100 dark:border-slate-700 transition-colors">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-slate-700 text-amber-500 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-anthracite dark:text-stone-100">Date Personale</h3>
                            </div>
                            <form onSubmit={handleSalvareDate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5 inline-flex items-center gap-1">Email <span className="text-stone-400 text-xs font-normal">(Restricționat)</span></label>
                                    <input type="email" value={dateUser.email} disabled className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700/50 rounded-xl text-stone-500 dark:text-stone-500 cursor-not-allowed transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">Numele complet</label>
                                    <input type="text" value={dateUser.nume} onChange={(e) => setDateUser({...dateUser, nume: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors border-l-4 border-l-amber-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">Adresă principală livrare</label>
                                    <textarea value={dateUser.adresa} onChange={(e) => setDateUser({...dateUser, adresa: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors resize-none" rows="3" placeholder="Strada, Număr, Oraș, Județ..."></textarea>
                                </div>
                                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 mt-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Salvează
                                </button>
                            </form>
                        </div>

                        {/* Schimbare Parolă */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-stone-100 dark:border-slate-700 transition-colors">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-anthracite dark:text-stone-100">Securitate Cont</h3>
                            </div>
                            <form onSubmit={handleSchimbareParola} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">Parola veche</label>
                                    <input type="password" value={parole.parolaVeche} onChange={(e) => setParole({...parole, parolaVeche: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">Parola nouă</label>
                                    <input type="password" value={parole.parolaNoua} onChange={(e) => setParole({...parole, parolaNoua: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors border-l-4 border-l-emerald-500" required />
                                </div>
                                <button type="submit" className="w-full mt-4 bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-600 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-700 hover:text-anthracite dark:hover:text-white font-bold py-2.5 rounded-xl transition-all">
                                    Actualizează Parola
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* COLOANA DREAPTĂ: Comenzile Mele (Ocupă 8 coloane din 12 pe ecrane mari) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-stone-100 dark:border-slate-700 transition-colors h-full">
                            
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-500 flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-anthracite dark:text-stone-100">Comenzile Mele</h3>
                                </div>
                                <span className="bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 px-3 py-1 rounded-full text-sm font-bold">
                                    {comenzi.length} Comenzi
                                </span>
                            </div>

                            {/* Lista de comenzi */}
                            {comenzi.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-24 h-24 mb-4 text-gray-200 dark:text-slate-700">
                                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4C8.9 2 8 2.9 8 4v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm10 15H4V9h16v10z"></path></svg>
                                    </div>
                                    <p className="text-stone-500 dark:text-stone-400 text-lg mb-4">Nu ai plasat nicio comandă încă.</p>
                                    <button onClick={inapoiLaHome} className="text-amber-500 font-bold hover:underline">
                                        Descoperă cărțile noastre
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {comenzi.map((comanda) => (
                                        <div key={comanda._id} className="border border-gray-200 dark:border-slate-600 rounded-xl p-5 sm:p-6 bg-stone-50/50 dark:bg-slate-900/50 hover:shadow-md transition-shadow">
                                            
                                            {/* Header Comandă (Info bază) */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                <div>
                                                    <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">ID Comandă: {comanda._id.slice(-8)}</p>
                                                    <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                                                        Plasată pe: <span className="font-bold text-anthracite dark:text-white">{new Date(comanda.createdAt).toLocaleDateString('ro-RO')}</span>
                                                    </p>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Total Plată</p>
                                                    <p className="text-xl font-black text-amber-600 dark:text-amber-500">{comanda.total} lei</p>
                                                </div>
                                            </div>

                                            {/* Stepper-ul magic de status */}
                                            {randeazaStatusComanda(comanda.stare)}

                                            {/* Detalii Produse (Acordeon simplu - opțional poți adăuga un buton de expand, acum le arătăm mereu) */}
                                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                                                <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-4">Produse comandate:</h4>
                                                <ul className="space-y-3">
                                                    {comanda.produse.map((produs, idx) => (
                                                        <li key={idx} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-6 h-6 rounded bg-gray-200 dark:bg-slate-700 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold text-xs">{produs.cantitate}x</span>
                                                                <span className="text-stone-600 dark:text-stone-300 font-medium line-clamp-1">{produs.titlu}</span>
                                                            </div>
                                                            <span className="font-bold text-stone-500 dark:text-stone-400 whitespace-nowrap">{produs.pret} lei</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profil;