import { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
    const [carti, setCarti] = useState([]);
    const [arataFormular, setArataFormular] = useState(false);
    const [idEditare, setIdEditare] = useState(null);
    const [dateFormular, setDateFormular] = useState({
        isbn: '', titlu: '', autor: '', editura: '', pret: '', stoc: '', imagine_url: ''
    });

    // ==========================================
    // STATE-URI PENTRU COȘ ȘI CHECKOUT
    // ==========================================
    const [cos, setCos] = useState([]); // Aici ținem cărțile reale adăugate
    const [arataCos, setArataCos] = useState(false); // Afișăm sau ascundem interfața coșului
    const [metodaPlata, setMetodaPlata] = useState('ramburs'); 
    const [dateLivrare, setDateLivrare] = useState({ nume: '', adresa: '', telefon: '' });

    useEffect(() => {
        fetchCarti();
    }, []);

    const fetchCarti = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/carti');
            setCarti(response.data);
        } catch (error) {
            console.error("Eroare la aducerea cărților:", error);
        }
    };

    const handleDelogare = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        window.location.href = '/login';
    };

    // ==========================================
    // FUNCȚII CRUD PENTRU ADMIN
    // ==========================================
    const salveazaCarte = async (e) => {
        e.preventDefault(); 
        try {
            if (idEditare) {
                await axios.put(`http://localhost:5000/api/carti/${idEditare}`, dateFormular);
                alert('Cartea a fost actualizată cu succes!');
            } else {
                await axios.post('http://localhost:5000/api/carti', dateFormular);
                alert('Cartea a fost adăugată cu succes!');
            }
            setDateFormular({ isbn: '', titlu: '', autor: '', editura: '', pret: '', stoc: '', imagine_url: '' }); 
            setIdEditare(null);
            setArataFormular(false); 
            fetchCarti(); 
        } catch (error) {
            alert('Eroare la salvarea cărții!');
        }
    };

    const deschideEditare = (carte) => {
        setDateFormular({
            isbn: carte.isbn, titlu: carte.titlu, autor: carte.autor, editura: carte.editura, pret: carte.pret, stoc: carte.stoc, imagine_url: carte.imagine_url
        });
        setIdEditare(carte._id); 
        setArataFormular(true);  
        setArataCos(false); // Ascundem coșul dacă adminul vrea să editeze
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const stergeCarte = async (id) => {
        const confirmare = window.confirm("Ești sigur că vrei să ștergi această carte?");
        if (confirmare) {
            try {
                await axios.delete(`http://localhost:5000/api/carti/${id}`);
                alert("Cartea a fost ștearsă!");
                fetchCarti(); 
            } catch (error) {
                alert("Eroare la ștergerea cărții!");
            }
        }
    };

    const anuleazaFormular = () => {
        setArataFormular(false);
        setIdEditare(null);
        setDateFormular({ isbn: '', titlu: '', autor: '', editura: '', pret: '', stoc: '', imagine_url: '' });
    };

    // ==========================================
    // FUNCȚII PENTRU COȘ ȘI COMANDĂ
    // ==========================================
    const adaugaInCos = (carte) => {
        const existaInCos = cos.find(item => item._id === carte._id);
        if (existaInCos) {
            setCos(cos.map(item => item._id === carte._id ? { ...item, cantitate: item.cantitate + 1 } : item));
        } else {
            setCos([...cos, { ...carte, cantitate: 1 }]);
        }
        alert(`"${carte.titlu}" a fost adăugată în coș!`);
    };

    const eliminaDinCos = (id) => {
        setCos(cos.filter(item => item._id !== id));
    };

    // Calculăm totalul real pe baza produselor din coș
    const totalCos = cos.reduce((total, item) => total + (item.pret * item.cantitate), 0);

    const plaseazaComanda = async (e) => {
        e.preventDefault();
        
        // 1. Pregătim datele exact așa cum le așteaptă backend-ul
        const dateComanda = {
            dateLivrare,
            metodaPlata,
            total: totalCos,
            produse: cos.map(item => ({
                carteId: item._id, // Avem nevoie de ID-ul real al cărții pentru a scădea stocul
                titlu: item.titlu,
                cantitate: item.cantitate,
                pret: item.pret
            }))
        };

        try {
            // 2. Trimitem comanda către serverul nostru de backend
            await axios.post('http://localhost:5000/api/comenzi', dateComanda);

            alert(`🎉 Comanda a fost plasată cu succes!\n\nMulțumim, ${dateLivrare.nume}!\nTotal de plată: ${totalCos} RON.\n${metodaPlata === 'card' ? 'Plătit online cu cardul.' : 'Plata ramburs la curier.'}`);
            
            // 3. Curățăm interfața
            setCos([]);
            setDateLivrare({ nume: '', adresa: '', telefon: '' });
            setArataCos(false);
            
            // 4. Micul nostru truc: Reîncărcăm lista de cărți de pe server 
            // ca să vedem instant cum a scăzut stocul pe ecran!
            fetchCarti(); 

        } catch (error) {
            console.error("Eroare:", error);
            alert("A apărut o eroare la plasarea comenzii. Te rugăm să încerci din nou.");
        }
    };

    return (
        <div style={{ padding: '20px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            {/* HEADER-UL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ cursor: 'pointer', color: '#222' }} onClick={() => setArataCos(false)}>📚 Librăria Ta</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    
                    {/* BUTON COȘ PENTRU TOȚI UTILIZATORII */}
                    <button onClick={() => { setArataCos(!arataCos); setArataFormular(false); }} style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        🛒 Coșul meu ({cos.length})
                    </button>

                    {/* BUTON ADMIN */}
                    {localStorage.getItem('rol') === 'admin' && (
                        <button onClick={() => { arataFormular ? anuleazaFormular() : setArataFormular(true); setArataCos(false); }} style={{ padding: '10px 20px', backgroundColor: '#ffc107', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', color: '#222' }}>
                            {arataFormular ? 'Ascunde Formular' : '➕ Adaugă Carte'}
                        </button>
                    )}
                    
                    <button onClick={handleDelogare} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Delogare
                    </button>   
                </div>
            </div>

            {/* FORMULARUL DE ADMIN (CRUD) - Apare doar dacă ești Admin și apeși Adaugă/Editează */}
            {arataFormular && !arataCos && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#222' }}>{idEditare ? '✏️ Editează detaliile cărții' : 'Adaugă o carte în magazin'}</h3>
                    <form onSubmit={salveazaCarte} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <input type="text" placeholder="ISBN" required value={dateFormular.isbn} onChange={(e) => setDateFormular({...dateFormular, isbn: e.target.value})} style={{ padding: '8px', width: 'calc(33% - 10px)' }}/>
                        <input type="text" placeholder="Titlu" required value={dateFormular.titlu} onChange={(e) => setDateFormular({...dateFormular, titlu: e.target.value})} style={{ padding: '8px', width: 'calc(33% - 10px)' }}/>
                        <input type="text" placeholder="Autor" required value={dateFormular.autor} onChange={(e) => setDateFormular({...dateFormular, autor: e.target.value})} style={{ padding: '8px', width: 'calc(33% - 10px)' }}/>
                        <input type="text" placeholder="Editură" required value={dateFormular.editura} onChange={(e) => setDateFormular({...dateFormular, editura: e.target.value})} style={{ padding: '8px', width: 'calc(33% - 10px)' }}/>
                        <input type="number" placeholder="Preț (RON)" required value={dateFormular.pret} onChange={(e) => setDateFormular({...dateFormular, pret: e.target.value})} style={{ padding: '8px', width: 'calc(33% - 10px)' }}/>
                        <input type="number" placeholder="Stoc (Buc)" required value={dateFormular.stoc} onChange={(e) => setDateFormular({...dateFormular, stoc: e.target.value})} style={{ padding: '8px', width: 'calc(33% - 10px)' }}/>
                        <input type="text" placeholder="Link Imagine (ex: https://...)" required value={dateFormular.imagine_url} onChange={(e) => setDateFormular({...dateFormular, imagine_url: e.target.value})} style={{ padding: '8px', width: '100%' }}/>
                        
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: idEditare ? '#007bff' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
                            {idEditare ? 'Salvează Modificările' : 'Salvează Cartea'}
                        </button>
                        {idEditare && (
                            <button type="button" onClick={anuleazaFormular} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', marginLeft: '10px' }}>
                                Anulează
                            </button>
                        )}
                    </form>
                </div>
            )}

            {/* ========================================== */}
            {/* INTERFAȚA DE CHECKOUT (Când apeși pe Coș)  */}
            {/* ========================================== */}
            {arataCos ? (
                <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ color: '#222', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>🛒 Finalizare Comandă</h2>
                    
                    {cos.length === 0 ? (
                        <p style={{ color: '#555', fontSize: '18px' }}>Coșul tău este gol. Întoarce-te la magazin și adaugă câteva cărți!</p>
                    ) : (
                        <div style={{ display: 'flex', gap: '40px', marginTop: '20px', flexWrap: 'wrap' }}>
                            {/* PARTEA STÂNGĂ: Produsele reale din coș */}
                            <div style={{ flex: '1 1 300px' }}>
                                <h3 style={{ color: '#222' }}>Produsele tale:</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {cos.map((item, index) => (
                                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                                            <div>
                                                <strong style={{ color: '#222' }}>{item.titlu}</strong> <br/>
                                                <span style={{ color: '#666' }}>{item.pret} RON x {item.cantitate} buc.</span>
                                            </div>
                                            <button onClick={() => eliminaDinCos(item._id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>❌ Șterge</button>
                                        </div>
                                    ))}
                                </div>
                                <h2 style={{ color: '#28a745', marginTop: '20px', textAlign: 'right' }}>Total: {totalCos} RON</h2>
                            </div>

                            {/* PARTEA DREAPTĂ: Formularul de comandă și plată */}
                            <div style={{ flex: '1 1 300px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                                <h3 style={{ color: '#222', marginTop: 0 }}>Date Livrare</h3>
                                <form onSubmit={plaseazaComanda} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <input type="text" placeholder="Numele Complet" required value={dateLivrare.nume} onChange={e => setDateLivrare({...dateLivrare, nume: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                    <input type="text" placeholder="Adresa completă de livrare" required value={dateLivrare.adresa} onChange={e => setDateLivrare({...dateLivrare, adresa: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                    <input type="tel" placeholder="Număr de telefon" required value={dateLivrare.telefon} onChange={e => setDateLivrare({...dateLivrare, telefon: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                    
                                    <h3 style={{ color: '#222', marginBottom: '5px', marginTop: '10px' }}>Metoda de Plată</h3>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <label style={{ color: '#333', cursor: 'pointer' }}>
                                            <input type="radio" name="plata" value="ramburs" checked={metodaPlata === 'ramburs'} onChange={() => setMetodaPlata('ramburs')} /> Ramburs la curier
                                        </label>
                                        <label style={{ color: '#333', cursor: 'pointer' }}>
                                            <input type="radio" name="plata" value="card" checked={metodaPlata === 'card'} onChange={() => setMetodaPlata('card')} /> Plata cu Cardul
                                        </label>
                                    </div>

                                    {/* MOCK-UP PENTRU CARD (Apare doar dacă alegi "Plata cu Cardul") */}
                                    {metodaPlata === 'card' && (
                                        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '5px', border: '1px solid #007bff', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                            <p style={{ margin: 0, color: '#007bff', fontSize: '14px', fontWeight: 'bold' }}>💳 Plată Securizată</p>
                                            <input type="text" placeholder="Număr Card (ex: 4111 1111 1111 1111)" required={metodaPlata === 'card'} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}/>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input type="text" placeholder="Lună/An (LL/AA)" required={metodaPlata === 'card'} style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}/>
                                                <input type="text" placeholder="CVV" required={metodaPlata === 'card'} style={{ width: '80px', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}/>
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>
                                        ✅ Finalizează Comanda
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* ========================================== */
                /* LISTA DE CĂRȚI (Pagina principală)         */
                /* ========================================== */
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {carti.map((carte) => (
                        <div key={carte._id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', width: '250px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', textAlign: 'left', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                            <img src={carte.imagine_url} alt={carte.titlu} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }} />
                            <h3 style={{ fontSize: '18px', margin: '10px 0', color: '#222' }}>{carte.titlu}</h3>
                            <p style={{ margin: '5px 0', color: '#555' }}><strong>Autor:</strong> {carte.autor}</p>
                            <p style={{ margin: '5px 0', color: '#555' }}><strong>Editură:</strong> {carte.editura}</p>
                            <p style={{ margin: '5px 0', color: '#555' }}><strong>Stoc:</strong> {carte.stoc} buc.</p>
                            <h2 style={{ color: '#28a745', marginTop: '15px' }}>{carte.pret} RON</h2>
                            
                            <div style={{ marginTop: 'auto' }}>
                                {/* BUTON REAL DE ADĂUGARE ÎN COȘ */}
                                <button onClick={() => adaugaInCos(carte)} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}>
                                    Adaugă în coș
                                </button>

                                {/* BUTOANE ADMIN (Editare / Ștergere) */}
                                {localStorage.getItem('rol') === 'admin' && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button onClick={() => deschideEditare(carte)} style={{ flex: 1, padding: '10px', backgroundColor: '#ffc107', color: '#222', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            ✏️ Editează
                                        </button>
                                        <button onClick={() => stergeCarte(carte._id)} style={{ flex: 1, padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            🗑️ Șterge
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;