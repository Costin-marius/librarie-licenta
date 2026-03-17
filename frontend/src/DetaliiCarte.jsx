import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importăm componenta BookCard creată anterior!
import BookCard from './components/BookCard';

// --- NOU: Am adăugat `userId` în prop-uri ca să știm cine votează ---
function DetaliiCarte({ cos, setCos, wishlist, setWishlist, userId }) {
    const { id } = useParams();
    const [carte, setCarte] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recomandari, setRecomandari] = useState([]);

    // --- NOU: State-uri pentru sistemul de Rating ---
    const [hoverRating, setHoverRating] = useState(0); // Nota peste care e mouse-ul
    const [userRating, setUserRating] = useState(0);   // Nota dată efectiv de utilizator

    // 1. Efectul principal: aduce cartea curentă
    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        fetch(`http://localhost:5000/api/carti/${id}`)
            .then(response => {
                if (!response.ok) throw new Error("Cartea nu a fost găsită pe server");
                return response.json();
            })
            .then(data => {
                setCarte(data);
                setLoading(false);

                // --- NOU: Verificăm dacă utilizatorul a votat deja cartea ---
                if (userId && data.ratinguri) {
                    const ratingExistent = data.ratinguri.find(r => r.utilizator === userId);
                    if (ratingExistent) {
                        setUserRating(ratingExistent.nota);
                    } else {
                        setUserRating(0); // Resetăm dacă e o carte nouă și nu a votat-o
                    }
                }
            })
            .catch(error => {
                console.error("Eroare:", error);
                setLoading(false);
            });
    }, [id, userId]);

    // 2. Efectul secundar: aduce recomandările pe baza categoriei
    useEffect(() => {
        if (carte && carte.categorie) {
            fetch('http://localhost:5000/api/carti')
                .then(res => res.json())
                .then(data => {
                    const cartiSimilare = data
                        .filter(c => c.categorie === carte.categorie && c._id !== carte._id)
                        .slice(0, 4);
                    setRecomandari(cartiSimilare);
                })
                .catch(err => console.error("Eroare la recomandări:", err));
        }
    }, [carte]);

    const isWishlisted = wishlist?.includes(carte?._id);

    // 3. Funcție generală de adăugare în coș
    const adaugaInCosGlobal = async (carteToAdd) => {
        // ... codul tău rămâne neschimbat aici
        if (!carteToAdd) return;
        setCos((prevCos) => {
            const existaInCos = prevCos.find(item => item._id === carteToAdd._id);
            if (existaInCos) {
                return prevCos.map(item => item._id === carteToAdd._id ? { ...item, cantitate: item.cantitate + 1 } : item);
            } else {
                return [...prevCos, { ...carteToAdd, cantitate: 1 }];
            }
        });
        toast.success(`"${carteToAdd.titlu}" a fost adăugată în coș! 🛒`);
        
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await fetch('http://localhost:5000/api/user/cos/adauga', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ carteId: carteToAdd._id, cantitate: 1 })
                });
            } catch (eroare) {
                console.error("Eroare la salvarea coșului în BD:", eroare);
            }
        }
    };

    // 4. Funcție generală pentru Wishlist
    const toggleWishlistGlobal = async (carteId) => {
        // ... codul tău rămâne neschimbat aici
        if (!carteId) return;
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Trebuie să intri în cont ca să salvezi la favorite!");
            return;
        }
        
        const wasWishlisted = wishlist.includes(carteId);
        setWishlist((prevWishlist) => {
            if (prevWishlist.includes(carteId)) {
                return prevWishlist.filter(id => id !== carteId);
            } else {
                return [...prevWishlist, carteId];
            }
        });

        try {
            const response = await fetch('http://localhost:5000/api/user/wishlist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ carteId: carteId })
            });

            if (response.ok) {
                toast[wasWishlisted ? 'info' : 'success'](
                    wasWishlisted ? 'Eliminată din Wishlist' : 'Adăugată în Wishlist'
                );
            } else {
                toast.error("A apărut o problemă la wishlist.");
            }
        } catch (eroare) {
            console.error("Eroare la wishlist:", eroare);
            toast.error("A apărut o eroare neașteptată.");
        }
    };

    // --- NOU: 5. Funcția de trimitere a ratingului ---
    const handleRating = async (nota) => {
        // Dacă preferi să verifici token-ul în loc de userId, poți lăsa userId sau adăuga token.
        // Presupunem că userId e trimis corect.
        let idUtilizator = userId || localStorage.getItem('userId'); 

        if (!idUtilizator) {
            toast.error("Trebuie să fii logat pentru a lăsa o recenzie! 🔒");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/carti/${carte._id}/rating`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ userId: idUtilizator, nota: nota })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Recenzia ta a fost salvată! ⭐");
                setUserRating(nota); // Salvăm nota local ca să se facă steluțele galbene
                
                // Actualizăm media cărții direct în interfață, fără refresh
                setCarte(prev => ({
                    ...prev,
                    ratingMediu: data.ratingMediu,
                    numarRecenzii: data.numarRecenzii
                }));
            } else {
                toast.error(data.mesaj || "Eroare la salvarea recenziei.");
            }
        } catch (error) {
            console.error("Eroare rating:", error);
            toast.error("Eroare de conexiune cu serverul.");
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-950 text-gray-300 flex justify-center items-center text-xl">Se încarcă detaliile... ⏳</div>;
    if (!carte) return <div className="min-h-screen bg-gray-950 text-red-400 flex justify-center items-center text-xl font-bold">Cartea nu a fost găsită în sistem! 😕</div>;

    return (
        <div className="min-h-screen bg-gray-950 p-4 md:p-8 w-full font-sans overflow-auto flex-1">
            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
            
            <div className="max-w-6xl mx-auto mb-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Link to="/" className="hover:text-blue-400 transition flex items-center gap-1">
                    <span>←</span> Înapoi la Produse
                </Link>
                <span>/</span>
                <span className="text-gray-500">{carte.categorie || 'Fără categorie'}</span>
                <span>/</span>
                <span className="text-gray-300 font-bold">{carte.titlu}</span>
            </div>

            <div className="max-w-6xl mx-auto bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden mb-16">
                <div className="flex flex-col md:flex-row p-6 md:p-10 gap-10">
                    
                    {/* Poza Cărții */}
                    <div className="w-full md:w-1/4 flex flex-col items-center">
                        <img src={carte.imagine_url || carte.imagine} alt={carte.titlu} className="w-full max-w-[250px] aspect-[2/3] object-cover rounded-md shadow-2xl border border-gray-700" />
                    </div>

                    {/* Detalii Carte */}
                    <div className="w-full md:w-2/4 flex flex-col">
                        <h1 className="text-3xl font-extrabold text-white mb-1">{carte.titlu}</h1>
                        <p className="text-lg text-gray-400 mb-2">de <span className="font-semibold text-blue-400">{carte.autor}</span></p>

                        {/* --- NOU: UI Sistem de Rating (Steluțe) --- */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                        title={`Acordă nota ${star}`}
                                    >
                                        <svg
                                            className={`w-6 h-6 transition-colors duration-200 ${
                                                star <= (hoverRating || userRating || carte.ratingMediu || 0)
                                                    ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]'
                                                    : 'text-gray-600 hover:text-yellow-200'
                                            }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-gray-400">
                                {carte.ratingMediu > 0 
                                    ? `${carte.ratingMediu} din 5 (${carte.numarRecenzii} ${carte.numarRecenzii === 1 ? 'recenzie' : 'recenzii'})` 
                                    : 'Fii primul care lasă o recenzie!'}
                            </span>
                        </div>
                        {/* --- SFÂRȘIT UI RATING --- */}

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

                    {/* Partea de Checkout (Preț / Adaugă în coș) */}
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
                                onClick={() => adaugaInCosGlobal(carte)}
                                disabled={carte.stoc <= 0}
                                className={`w-full font-bold py-3 px-4 rounded transition-colors mb-3 shadow-lg ${
                                    carte.stoc > 0 ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {carte.stoc > 0 ? 'ADAUGĂ ÎN COȘ' : 'INDISPONIBIL'}
                            </button>

                            <button
                                onClick={() => toggleWishlistGlobal(carte._id)}
                                className={`w-full font-medium py-2 px-4 rounded border transition-colors text-sm flex items-center justify-center gap-2 ${
                                    isWishlisted ? 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20' : 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700'
                                }`}
                            >
                                {isWishlisted ? '❤️ În wishlist-ul tău' : '♡ Adaugă în wishlist'}
                            </button>

                            <div className="mt-6 text-xs text-gray-400 space-y-2 border-t border-gray-700 pt-4">
                                <p className="flex items-center gap-2">🚚 Livrare gratuită la comenzi peste 150 lei.</p>
                                <p className="flex items-center gap-2">📦 Retur gratuit în 14 zile.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECȚIUNEA DE RECOMANDĂRI */}
            {recomandari.length > 0 && (
                <div className="max-w-6xl mx-auto mb-10">
                    <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-3">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span>✨</span> Îți recomandăm și...
                        </h2>
                        <Link 
                            to="/" 
                            state={{ categorieRecomandata: carte.categorie }}
                            className="text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1 mb-1"
                        >
                            VEZI TOT <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recomandari.map((rec) => (
                            <BookCard 
                                key={rec._id} 
                                carte={rec} 
                                adaugaInCos={adaugaInCosGlobal} 
                                toggleWishlist={toggleWishlistGlobal} 
                                wishlist={wishlist} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DetaliiCarte;