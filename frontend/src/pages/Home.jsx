import { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
    const [carti, setCarti] = useState([]);

    // Acest bloc se execută automat când se încarcă pagina
    useEffect(() => {
        const fetchCarti = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/carti');
                setCarti(response.data);
            } catch (error) {
                console.error("Eroare la aducerea cărților:", error);
            }
        };
        fetchCarti();
    }, []);

    const handleDelogare = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const adaugaCartiTest = async () => {
        try {
            await axios.post('http://localhost:5000/api/carti/seed');
            window.location.reload(); // Reîncărcăm pagina ca să vedem noile cărți
        } catch (error) {
            alert("Cărțile există deja sau a apărut o eroare!");
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>📚 Librăria Ta Online</h1>
                <button onClick={handleDelogare} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Delogare
                </button>
            </div>
            
            {carti.length === 0 ? (
                <div style={{ marginTop: '50px' }}>
                    <p>Rafturile sunt goale momentan...</p>
                    <button onClick={adaugaCartiTest} style={{ padding: '15px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
                        Generează 3 Cărți de Test
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {carti.map((carte) => (
                        <div key={carte._id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', width: '250px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', textAlign: 'left', backgroundColor: 'white' }}>
                            <img src={carte.imagine_url} alt={carte.titlu} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }} />
                            <h3 style={{ fontSize: '18px', margin: '10px 0' }}>{carte.titlu}</h3>
                            <p style={{ margin: '5px 0', color: '#555' }}><strong>Autor:</strong> {carte.autor}</p>
                            <p style={{ margin: '5px 0', color: '#555' }}><strong>Editură:</strong> {carte.editura}</p>
                            <p style={{ margin: '5px 0', color: '#555' }}><strong>Stoc:</strong> {carte.stoc} buc.</p>
                            <h2 style={{ color: '#28a745', marginTop: '15px' }}>{carte.pret} RON</h2>
                            <button style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
                                Adaugă în coș
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;