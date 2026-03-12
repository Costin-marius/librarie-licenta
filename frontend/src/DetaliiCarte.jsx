import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function DetaliiCarte() {
    // 1. Luăm ID-ul cărții pe care am dat click. 
    // Dacă link-ul este site.ro/carte/123, 'id' va fi '123'
    const { id } = useParams(); 
    
    // 2. Aici pregătim niște "cutiuțe" în memorie unde vom păstra informații:
    // 'carte' va ține datele venite de la server. La început e goală (null).
    const [carte, setCarte] = useState(null);
    // 'loading' ne spune dacă încă așteptăm datele de la server. La început e 'true' (da, așteptăm).
    const [loading, setLoading] = useState(true);

    // 3. useEffect este ca un asistent care face o treabă imediat cum se deschide pagina.
    // Aici asistentul nostru se duce la backend să aducă detaliile cărții.
    useEffect(() => {
        // Trimitem "curierul" la adresa serverului tău
        fetch(`http://localhost:5000/api/carti/${id}`)
            .then(response => {
                if (!response.ok) throw new Error("Cartea nu a fost găsită pe server");
                return response.json(); // Desfacem pachetul primit (datele în format JSON)
            })
            .then(data => {
                setCarte(data); // Punem datele primite în cutiuța 'carte'
                setLoading(false); // Îi spunem site-ului că nu mai așteptăm, am primit datele!
            })
            .catch(error => {
                console.error("Eroare:", error);
                setLoading(false); // Chiar dacă e eroare, oprim animația de încărcare
            });
    }, [id]); // [id] înseamnă: "Fă chestia asta de fiecare dată când se schimbă ID-ul din link"

    // --- MAGIA PENTRU BUTONUL DE COȘ ---
    const apasaAdaugaInCos = async () => {
        // Căutăm în memoria browserului 'biletul de voie' (token-ul) care dovedește că userul e logat
        const token = localStorage.getItem('token'); 
        
        if (!token) {
            toast.error("Hei! Trebuie să intri în cont ca să poți adăuga în coș!");
            return; // Oprim funcția aici dacă nu e logat
        }

        try {
            // Strigăm la backend-ul tău, fix pe ruta pe care am creat-o mai devreme
            const response = await fetch('http://localhost:5000/api/user/cos/adauga', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Îi arătăm biletul de voie serverului
                },
                body: JSON.stringify({ carteId: carte._id, cantitate: 1 }) // Îi zicem ce carte vrem și câte bucăți
            });

            if (response.ok) {
                toast.success("Yeeey! Cartea a fost adăugată în coșul tău! 🛒");
            } else {
                toast.error("A apărut o mică problemă la adăugarea în coș.");
            }
        } catch (eroare) {
            console.error("Eroare la coș:", eroare);
            toast.error("A apărut o eroare neașteptată la adăugarea în coș.");
        }
    };

    // --- MAGIA PENTRU BUTONUL DE WISHLIST ---
    const apasaAdaugaInWishlist = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            toast.error("Trebuie să intri în cont ca să salvezi la favorite!");
            return;
        }

        try {
            // Strigăm la ruta ta de wishlist pe care o aveai deja făcută
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
                // Afișăm fix mesajul pe care îl dă backend-ul tău (ex: "Carte adăugată în wishlist!")
                toast.success(data.mesaj); 
            } else {
                toast.error("A apărut o problemă la adăugarea în wishlist.");
            }
        } catch (eroare) {
            console.error("Eroare la wishlist:", eroare);
            toast.error("A apărut o eroare neașteptată.");
        }
    };

    // 4. Aici decidem ce arătăm pe ecran înainte să se încarce designul complet:
    if (loading) return <div className="text-gray-300 text-center mt-20 text-xl">Se încarcă detaliile... ⏳</div>;
    if (!carte) return <div className="text-red-400 text-center mt-20 text-xl font-bold">Cartea nu a fost găsită în sistem! 😕</div>;

    // 5. Aici este HTML-ul (designul) paginii. Acum folosim datele din cutiuța 'carte'.
    return (
        <div className="min-h-screen bg-gray-950 p-4 md:p-8 w-full font-sans">
            
            {/* Bara de sus cu link-urile (Înapoi la produse / Fictiune / Nume Carte) */}
            <div className="max-w-6xl mx-auto mb-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Link to="/" className="hover:text-blue-400 transition flex items-center gap-1">
                    <span>←</span> Înapoi la Produse
                </Link>
                <span>/</span>
                <span className="text-gray-500 cursor-pointer hover:text-blue-400">{carte.categorie || 'Fără categorie'}</span>
                <span>/</span>
                <span className="text-gray-300 font-bold">{carte.titlu}</span>
            </div>

            {/* Fereastra principală care conține cele 3 coloane */}
            <div className="max-w-6xl mx-auto bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
                <div className="flex flex-col md:flex-row p-6 md:p-10 gap-10">
                    
                    {/* COLOANA 1: Imaginea Cărții */}
                    <div className="w-full md:w-1/4 flex flex-col items-center">
                        <img 
                            src={carte.imagine_url || carte.imagine} 
                            alt={carte.titlu} 
                            className="w-full max-w-[250px] h-auto object-cover rounded shadow-2xl border border-gray-700"
                        />
                    </div>

                    {/* COLOANA 2: Titlu, Autor, Categorii și Descriere */}
                    <div className="w-full md:w-2/4 flex flex-col">
                        <h1 className="text-3xl font-extrabold text-white mb-1">{carte.titlu}</h1>
                        <p className="text-lg text-gray-400 mb-6">de <span className="font-semibold text-blue-400 cursor-pointer hover:underline">{carte.autor}</span></p>

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

                            {/* Aici am legat butonul la funcția noastră 'apasaAdaugaInCos' */}
                            <button 
                                onClick={apasaAdaugaInCos}
                                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded transition-colors mb-3 shadow-lg shadow-orange-900/20"
                            >
                                ADAUGĂ ÎN COȘ
                            </button>
                            
                            {/* Aici am legat butonul la funcția 'apasaAdaugaInWishlist' */}
                            <button 
                                onClick={apasaAdaugaInWishlist}
                                className="w-full bg-transparent hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded border border-gray-600 transition-colors text-sm"
                            >
                                Adaugă în wishlist ♡
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