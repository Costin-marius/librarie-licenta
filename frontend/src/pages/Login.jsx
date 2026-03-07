import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    const [mesaj, setMesaj] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                parola
            });
            
            // Salvăm token-ul în browser
            localStorage.setItem('token', response.data.token);
            setMesaj('Autentificare reușită!');
            navigate('/'); // Redirecționăm către pagina principală
            
        } catch (error) {
            setMesaj(error.response?.data?.mesaj || 'Eroare la autentificare');
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Autentificare</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: '0 auto' }}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ marginBottom: '10px', padding: '8px' }}
                />
                <input 
                    type="password" 
                    placeholder="Parolă" 
                    value={parola} 
                    onChange={(e) => setParola(e.target.value)} 
                    required 
                    style={{ marginBottom: '10px', padding: '8px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Intră în cont</button>
            </form>
            {mesaj && <p style={{ color: mesaj.includes('reușită') ? 'green' : 'red' }}>{mesaj}</p>}
            <p>Nu ai cont? <a href="/register">Înregistrează-te aici</a></p>
        </div>
    );
}

export default Login;