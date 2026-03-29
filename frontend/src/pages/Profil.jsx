import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importăm noile componente
import IstoricComenzi from '../components/profil/IstoricComenzi';

const Profil = ({ inapoiLaHome }) => {
    const [dateUser, setDateUser] = useState({ nume: '', email: '', adresa: '' });
    const [parole, setParole] = useState({ parolaVeche: '', parolaNoua: '' });

    // --- State pentru Comenzi ---
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

                // Aducem istoricul de comenzi securizat
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

        // Refresh automat la comenzi (pentru efect Wow cu CronJob-ul)
        const intervalId = setInterval(async () => {
            try {
                const res = await fetch('http://localhost:5000/api/user/comenzi', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setComenzi(data);
                }
            } catch (err) {
                console.error("Eroare la refresh comenzi");
            }
        }, 30000);

        return () => clearInterval(intervalId); // Curățăm intervalul
    }, [token, rol]);

    // 2. Salvare date personale
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

    // --- RENDER CONDITIONAL ---
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-anthracite dark:text-stone-300">Încărcare...</div>
    }

    if (!token && !rol) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-ivory dark:bg-slate-900 transition-colors duration-300">
                <ToastContainer position="bottom-right" theme="dark" autoClose={3000}/>
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

    // --- RENDER PRINCIPAL ---
    return (
        <div className="w-full bg-ivory dark:bg-slate-900 transition-colors duration-300 font-sans pb-20">
            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Profil */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-12 border-b border-stone-200 dark:border-slate-700/50 pb-8 pt-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer inline-block">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-3xl font-serif font-bold shadow-lg overflow-hidden border-4 border-white dark:border-slate-800">
                                {dateUser.nume ? dateUser.nume.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-anthracite dark:text-stone-100 flex items-center gap-3">
                                {dateUser.nume || 'Utilizator'}
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-1 rounded-md font-semibold font-sans tracking-wide">VERIFICAT</span>
                            </h2>
                            <p className="text-stone-500 dark:text-stone-400 font-medium mt-1 mb-4">{dateUser.email || 'Email neconectat'}</p>
                            <button 
                                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                                className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-800/50 px-5 py-2 rounded-xl transition-colors shadow-sm w-fit"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                Delogare
                            </button>
                        </div>
                    </div>
                    <button onClick={inapoiLaHome} className="mt-6 md:mt-0 flex items-center gap-2 text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 font-medium transition-colors bg-white dark:bg-slate-800 px-6 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 shadow-sm">
                        Înapoi la Magazin
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* COLOANA STÂNGA: Setări Profil */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Date Personale */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 transition-colors">
                            <h3 className="text-xl font-bold text-anthracite dark:text-stone-100 mb-6">Date Personale</h3>
                            <form onSubmit={handleSalvareDate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5">Email (Restricționat)</label>
                                    <input type="email" value={dateUser.email} disabled className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700/50 rounded-xl text-stone-500 cursor-not-allowed transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">Numele complet</label>
                                    <input type="text" value={dateUser.nume} onChange={(e) => setDateUser({...dateUser, nume: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">Adresă livrare</label>
                                    <textarea value={dateUser.adresa} onChange={(e) => setDateUser({...dateUser, adresa: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-amber-500 outline-none transition-colors resize-none" rows="3"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 mt-4 rounded-xl transition-all shadow-md">
                                    Salvează
                                </button>
                            </form>
                        </div>

                        {/* Schimbare Parolă */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 transition-colors">
                            <h3 className="text-xl font-bold text-anthracite dark:text-stone-100 mb-6">Securitate Cont</h3>
                            <form onSubmit={handleSchimbareParola} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">Parola veche</label>
                                    <input type="password" value={parole.parolaVeche} onChange={(e) => setParole({...parole, parolaVeche: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-slate-500 outline-none transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5">Parola nouă</label>
                                    <input type="password" value={parole.parolaNoua} onChange={(e) => setParole({...parole, parolaNoua: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-xl text-anthracite dark:text-stone-200 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" required />
                                </div>
                                <button type="submit" className="w-full mt-4 bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-600 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-700 hover:text-white font-bold py-2.5 rounded-xl transition-all">
                                    Actualizează Parola
                                </button>
                            </form>
                        </div>

                    </div>

                    <div className="lg:col-span-8">
                        <IstoricComenzi 
                            comenzi={comenzi} 
                            dateUser={dateUser} 
                            inapoiLaHome={inapoiLaHome} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profil;