import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importăm componentele refactorizate
import StarRating from '../components/StarRating';
import CheckoutPanel from '../components/DetaliiCarte/CheckoutPanel';
import Recomandari from '../components/DetaliiCarte/Recomandari';

function DetaliiCarte({ cos, setCos, wishlist, setWishlist, userId }) {
    const { id } = useParams();
    
    // State-uri
    const [carte, setCarte] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recomandari, setRecomandari] = useState([]);
    const [userRating, setUserRating] = useState(0);

    // 1. Efectul principal: aduce cartea curentă și verifică ratingul utilizatorului
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
                
                // Verificăm dacă utilizatorul a votat deja cartea
                if (userId && data.ratinguri) {
                    const ratingExistent = data.ratinguri.find(r => r.utilizator === userId);
                    if (ratingExistent) {
                        setUserRating(ratingExistent.nota);
                    } else {
                        setUserRating(0);
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
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ carteId: carteToAdd._id, cantitate: 1 })
                });
            } catch (eroare) {
                console.error("Eroare la salvarea coșului în BD:", eroare);
            }
        }
    };

    // 4. Funcție generală pentru Wishlist
    const toggleWishlistGlobal = async (carteId) => {
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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

    // 5. Funcția de trimitere a ratingului
    const handleRating = async (nota) => {
        let idUtilizator = userId || localStorage.getItem('userId');

        if (!idUtilizator) {
            toast.error("Trebuie să fii logat pentru a lăsa o recenzie! 🔒");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/carti/${carte._id}/rating`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: idUtilizator, nota: nota })
            });
            const data = await response.json();

            if (response.ok) {
                toast.success("Recenzia ta a fost salvată! ⭐");
                setUserRating(nota); 
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

    // Render-uri condiționate pentru loading și eroare
    if (loading) return <div className="min-h-screen bg-gray-950 text-gray-300 flex justify-center items-center text-xl">Se încarcă detaliile... ⏳</div>;
    if (!carte) return <div className="min-h-screen bg-gray-950 text-red-400 flex justify-center items-center text-xl font-bold">Cartea nu a fost găsită în sistem! 😕</div>;

    // --- RENDER PRINCIPAL ---
    return (
        <div className="min-h-screen bg-gray-950 p-4 md:p-8 w-full font-sans overflow-auto flex-1">
            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
            
            {/* Breadcrumbs */}
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
                        <img 
                            src={carte.imagine_url || carte.imagine} 
                            alt={carte.titlu} 
                            className="w-full max-w-[250px] aspect-[2/3] object-cover rounded-md shadow-2xl border border-gray-700" 
                        />
                    </div>

                    {/* Detalii Carte */}
                    <div className="w-full md:w-2/4 flex flex-col">
                        <h1 className="text-3xl font-extrabold text-white mb-1">{carte.titlu}</h1>
                        <p className="text-lg text-gray-400 mb-4">de <span className="font-semibold text-blue-400">{carte.autor}</span></p>
                        
                        {/* Aici chemăm componenta de steluțe */}
                        <StarRating 
                            ratingMediu={carte.ratingMediu} 
                            numarRecenzii={carte.numarRecenzii} 
                            userRating={userRating} 
                            onRatingSubmit={handleRating} 
                        />

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

                    {/* Partea de Checkout refactorizată */}
                    <div className="w-full md:w-1/4">
                        <CheckoutPanel 
                            carte={carte}
                            isInWishlist={isWishlisted}
                            handleAdaugaInCos={adaugaInCosGlobal}
                            handleToggleWishlist={() => toggleWishlistGlobal(carte._id)}
                        />
                    </div>
                </div>
            </div>

            {/* Secțiunea de Recomandări refactorizată */}
            <Recomandari 
                cartiSimilare={recomandari}
                wishlist={wishlist}
                handleAdaugaInCos={adaugaInCosGlobal}
                handleToggleWishlist={toggleWishlistGlobal}
            />
        </div>
    );
}

export default DetaliiCarte;