import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    const [mesaj, setMesaj] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault(); // Oprim reîncărcarea paginii
        try {
            // Trimitem datele către backend
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                email,
                parola
            });
            setMesaj('Cont creat cu succes! Te poți loga acum.');
            setTimeout(() => navigate('/login'), 2000); // Redirecționăm la login după 2 secunde
        } catch (error) {
            setMesaj(error.response?.data?.mesaj || 'Eroare la înregistrare');
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Înregistrare Cont Nou</h2>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: '0 auto' }}>
                <input 
                    type="email" 
                    placeholder="Introdu adresa de email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ marginBottom: '10px', padding: '8px' }}
                />
                <input 
                    type="password" 
                    placeholder="Introdu o parolă" 
                    value={parola} 
                    onChange={(e) => setParola(e.target.value)} 
                    required 
                    style={{ marginBottom: '10px', padding: '8px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Creează cont</button>
            </form>
            {mesaj && <p style={{ color: mesaj.includes('succes') ? 'green' : 'red' }}>{mesaj}</p>}
            <p>Ai deja cont? <a href="/login">Loghează-te aici</a></p>
        </div>
    );
}

export default Register;