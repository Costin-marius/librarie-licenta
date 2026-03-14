import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Profil = ({ inapoiLaHome }) => {
    const [dateUser, setDateUser] = useState({ nume: '', email: '', adresa: '' });
    const [parole, setParole] = useState({ parolaVeche: '', parolaNoua: '' });
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    
    // In caz ca avem react-router, folosim hooks de navigare - daca nu, o aratam prin logică fallback
    // const navigate = useNavigate();

    // 1. Aducem datele de la backend când se deschide pagina
    useEffect(() => {
        // AUTENTIFICARE GUEST CHECK
        if (!token && !rol) {
            toast.error("Trebuie să fii autentificat pentru a accesa profilul!");
            // setTimeout(() => navigate('/login'), 2000); // Varianta de react-router
            setLoading(false);
            return;
        }

        const fetchProfil = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/user/profil', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setDateUser({ nume: data.nume, email: data.email, adresa: data.adresa || '' });
                    // Pentru mock data daca nu e in backend: 
                    // setWishlist(data.wishlist || mockWishlistBooks);
                } else {
                    toast.error("Sesiune invalida. Te rugam sa te loghezi din nou.");
                }
            } catch (error) {
                console.error("Eroare:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfil();

        // Încărcare Mock Wishlist data (deoarece implementăm complet frontend conform cerinței)
        const savedWishlistIds = localStorage.getItem('wishlist') ? JSON.parse(localStorage.getItem('wishlist')) : [];
        if (savedWishlistIds.length > 0) {
            // Mocking book data that corresponds to wishlist IDs
            // Aici pe viitor trebuie sa se faca fetch de la `api/carti?ids=${savedWishlistIds}`
            const mockWishlistBooks = savedWishlistIds.map(id => ({
                _id: id,
                titlu: "Carte Salvată (" + id.substring(0,4) + ")",
                autor: "Autor Necunoscut",
                pret: "45.00",
                imagine_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop"
            }));
            setWishlist(mockWishlistBooks);
        }

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

    const eliminaDinWishlist = (idToRemove) => {
        const updateIds = wishlist.filter(item => item._id !== idToRemove).map(item => item._id);
        localStorage.setItem('wishlist', JSON.stringify(updateIds));
        setWishlist(wishlist.filter(item => item._id !== idToRemove));
        toast.info("Cartea a fost eliminată din Favorite.");
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-anthracite dark:text-stone-300">Încărcare...</div>
    }

    if (!token && !rol) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-ivory dark:bg-slate-900 transition-colors duration-300">
                <ToastContainer position="top-right" theme="dark" autoClose={3000}/>
                <h2 className="text-3xl font-serif text-anthracite dark:text-stone-100 mb-6">Acces restricționat</h2>
                <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-md text-center">Trebuie să fii autentificat pentru a accesa setările profilului tău și lista de preferințe.</p>
                <div className="flex gap-4">
                    {/* Presupunând că login-ul se face dintr-o altă pagină, poți adapta un <Link> aici */}
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

    return (
        <div className="w-full bg-ivory dark:bg-slate-900 transition-colors duration-300 font-sans pb-20">
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />
            
            <div className="max-w-6xl mx-auto">
                {/* Header Profil */}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* SETĂRI CONT - Col 1 */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Date Personale */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-stone-100 dark:border-slate-700 transition-colors">
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
                                    Salvează Modificările
                                </button>
                            </form>
                        </div>

                        {/* Schimbare Parolă */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-stone-100 dark:border-slate-700 transition-colors">
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

                    {/* WISHLIST SECȚIUNE - Col 2&3 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-stone-100 dark:border-slate-700 transition-colors h-full">
                            <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-700/70 pb-5 mb-8">
                                <h3 className="text-2xl font-serif font-bold text-anthracite dark:text-stone-100 flex items-center gap-3">
                                    <svg className="w-6 h-6 text-red-500 fill-red-500" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                    Colecția Mea (Wishlist)
                                </h3>
                                <div className="text-sm text-stone-500 dark:text-stone-400 font-medium">
                                    {wishlist.length} {wishlist.length === 1 ? 'Titlu Salvat' : 'Titluri Salvate'}
                                </div>
                            </div>

                            {wishlist.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-24 h-24 mb-6 rounded-full bg-stone-50 dark:bg-slate-900 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-stone-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-anthracite dark:text-stone-300 mb-2">Nu ai salvat nicio carte</h4>
                                    <p className="text-stone-500 dark:text-stone-500 max-w-sm mb-6">Apasă pe inima din colțul oricărei cărți pentru a o adăuga în lista ta privată.</p>
                                    <button onClick={inapoiLaHome} className="px-6 py-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-500 hover:text-white transition-all">
                                        Explorează Magazinul
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {wishlist.map((carte) => (
                                        <div key={carte._id} className="group flex gap-4 bg-stone-50 dark:bg-slate-900 p-4 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300 relative">
                                            
                                            <div className="w-20 h-28 flex-shrink-0">
                                                <img src={carte.imagine_url} alt={carte.titlu} className="w-full h-full object-cover rounded-md shadow-md" />
                                            </div>
                                            
                                            <div className="flex flex-col justify-center flex-grow pr-6">
                                                <p className="text-[10px] uppercase text-stone-500 font-bold mb-1">{carte.autor}</p>
                                                <h4 className="text-base font-serif font-bold text-anthracite dark:text-stone-100 line-clamp-2 leading-tight mb-2">{carte.titlu}</h4>
                                                <span className="inline-block mt-auto text-amber-600 dark:text-amber-500 font-bold text-sm bg-amber-50 dark:bg-slate-800 px-2.5 py-1 rounded-md w-max border border-amber-100 dark:border-slate-700">
                                                    {carte.pret} RON
                                                </span>
                                            </div>

                                            <button 
                                                onClick={() => eliminaDinWishlist(carte._id)}
                                                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                                                title="Elimină din Wishlist"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
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