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

  // NOU: State-uri pentru comentarii
  const [textComentariu, setTextComentariu] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Efectul principal
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

  // 2. Efectul secundar
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

  // 3. Funcție adăugare în coș (CORECTATĂ)
  const adaugaInCosGlobal = async (carteToAdd) => {
    // PROTECȚIE: Dacă `carteToAdd` este un Event (de la un onClick simplu), 
    // luăm obiectul `carte` principal. Dacă vine din zona de Recomandări, 
    // va avea propriul `_id` și îl folosim pe acela.
    const carteReala = (carteToAdd && carteToAdd._id) ? carteToAdd : carte;

    if (!carteReala || !carteReala._id) return;

    setCos((prevCos) => {
      const existaInCos = prevCos.find(item => item._id === carteReala._id);
      if (existaInCos) {
        return prevCos.map(item =>
          item._id === carteReala._id ? { ...item, cantitate: item.cantitate + 1 } : item
        );
      } else {
        // Acum suntem siguri că punem în coș un obiect complet de carte
        return [...prevCos, { ...carteReala, cantitate: 1 }];
      }
    });
    toast.success(`"${carteReala.titlu}" a fost adăugată în coș! 🛒`);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/user/cos/adauga', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ carteId: carteReala._id, cantitate: 1 })
        });
      } catch (eroare) {
        console.error("Eroare la salvarea coșului în BD:", eroare);
      }
    }
  };

  // 4. Funcție Wishlist
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

  // 5. Funcție Rating
  const handleRating = async (nota) => {
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
        setUserRating(nota);
        setCarte(prev => ({ ...prev, ratingMediu: data.ratingMediu, numarRecenzii: data.numarRecenzii }));
      } else {
        toast.error(data.mesaj || "Eroare la salvarea recenziei.");
      }
    } catch (error) {
      console.error("Eroare rating:", error);
      toast.error("Eroare de conexiune cu serverul.");
    }
  };

  // 6. Funcție Adăugare Comentariu Text
  const handleAdaugaComentariu = async (e) => {
    e.preventDefault();
    if (!textComentariu.trim()) return;
    setIsSubmitting(true);
    try {
      const nume = localStorage.getItem('nume') || 'Utilizator';
      const response = await fetch(`http://localhost:5000/api/carti/${carte._id}/comentariu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId || localStorage.getItem('userId'),
          numeUtilizator: nume,
          text: textComentariu
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Comentariul tău a fost publicat!");
        setTextComentariu("");
        setCarte(prev => ({ ...prev, comentarii: data.comentarii }));
      } else {
        toast.error(data.mesaj || "Eroare la postarea comentariului.");
      }
    } catch (error) {
      console.error("Eroare comentariu:", error);
      toast.error("Eroare de conexiune cu serverul.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-300 flex justify-center items-center text-lg transition-colors duration-300">Se încarcă detaliile... ⏳</div>;
  if (!carte) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-red-600 dark:text-red-400 flex justify-center items-center text-lg font-bold transition-colors duration-300">Cartea nu a fost găsită în sistem! 😕</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 w-full font-sans overflow-auto flex-1 transition-colors duration-300">
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />

      {/* Breadcrumbs */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
        <Link to="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition flex items-center gap-1">
          <span>←</span> Înapoi la Produse
        </Link>
        <span>/</span>
        <span className="text-gray-500">{carte.categorie || 'Fără categorie'}</span>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-300 font-semibold">{carte.titlu}</span>
      </div>

      {/* Caseta cu detaliile cărții */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden mb-8 transition-colors duration-300">
        <div className="flex flex-col md:flex-row p-6 md:p-8 gap-8">
          {/* Poza Cărții */}
          <div className="w-full md:w-1/4 flex flex-col items-center">
            <img src={carte.imagine_url || carte.imagine} alt={carte.titlu} className="w-full max-w-[200px] aspect-[2/3] object-cover rounded shadow-xl border border-gray-200 dark:border-gray-700" />
          </div>

          {/* Detalii Carte */}
          <div className="w-full md:w-2/4 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{carte.titlu}</h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4 transition-colors">de <span className="font-semibold text-blue-600 dark:text-blue-400">{carte.autor}</span></p>

            <StarRating ratingMediu={carte.ratingMediu} numarRecenzii={carte.numarRecenzii} userRating={userRating} onRatingSubmit={handleRating} />

            <hr className="my-5 border-gray-200 dark:border-gray-800 transition-colors" />

            <div className="grid grid-cols-2 gap-y-2 text-sm mb-6">
              <div><span className="text-gray-500">Categorii:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{carte.categorie || '-'}</span></div>
              <div><span className="text-gray-500">Editura:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{carte.editura || '-'}</span></div>
              <div><span className="text-gray-500">Limba:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{carte.limba || 'Română'}</span></div>
              <div><span className="text-gray-500">An publicare:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{carte.anPublicare || '-'}</span></div>
              <div><span className="text-gray-500">Nr. pagini:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{carte.nrPagini || '-'}</span></div>
              {carte.isbn && <div><span className="text-gray-500">ISBN:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{carte.isbn}</span></div>}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Descriere</h3>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed text-sm text-justify transition-colors">
              {carte.descriere || "Descrierea nu este disponibilă momentan."}
            </p>
          </div>

          {/* Partea de Checkout */}
          <div className="w-full md:w-1/4">
            {/* AICI ESTE A DOUA MODIFICARE - Pasăm explicit `carte` ca parametru ca să tăiem firul erorilor din rădăcină */}
            <CheckoutPanel 
                carte={carte} 
                isInWishlist={isWishlisted} 
                handleAdaugaInCos={() => adaugaInCosGlobal(carte)} 
                handleToggleWishlist={() => toggleWishlistGlobal(carte._id)} 
            />
          </div>
        </div>
      </div>

      {/* Recomandari */}
      <Recomandari titlu="Îți recomandăm și..." cartiSimilare={recomandari} categorie={carte.categorie} wishlist={wishlist} handleAdaugaInCos={adaugaInCosGlobal} handleToggleWishlist={toggleWishlistGlobal} />

      {/* SECȚIUNEA DE RECENZII / COMENTARII */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8 mb-12 mt-8 transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-3 transition-colors">Recenzii și Discuții</h2>

        {/* Lista de comentarii */}
        <div className="space-y-4 mb-8">
          {carte.comentarii && carte.comentarii.length > 0 ? (
            carte.comentarii.map((com, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{com.numeUtilizator}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(com.data).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-gray-300 text-sm whitespace-pre-wrap">{com.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Nu există nicio recenzie pentru această carte. Fii primul care își spune părerea!</p>
          )}
        </div>

        {/* Formular sau Mesaj de Autentificare */}
        {userId ? (
          <form onSubmit={handleAdaugaComentariu} className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Lasă o recenzie</h3>
            <textarea
              value={textComentariu}
              onChange={(e) => setTextComentariu(e.target.value)}
              placeholder="Scrie părerea ta despre această carte..."
              className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded p-3 text-sm focus:outline-none focus:border-blue-500 mb-3 min-h-[100px] resize-y transition-colors"
              required
            ></textarea>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !textComentariu.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors text-sm"
              >
                {isSubmitting ? 'Se trimite...' : 'Publică Recenzia'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center flex flex-col items-center justify-center transition-colors">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Pentru a lăsa o recenzie, te rugăm să te autentifici în contul tău.</p>
            <Link to="/login" className="px-6 py-2 border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:text-white font-medium rounded transition-colors text-sm">
              Intră în cont
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetaliiCarte;