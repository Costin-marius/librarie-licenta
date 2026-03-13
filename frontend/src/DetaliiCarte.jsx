import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Am adăugat ToastContainer
import 'react-toastify/dist/ReactToastify.css';


function DetaliiCarte({ cos, setCos }) {
    const { id } = useParams(); 
    const [carte, setCarte] = useState(null);
    const [loading, setLoading] = useState(true);
    
    
    const [inWishlist, setInWishlist] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:5000/api/carti/${id}`)
            .then(response => {
                if (!response.ok) throw new Error("Cartea nu a fost găsită pe server");
                return response.json();
            })
            .then(data => {
                setCarte(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Eroare:", error);
                setLoading(false);
            });
    }, [id]);

  
    const apasaAdaugaInCos = async () => {
        
        const existaInCos = cos.find(item => item._id === carte._id);
        if (existaInCos) {
            setCos(cos.map(item => item._id === carte._id ? { ...item, cantitate: item.cantitate + 1 } : item));
        } else {
            setCos([...cos, { ...carte, cantitate: 1 }]);
        }
        
        toast.success(`"${carte.titlu}" a fost adăugată în coș! 🛒`);

        // Logica 2: Trimitem și către Backend-ul tău
        const token = localStorage.getItem('token'); 
        if (token) {
            try {
                await fetch('http://localhost:5000/api/user/cos/adauga', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ carteId: carte._id, cantitate: 1 })
                });
            } catch (eroare) {
                console.error("Eroare la salvarea coșului în BD:", eroare);
            }
        }
    };

    
    const apasaAdaugaInWishlist = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            toast.error("Trebuie să intri în cont ca să salvezi la favorite!");
            return;
        }

        
        setInWishlist(!inWishlist);

        try {
            const response = await fetch('http://localhost:5000/api/user/wishlist/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ carteId: carte._id })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(data.mesaj || (inWishlist ? "Eliminată din wishlist!" : "Adăugată în wishlist!")); 
            } else {
                // Dacă a eșuat pe server, dăm revert la inima vizuală
                setInWishlist(inWishlist);
                toast.error("A apărut o problemă la wishlist.");
            }
        } catch (eroare) {
            setInWishlist(inWishlist);
            console.error("Eroare la wishlist:", eroare);
            toast.error("A apărut o eroare neașteptată.");
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-950 text-gray-300 flex justify-center items-center text-xl">Se încarcă detaliile... ⏳</div>;
    if (!carte) return <div className="min-h-screen bg-gray-950 text-red-400 flex justify-center items-center text-xl font-bold">Cartea nu a fost găsită în sistem! 😕</div>;

    return (
        <div className="min-h-screen bg-gray-950 p-4 md:p-8 w-full font-sans overflow-auto flex-1">
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />
            
            {/* Bara de sus cu link-urile */}
            <div className="max-w-6xl mx-auto mb-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Link to="/" className="hover:text-blue-400 transition flex items-center gap-1">
                    <span>←</span> Înapoi la Produse
                </Link>
                <span>/</span>
                <span className="text-gray-500">{carte.categorie || 'Fără categorie'}</span>
                <span>/</span>
                <span className="text-gray-300 font-bold">{carte.titlu}</span>
            </div>

            <div className="max-w-6xl mx-auto bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden mb-10">
                <div className="flex flex-col md:flex-row p-6 md:p-10 gap-10">
                    
                    {/* COLOANA 1: Imaginea Cărții */}
                    <div className="w-full md:w-1/4 flex flex-col items-center">
                        <img 
                            src={carte.imagine_url || carte.imagine} 
                            alt={carte.titlu} 
                            className="w-full max-w-[250px] aspect-[2/3] object-cover rounded-md shadow-2xl border border-gray-700"
                        />
                    </div>

                    {/* COLOANA 2: Titlu, Autor, Categorii și Descriere */}
                    <div className="w-full md:w-2/4 flex flex-col">
                        <h1 className="text-3xl font-extrabold text-white mb-1">{carte.titlu}</h1>
                        <p className="text-lg text-gray-400 mb-6">de <span className="font-semibold text-blue-400">{carte.autor}</span></p>

                        <hr className="mb-6 border-gray-800" />

                        <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-300 mb-8">
                            <div><span className="text-gray-500">Categorii:</span> <span className="font-medium text-gray-200">{carte.categorie || '-'}</span></div>
                            <div><span className="text-gray-500">Editura:</span> <span className="font-medium text-gray-200">{carte.editura || '-'}</span></div>
                            <div><span className="text-gray-500">Limba:</span> <span className="font-medium text-gray-200">{carte.limba || 'Română'}</span></div>
                            <div><span className="text-gray-500">An publicare:</span> <span className="font-medium text-gray-200">{carte.anPublicare || '-'}</span></div>
                            <div><span className="text-gray-500">Nr. pagini:</span> <span className="font-medium text-gray-200">{carte.nrPagini || '-'}</span></div>
                            {carte.isbn && <div><span className="text-gray-500">ISBN:</span> <span className="font-medium text-gray-200">{carte.isbn}</span></div>}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3">Descriere</h3>
                        <p className="text-gray-400 leading-relaxed text-sm md:text-base text-justify">
                            {carte.descriere || "Descrierea nu este disponibilă momentan."}
                        </p>
                    </div>

                    {/* COLOANA 3: Prețul și butoanele de cumpărare */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-md sticky top-6">
                            <div className="mb-4">
                                <span className="text-4xl font-black text-white">{carte.pret} lei</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-6">
                                {carte.stoc > 0 ? (
                                    <span className="bg-green-900/30 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-800/50">
                                        ÎN STOC ({carte.stoc} buc)
                                    </span>
                                ) : (
                                    <span className="bg-red-900/30 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-800/50">
                                        STOC EPUIZAT
                                    </span>
                                )}
                            </div>

                            <button 
                                onClick={apasaAdaugaInCos}
                                disabled={carte.stoc <= 0}
                                className={`w-full font-bold py-3 px-4 rounded transition-colors mb-3 shadow-lg ${
                                    carte.stoc > 0 
                                    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20' 
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {carte.stoc > 0 ? 'ADAUGĂ ÎN COȘ' : 'INDISPONIBIL'}
                            </button>
                            
                            <button 
                                onClick={apasaAdaugaInWishlist}
                                className={`w-full font-medium py-2 px-4 rounded border transition-colors text-sm flex items-center justify-center gap-2 ${
                                    inWishlist 
                                    ? 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20' 
                                    : 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700'
                                }`}
                            >
                                {inWishlist ? '❤️ În wishlist-ul tău' : '♡ Adaugă în wishlist'}
                            </button>

                            <div className="mt-6 text-xs text-gray-400 space-y-2 border-t border-gray-700 pt-4">
                                <p className="flex items-center gap-2">🚚 Livrare gratuită la comenzi peste 150 lei.</p>
                                <p className="flex items-center gap-2">📦 Retur gratuit în 14 zile.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetaliiCarte;