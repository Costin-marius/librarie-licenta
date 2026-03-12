import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Profil = ({ inapoiLaHome }) => {
    const [dateUser, setDateUser] = useState({ nume: '', email: '', adresa: '' });
    const [parole, setParole] = useState({ parolaVeche: '', parolaNoua: '' });
    const [wishlist, setWishlist] = useState([]);

    const token = localStorage.getItem('token');

    // 1. Aducem datele de la backend când se deschide pagina
    useEffect(() => {
        const fetchProfil = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/user/profil', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setDateUser({ nume: data.nume, email: data.email, adresa: data.adresa || '' });
                    setWishlist(data.wishlist || []);
                }
            } catch (error) {
                console.error("Eroare:", error);
            }
        };
        if (token) fetchProfil();
    }, [token]);

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
                toast.success(data.mesaj);
                localStorage.setItem('nume', dateUser.nume); // Actualizăm și numele din meniul de sus
            } else {
                toast.error(data.mesaj);
            }
        } catch (error) {
            toast.error('Eroare la server.');
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
                toast.success(data.mesaj);
                setParole({ parolaVeche: '', parolaNoua: '' }); 
            } else {
                toast.error(data.mesaj);
            }
        } catch (error) {
            toast.error('Eroare la server.');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto text-gray-200">
            <button onClick={inapoiLaHome} className="mb-6 text-amber-500 hover:text-amber-400 font-bold">
                &larr; Înapoi la Magazin
            </button>
            
            <h2 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-4">Profilul Meu</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SETĂRI CONT */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-amber-500">Date Personale</h3>
                    <form onSubmit={handleSalvareDate} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email (nu poate fi modificat)</label>
                            <input type="email" value={dateUser.email} disabled className="w-full p-2 bg-gray-900 rounded border border-gray-700 text-gray-500 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Numele tău</label>
                            <input type="text" value={dateUser.nume} onChange={(e) => setDateUser({...dateUser, nume: e.target.value})} className="w-full p-2 bg-gray-900 rounded border border-gray-700 focus:border-amber-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Adresă de livrare</label>
                            <textarea value={dateUser.adresa} onChange={(e) => setDateUser({...dateUser, adresa: e.target.value})} className="w-full p-2 bg-gray-900 rounded border border-gray-700 focus:border-amber-500 outline-none" rows="3" placeholder="Strada, Număr, Oraș, Județ..."></textarea>
                        </div>
                        <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded transition mt-2">Salvează Datele</button>
                    </form>
                </div>

                {/* SCHIMBARE PAROLĂ */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-fit">
                    <h3 className="text-xl font-semibold mb-4 text-amber-500">Schimbă Parola</h3>
                    <form onSubmit={handleSchimbareParola} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Parola veche</label>
                            <input type="password" value={parole.parolaVeche} onChange={(e) => setParole({...parole, parolaVeche: e.target.value})} className="w-full p-2 bg-gray-900 rounded border border-gray-700 focus:border-amber-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Parola nouă</label>
                            <input type="password" value={parole.parolaNoua} onChange={(e) => setParole({...parole, parolaNoua: e.target.value})} className="w-full p-2 bg-gray-900 rounded border border-gray-700 focus:border-amber-500 outline-none" required />
                        </div>
                        <button type="submit" className="border border-amber-600 text-amber-500 hover:bg-amber-600 hover:text-white font-bold py-2 rounded transition mt-2">Schimbă Parola</button>
                    </form>
                </div>
            </div>

            {/* WISHLIST */}
            <div className="mt-12 bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-amber-500">Wishlist ❤️</h3>
                {wishlist.length === 0 ? (
                    <p className="text-gray-400">Nu ai adăugat nicio carte la favorite încă.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {wishlist.map((carte) => (
                            <div key={carte._id} className="bg-gray-900 p-4 rounded flex items-center justify-between border border-gray-700">
                                <div>
                                    <p className="font-bold">{carte.titlu}</p>
                                    <p className="text-sm text-gray-400">{carte.autor}</p>
                                </div>
                                <span className="text-amber-500 font-bold">{carte.pret} lei</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profil;