import { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { useLocation } from 'react-router-dom'; 

// Importăm componentele 
import Profil from './Profil'; 
import BookFilters from '../components/BookFilters'; 
import BookCard from '../components/BookCard'; 
import CheckoutCart from '../components/CheckoutCart'; 
import Footer from '../components/Footer'; 
import ScrollToTop from '../components/ScrollToTop'; 

function Home({ cos, setCos, arataCos, setArataCos, termenCautare, userId, wishlist, setWishlist }) { 
    const location = useLocation(); 
    
    // ---------------- STATE-URI ---------------- 
    const [carti, setCarti] = useState([]); 
    const [arataProfil, setArataProfil] = useState(false); 
    
    // Stări pentru filtre 
    const [categorieSelectata, setCategorieSelectata] = useState('Toate'); 
    const [criteriuSortare, setCriteriuSortare] = useState('default'); 
    
    // NOU: Stare pentru paginare (câte cărți afișăm odată)
    const [limitaVizibila, setLimitaVizibila] = useState(12);

    // Stări pentru checkout 
    const [metodaPlata, setMetodaPlata] = useState('ramburs'); 
    const [dateLivrare, setDateLivrare] = useState({ nume: '', adresa: '', telefon: '' }); 
    const [dateCard, setDateCard] = useState({ numar: '', expirare: '', cvv: '' }); 
    
    // ---------------- EFECTE ---------------- 
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

    // NOU: Resetăm limita când utilizatorul schimbă categoria sau caută ceva
    useEffect(() => {
        setLimitaVizibila(12);
    }, [categorieSelectata, termenCautare, criteriuSortare]);

    // ---------------- FUNCȚII ---------------- 
    const fetchCarti = async () => { 
        try { 
            const response = await axios.get('http://localhost:5000/api/carti'); 
            setCarti(response.data); 
        } catch (error) { 
            console.error("Eroare:", error); 
            toast.error("Nu am putut încărca cărțile."); 
        } 
    }; 
    
    const toggleWishlist = async (carteId) => { 
        const token = localStorage.getItem('token'); 
        if (token) { 
            try { 
                await axios.post('http://localhost:5000/api/user/wishlist/toggle', 
                    { carteId }, 
                    { headers: { Authorization: `Bearer ${token}` } } 
                ); 
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
                await axios.post('http://localhost:5000/api/user/cos/adauga', 
                    { carteId: carte._id, cantitate: 1 }, 
                    { headers: { Authorization: `Bearer ${token}` } } 
                ); 
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
                    await axios.post('http://localhost:5000/api/user/cos/adauga', 
                        { carteId: id, cantitate: delta }, 
                        { headers: { Authorization: `Bearer ${token}` } } 
                    ); 
                } else { 
                    await axios.post('http://localhost:5000/api/user/cos/sterge', 
                        { carteId: id, stergeDeTot: false }, 
                        { headers: { Authorization: `Bearer ${token}` } } 
                    ); 
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
                await axios.post('http://localhost:5000/api/user/cos/sterge', 
                    { carteId: id, stergeDeTot: true }, 
                    { headers: { Authorization: `Bearer ${token}` } } 
                ); 
            } catch (error) { 
                console.error("Eroare stergere cos db", error); 
            } 
        } 
        setCos(cos.filter(item => item._id !== id)); 
        toast.error('Produs eliminat din coș.'); 
    }; 
    
    const plaseazaComanda = async (e) => { 
        e.preventDefault(); 
        const idUtilizator = userId || localStorage.getItem('userId'); 
        const token = localStorage.getItem('token'); 
        
        if (!idUtilizator && !localStorage.getItem('rol')) { 
            toast.error("Trebuie să fii autentificat pentru a plasa o comandă!"); 
            setTimeout(() => { window.location.href = '/login'; }, 1500); 
            return; 
        } 
        
        const dateComanda = { 
            userId: idUtilizator, 
            dateLivrare, 
            metodaPlata, 
            total: Number(totalCos.toFixed(2)), 
            produse: cos.map(item => ({ 
                carteId: item._id, 
                titlu: item.titlu, 
                cantitate: item.cantitate, 
                pret: item.pret 
            })) 
        }; 
        
        try { 
            await axios.post('http://localhost:5000/api/comenzi', dateComanda); 
            toast.success(`Comanda plasată cu succes!`); 
            
            if (token) { 
                try { 
                    await axios.delete('http://localhost:5000/api/user/cos/goleste', { 
                        headers: { Authorization: `Bearer ${token}` } 
                    }); 
                } catch (err) { 
                    console.error("Nu am putut goli coșul din baza de date", err); 
                } 
            } 
            
            setCos([]); 
            setDateLivrare({ nume: '', adresa: '', telefon: '' }); 
            setDateCard({ numar: '', expirare: '', cvv: '' }); 
            setArataCos(false); 
            fetchCarti(); 
        } catch (error) { 
            console.error(error); 
            toast.error("Eroare la plasarea comenzii. Verifică datele introduse!"); 
        } 
    }; 
    
    // ---------------- VARIABILE UTILE & FILTRARE ---------------- 
    const totalCos = cos.reduce((total, item) => total + (item.pret * item.cantitate), 0); 
    const categoriiDisponibile = ['Toate', ...new Set(carti.map(c => c.categorie).filter(cat => cat && cat.trim() !== ''))]; 
    
    let cartiProcesate = carti.filter(carte => { 
        const textDeCautat = `${carte.titlu} ${carte.autor} ${carte.isbn}`.toLowerCase(); 
        const sePotrivesteCautarea = textDeCautat.includes(termenCautare?.toLowerCase() || ''); 
        const sePotrivesteCategoria = categorieSelectata === 'Toate' || carte.categorie === categorieSelectata; 
        return sePotrivesteCautarea && sePotrivesteCategoria; 
    }); 
    
    if (criteriuSortare === 'pretCresc') cartiProcesate.sort((a, b) => a.pret - b.pret); 
    else if (criteriuSortare === 'pretDesc') cartiProcesate.sort((a, b) => b.pret - a.pret); 
    else if (criteriuSortare === 'az') cartiProcesate.sort((a, b) => a.titlu.localeCompare(b.titlu)); 
    else if (criteriuSortare === 'za') cartiProcesate.sort((a, b) => b.titlu.localeCompare(a.titlu)); 

    // NOU: Tăiem lista pentru a afișa doar câte ne permite 'limitaVizibila'
    const cartiDeAfisat = cartiProcesate.slice(0, limitaVizibila);

    // ---------------- RENDER ---------------- 
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
                        {/* FILTRE */} 
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
                        
                        {/* CHECKOUT SAU GRILA DE CARTI */} 
                        {arataCos ? ( 
                            <CheckoutCart 
                                cos={cos} 
                                totalCos={totalCos} 
                                setArataCos={setArataCos} 
                                modificaCantitate={modificaCantitate} 
                                eliminaDinCos={eliminaDinCos} 
                                plaseazaComanda={plaseazaComanda} 
                                dateLivrare={dateLivrare} 
                                setDateLivrare={setDateLivrare} 
                                metodaPlata={metodaPlata} 
                                setMetodaPlata={setMetodaPlata} 
                                dateCard={dateCard} 
                                setDateCard={setDateCard} 
                            /> 
                        ) : ( 
                            <> 
                                <div className="mb-4 text-stone-500 dark:text-stone-400 font-medium text-sm flex items-center gap-2"> 
                                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> 
                                    </svg> 
                                    {/* NOU: Actualizat textul ca să reflecte realitatea */}
                                    Afișăm {cartiDeAfisat.length} din {cartiProcesate.length} {cartiProcesate.length === 1 ? 'produs' : 'produse'} în categoria "{categorieSelectata}" 
                                </div> 
                                
                                {cartiProcesate.length === 0 ? ( 
                                    <div className="text-center py-16"> 
                                        <p className="text-2xl text-stone-500 dark:text-stone-400 mb-2">😕 Nu am găsit nicio carte care să corespundă criteriilor.</p> 
                                        <button onClick={() => setCategorieSelectata('Toate')} className="mt-4 text-amber-600 hover:text-amber-700 underline font-medium"> 
                                            Resetează filtrele 
                                        </button> 
                                    </div> 
                                ) : ( 
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pt-4" data-purpose="product-grid"> 
                                            {/* NOU: Facem map pe cartiDeAfisat, nu pe cartiProcesate */}
                                            {cartiDeAfisat.map((carte) => ( 
                                                <BookCard 
                                                    key={carte._id} 
                                                    carte={carte} 
                                                    adaugaInCos={adaugaInCos} 
                                                    toggleWishlist={toggleWishlist} 
                                                    wishlist={wishlist} 
                                                /> 
                                            ))} 
                                        </div>

                                        {/* NOU: Butonul de "Afișează mai mult" */}
                                        {limitaVizibila < cartiProcesate.length && (
                                            <div className="flex justify-center mt-12 mb-8">
                                                <button 
                                                    onClick={() => setLimitaVizibila(prev => prev + 12)}
                                                    className="px-8 py-3 bg-white dark:bg-slate-800 border-2 border-amber-500 text-amber-600 dark:text-amber-500 font-bold rounded-full hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all duration-300 shadow-sm flex items-center gap-2 group"
                                                >
                                                    Afișează mai multe cărți
                                                    <svg className="w-5 h-5 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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