import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';

import Profil from './Profil';
import BookFilters from '../components/BookFilters';
import BookCard from '../components/BookCard';
import CheckoutCart from '../components/CheckoutCart';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

function Home({ cos, setCos, arataCos, setArataCos, termenCautare, userId, wishlist, setWishlist }) {
  const location = useLocation();
  const primaIncarcare = useRef(true);
  const categorieAnterioara = useRef(sessionStorage.getItem('memorieCategorie') || 'Toate');
  const cautareAnterioara = useRef('');
  
  const [carti, setCarti] = useState([]);
  const [arataProfil, setArataProfil] = useState(false);
  
  // Starea pentru Loading
  const [seIncarca, setSeIncarca] = useState(true);

  const [categorieSelectata, setCategorieSelectata] = useState(() => {
    return sessionStorage.getItem('memorieCategorie') || 'Toate';
  });

  useEffect(() => {
    sessionStorage.setItem('memorieCategorie', categorieSelectata);
  }, [categorieSelectata]);

  const [criteriuSortare, setCriteriuSortare] = useState(() => {
    return sessionStorage.getItem('memorieSortare') || 'default';
  });

  useEffect(() => {
    sessionStorage.setItem('memorieSortare', criteriuSortare);
  }, [criteriuSortare]);

  const [limitaVizibila, setLimitaVizibila] = useState(() => {
    return parseInt(sessionStorage.getItem('memorieLimita')) || 12;
  });

  useEffect(() => {
    sessionStorage.setItem('memorieLimita', limitaVizibila);
  }, [limitaVizibila]);


  useEffect(() => {
    fetchCarti();
  }, []);

  useEffect(() => {
    if (location.state && location.state.categorieRecomandata) {
      setCategorieSelectata(location.state.categorieRecomandata);
      window.history.replaceState({}, document.title);
    }
    const queryParams = new URLSearchParams(location.search);
    const categorieDinUrl = queryParams.get('categorie');
    if (categorieDinUrl) {
      setCategorieSelectata(categorieDinUrl);
    }
  }, [location.state, location.search]);

  // Ne asigurăm că NU se resetează la 12 cărți când dăm înapoi din Detalii
  useEffect(() => {
    if (primaIncarcare.current) {
      primaIncarcare.current = false;
      categorieAnterioara.current = categorieSelectata;
      cautareAnterioara.current = termenCautare;
      return;
    }
    if (categorieAnterioara.current !== categorieSelectata || cautareAnterioara.current !== termenCautare) {
      setLimitaVizibila(12);
      categorieAnterioara.current = categorieSelectata;
      cautareAnterioara.current = termenCautare;
    }
  }, [categorieSelectata, termenCautare]);

  // Oprim scroll-ul automat al browserului, DAR nu mai salvăm scroll-ul aici!
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Restaurare Scroll Simplificată
  useEffect(() => {
    if (carti.length > 0) {
      const scrollSalvat = sessionStorage.getItem('memorieScroll');
      if (scrollSalvat) {
        // Un mic timeout asigură că randarea s-a terminat
        setTimeout(() => {
          window.scrollTo(0, parseInt(scrollSalvat));
        }, 100);
      }
    }
  }, [carti]);


  const fetchCarti = async () => {
    setSeIncarca(true); // Începem încărcarea
    try {
      const response = await axios.get('http://localhost:5000/api/carti');
      setCarti(response.data);
    } catch (error) {
      console.error("Eroare:", error);
      toast.error("Nu am putut încărca cărțile.");
    } finally {
      setSeIncarca(false); // Oprim loading-ul indiferent dacă a reușit sau a eșuat
    }
  };

  const toggleWishlist = async (carteId) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post('http://localhost:5000/api/user/wishlist/toggle', { carteId }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (error) {
        console.error("Eroare validare wishlist db", error);
      }
    }
    const isDejaInWishlist = wishlist.includes(carteId);
    setWishlist((prevWishlist) => {
      if (isDejaInWishlist) {
        return prevWishlist.filter(id => id !== carteId);
      } else {
        return [...prevWishlist, carteId];
      }
    });
    toast[isDejaInWishlist ? 'info' : 'success'](
      isDejaInWishlist ? 'Eliminată din Wishlist' : 'Adăugată în Wishlist',
      { autoClose: 2000 }
    );
  };

  const adaugaInCos = async (carte) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post('http://localhost:5000/api/user/cos/adauga', { carteId: carte._id, cantitate: 1 }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (error) {
        console.error("Eroare adaugare cos db", error);
      }
    }
    const existaInCos = cos.find(item => item._id === carte._id);
    if (existaInCos) {
      setCos(cos.map(item => item._id === carte._id ? { ...item, cantitate: item.cantitate + 1 } : item));
    } else {
      setCos([...cos, { ...carte, cantitate: 1 }]);
    }
    toast.success(`"${carte.titlu}" a fost adăugată în coș!`, { autoClose: 2000 });
  };

  const modificaCantitate = async (id, delta) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        if (delta > 0) {
          await axios.post('http://localhost:5000/api/user/cos/adauga', { carteId: id, cantitate: delta }, { headers: { Authorization: `Bearer ${token}` } });
        } else {
          await axios.post('http://localhost:5000/api/user/cos/sterge', { carteId: id, stergeDeTot: false }, { headers: { Authorization: `Bearer ${token}` } });
        }
      } catch (error) {
        console.error("Eroare modificare cantitate db", error);
      }
    }
    setCos(cos.map(item => {
      if (item._id === id) {
        const nouaCantitate = item.cantitate + delta;
        return { ...item, cantitate: nouaCantitate > 0 ? nouaCantitate : 1 };
      }
      return item;
    }));
  };

  const eliminaDinCos = async (id) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post('http://localhost:5000/api/user/cos/sterge', { carteId: id, stergeDeTot: true }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (error) {
        console.error("Eroare stergere cos db", error);
      }
    }
    setCos(cos.filter(item => item._id !== id));
    toast.error('Produs eliminat din coș.');
  };



  const totalCos = cos.reduce((total, item) => total + (item.pret * item.cantitate), 0);
  const categoriiDisponibile = ['Toate', ...new Set(carti.map(c => c.categorie).filter(cat => cat && cat.trim() !== ''))];
  
  const normalizareText = (text) => text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  let cartiProcesate = carti.filter(carte => {
    const textDeCautat = normalizareText(`${carte.titlu} ${carte.autor} ${carte.isbn}`);
    const termenCautareNormalizat = normalizareText(termenCautare);
    const sePotrivesteCautarea = textDeCautat.includes(termenCautareNormalizat);
    const sePotrivesteCategoria = categorieSelectata === 'Toate' || carte.categorie === categorieSelectata;
    return sePotrivesteCautarea && sePotrivesteCategoria;
  });

  if (criteriuSortare === 'populare') {
    cartiProcesate.sort((a, b) => {
      const recenziiA = a.numarRecenzii || 0;
      const recenziiB = b.numarRecenzii || 0;
      return recenziiB - recenziiA;
    });
  } else if (criteriuSortare === 'pretCresc') {
    cartiProcesate.sort((a, b) => a.pret - b.pret);
  } else if (criteriuSortare === 'pretDesc') {
    cartiProcesate.sort((a, b) => b.pret - a.pret);
  } else if (criteriuSortare === 'az') {
    cartiProcesate.sort((a, b) => a.titlu.localeCompare(b.titlu));
  } else if (criteriuSortare === 'za') {
    cartiProcesate.sort((a, b) => b.titlu.localeCompare(a.titlu));
  }

  const cartiDeAfisat = cartiProcesate.slice(0, limitaVizibila);

  return (
    <div className="flex-1 w-full bg-ivory dark:bg-slate-900 transition-colors duration-300 font-sans overflow-x-hidden relative">
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      <div className="w-full">
        {arataProfil ? (
          <div className="pt-8 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
            <Profil inapoiLaHome={() => setArataProfil(false)} />
          </div>
        ) : (
          <div className="pt-8 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
            {!arataCos && (
              <BookFilters
                criteriuSortare={criteriuSortare}
                setCriteriuSortare={setCriteriuSortare}
                categorieSelectata={categorieSelectata}
                setCategorieSelectata={setCategorieSelectata}
                categoriiDisponibile={categoriiDisponibile}
                carti={carti}
              />
            )}
            {arataCos ? (
              <CheckoutCart
                cos={cos}
                totalCos={totalCos}
                setArataCos={setArataCos}
                modificaCantitate={modificaCantitate}
                eliminaDinCos={eliminaDinCos}
                setCos={setCos}
                userId={userId}
                fetchCarti={fetchCarti}
              />
            ) : (
              <>
                {!arataCos && categorieSelectata === 'Toate' && !termenCautare && cartiProcesate.some(c => c.pretVechi) && (
                  <div className="mb-12 pt-4">
                    <h2 className="text-3xl font-bold font-serif text-anthracite dark:text-stone-100 mb-6 flex items-center gap-3">
                      <span className="text-red-500 text-4xl leading-none">🔥</span> Oferta Săptămânii
                    </h2>
                    <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory pt-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                      {cartiProcesate.filter(c => c.pretVechi).map(carte => (
                        <div key={`oferta-${carte._id}`} className="min-w-[280px] w-[280px] snap-center shrink-0">
                          <BookCard carte={carte} adaugaInCos={adaugaInCos} toggleWishlist={toggleWishlist} wishlist={wishlist} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-4 text-stone-500 dark:text-stone-400 font-medium text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Afișăm {cartiDeAfisat.length} din {cartiProcesate.length} {cartiProcesate.length === 1 ? 'produs' : 'produse'} în categoria "{categorieSelectata}"
                </div>
                
                {/* Spinner-ul apare doar cât timp seÎncarcă e true. Apoi arată cărțile sau mesajul "Nu s-au găsit". */}
                {seIncarca ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : cartiProcesate.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-2xl text-stone-500 dark:text-stone-400 mb-2">😕 Nu am găsit nicio carte care să corespundă criteriilor.</p>
                    <button onClick={() => setCategorieSelectata('Toate')} className="mt-4 text-amber-600 hover:text-amber-700 underline font-medium">
                      Resetează filtrele
                    </button>
                  </div>
                ) : (
                  <>
                    {/* AICI E MAGICUL: Salvăm scroll-ul doar pe click, protejând memoria! */}
                    <div 
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pt-4" 
                      data-purpose="product-grid"
                      onClickCapture={() => {
                        sessionStorage.setItem('memorieScroll', window.scrollY);
                      }}
                    >
                      {cartiDeAfisat.map((carte) => (
                        <BookCard key={carte._id} carte={carte} adaugaInCos={adaugaInCos} toggleWishlist={toggleWishlist} wishlist={wishlist} />
                      ))}
                    </div>

                    {limitaVizibila < cartiProcesate.length && (
  <div className="flex justify-center mt-12 mb-12 relative z-10">
    <button 
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setLimitaVizibila(prev => prev + 12);
      }} 
      className="px-10 py-4 bg-white dark:bg-slate-800 border-2 border-amber-500 text-amber-600 dark:text-amber-500 font-bold rounded-full hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all duration-300 shadow-md flex items-center justify-center gap-3 group cursor-pointer select-none min-w-[250px]"
    >
      <span className="pointer-events-none">Afișează mai multe cărți</span>
      <svg 
        className="w-5 h-5 transition-transform group-hover:translate-y-1 pointer-events-none" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
  </div>
)}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default Home;