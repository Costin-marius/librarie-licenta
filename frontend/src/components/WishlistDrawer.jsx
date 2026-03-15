import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function WishlistDrawer({ deschis, setDeschis, wishlist, setWishlist }) {
    const [carti, setCarti] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (deschis) {
            setLoading(true);
            axios.get('http://localhost:5000/api/carti')
                .then(res => {
                    const allBooks = res.data;
                    const wishlistBooks = allBooks.filter(b => wishlist.includes(b._id));
                    setCarti(wishlistBooks);
                })
                .catch(err => {
                    console.error("Eroare incarcare carti wishlist", err);
                    toast.error("A apărut o eroare la încărcarea listei de favorite.");
                })
                .finally(() => setLoading(false));
        }
    }, [deschis, wishlist]);

    const elimina = (carteId) => {
        setWishlist(prev => prev.filter(id => id !== carteId));
        toast.info("Cartea a fost eliminată din Favorite.");
    };

    if (!deschis) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeschis(false)}></div>
            
            <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300">
                <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-slate-800">
                    <h2 className="text-2xl font-serif font-bold text-anthracite dark:text-stone-100 flex items-center gap-3">
                        <svg className="w-6 h-6 text-red-500 fill-red-500" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        Colecția Mea
                    </h2>
                    <button onClick={() => setDeschis(false)} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="text-center text-stone-500 dark:text-stone-400 py-10">Încărcare...</div>
                    ) : carti.length === 0 ? (
                        <div className="text-center py-10">
                            <svg className="w-16 h-16 mx-auto text-stone-300 dark:text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            <p className="text-stone-500 dark:text-stone-400 mt-2 font-medium">Nu ai nicio carte în favorite.</p>
                        </div>
                    ) : (
                        carti.map(carte => (
                            <div key={carte._id} className="group flex gap-4 bg-stone-50 dark:bg-slate-800 p-4 rounded-xl border border-stone-200 dark:border-slate-700 relative hover:border-amber-400 dark:hover:border-amber-500 transition-colors">
                                <div className="w-20 h-28 flex-shrink-0">
                                    <img src={carte.imagine_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80"} alt={carte.titlu} className="w-full h-full object-cover rounded-md shadow-sm" />
                                </div>
                                <div className="flex flex-col flex-grow pr-8">
                                    <p className="text-[10px] uppercase text-stone-500 font-bold mb-1 line-clamp-1">{carte.autor}</p>
                                    <h4 className="text-sm font-serif font-bold text-anthracite dark:text-stone-200 line-clamp-2 mb-2">{carte.titlu}</h4>
                                    <span className="mt-auto text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500 font-black text-lg">
                                        {carte.pret} <span className="text-xs font-bold text-amber-500 opacity-80 uppercase">RON</span>
                                    </span>
                                </div>
                                <button 
                                    onClick={() => elimina(carte._id)}
                                    className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                                    title="Elimină din Wishlist"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
