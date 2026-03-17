import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importăm librăriile pentru fundalul animat
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

function Login({ setRolUtilizator, setVizualizare, setNumeUtilizator }) {
    const navigate = useNavigate(); 
    const [isLogin, setIsLogin] = useState(true);
    const [dateFormular, setDateFormular] = useState({ email: '', parola: '', nume: '' });

    // Funcția care inițializează particulele de pe fundal
    const particlesInit = async (main) => {
        await loadFull(main);
    };

    // Funcția care adună datele din input-uri
    const handleInput = (e) => {
        setDateFormular({ ...dateFormular, [e.target.name]: e.target.value });
    };

    // Logica de logare/înregistrare
    const trimiteFormular = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                // Cererea de login către backend
                const response = await axios.post('http://localhost:5000/api/auth/login', {
                    email: dateFormular.email,
                    parola: dateFormular.parola
                });
                
                // Printăm în consolă răspunsul serverului ca să fim 100% siguri cum se numește ID-ul
                console.log("Răspuns login de la server:", response.data);

                // Salvăm datele în browser
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('rol', response.data.rol || 'user');
                localStorage.setItem('nume', response.data.nume || ''); 
                
                // SALVĂM ID-ul (folosind response.data, nu data)
                // Punem mai multe variante în caz că backend-ul tău îl numește diferit
                const idUtilizator = response.data.userId || response.data.id || response.data._id;
                if (idUtilizator) {
                    localStorage.setItem('userId', idUtilizator);
                }
                
                // Actualizăm stările aplicației
                if(setNumeUtilizator) setNumeUtilizator(response.data.nume || '');
                if(setRolUtilizator) setRolUtilizator(response.data.rol || 'user');

                toast.success('Te-ai autentificat cu succes!');
                
                // Redirecționarea elegantă după 1 secundă
                setTimeout(() => {
                    if(setVizualizare) setVizualizare('magazin');
                    navigate('/');
                }, 1000);
            } else {
                // Cererea de înregistrare
                await axios.post('http://localhost:5000/api/auth/register', dateFormular);
                toast.success('Cont creat! Acum te poți loga.');
                // Trecem automat înapoi pe modul "Login" după creare
                setIsLogin(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Eroare la autentificare!');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 px-4 relative overflow-hidden">
            
            {/* Fundalul mișto cu particule */}
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={{
                    fullScreen: { enable: true, zIndex: 0 },
                    background: { color: { value: "#030712" } },
                    fpsLimit: 120,
                    interactivity: {
                        events: {
                            onHover: { enable: true, mode: "repulse" },
                            resize: true,
                        },
                    },
                    particles: {
                        color: { value: "#60a5fa" }, 
                        links: {
                            color: "#60a5fa",
                            distance: 150,
                            enable: true,
                            opacity: 0.2,
                            width: 1,
                        },
                        collisions: { enable: true },
                        move: {
                            directions: "none",
                            enable: true,
                            outModes: { default: "bounce" },
                            random: false,
                            speed: 1,
                            straight: false,
                        },
                        number: {
                            density: { enable: true, area: 800 },
                            value: 60,
                        },
                        opacity: { value: 0.3 },
                        shape: { type: "circle" },
                        size: { value: { min: 1, max: 3 } },
                    },
                    detectRetina: true,
                }}
                className="absolute inset-0 z-0"
            />

            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />

            {/* Cutia principală de login (glassmorphism) */}
            <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-400 mb-2">📚 BookIo</h1>
                    <p className="text-gray-400">
                        {isLogin ? 'Bine ai revenit!' : 'Creează un cont nou.'}
                    </p>
                </div>

                <form onSubmit={trimiteFormular} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nume complet</label>
                            <input type="text" name="nume" required={!isLogin} value={dateFormular.nume} onChange={handleInput} placeholder="ex: Ion Popescu" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input type="email" name="email" required value={dateFormular.email} onChange={handleInput} placeholder="exemplu@email.com" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Parolă</label>
                        <input type="password" name="parola" required value={dateFormular.parola} onChange={handleInput} placeholder="••••••••" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-4 shadow-lg">
                        {isLogin ? '🔑 Intră în cont' : '✨ Creează cont'}
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-gray-800 pt-6">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:text-blue-300 font-semibold transition">
                        {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Autentifică-te'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;