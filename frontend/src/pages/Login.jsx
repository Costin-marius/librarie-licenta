import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// --- IMPORT NOU PENTRU ICONIȚE PROFESIONALE ---
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

// Importăm librăriile pentru fundalul animat
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

function Login({ setRolUtilizator, setVizualizare, setNumeUtilizator }) {
    const navigate = useNavigate();
    const [arataParola, setArataParola] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [dateFormular, setDateFormular] = useState({
        email: '',
        parola: '',
        nume: ''
    });

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
                console.log("Răspuns login de la server:", response.data);

                // Salvăm datele în browser
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('rol', response.data.rol || 'user');
                localStorage.setItem('nume', response.data.nume || '');

                // Salvăm ID-ul
                const idUtilizator = response.data.userId || response.data.id || response.data._id;
                if (idUtilizator) {
                    localStorage.setItem('userId', idUtilizator);
                }

                // Actualizăm stările aplicației
                if (setNumeUtilizator) setNumeUtilizator(response.data.nume || '');
                if (setRolUtilizator) setRolUtilizator(response.data.rol || 'user');

                toast.success('Te-ai autentificat cu succes!');

                // Redirecționarea
                setTimeout(() => {
                    if (setVizualizare) setVizualizare('magazin');
                    navigate('/');
                }, 1000);
            } else {
                // Cererea de înregistrare
                await axios.post('http://localhost:5000/api/auth/register', dateFormular);
                toast.success('Cont creat! Acum te poți loga.');
                setIsLogin(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Eroare la autentificare!');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 px-4 relative overflow-hidden font-sans">
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
                        links: { color: "#60a5fa", distance: 150, enable: true, opacity: 0.2, width: 1, },
                        collisions: { enable: true },
                        move: {
                            directions: "none",
                            enable: true,
                            outModes: { default: "bounce" },
                            random: false,
                            speed: 1,
                            straight: false,
                        },
                        number: { density: { enable: true, area: 800 }, value: 60, },
                        opacity: { value: 0.3 },
                        shape: { type: "circle" },
                        size: { value: { min: 1, max: 3 } },
                    },
                    detectRetina: true,
                }}
                className="absolute inset-0 z-0"
            />
            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />

            {/* AICI ESTE MAGIA PENTRU FLOAT: Am adăugat clasa `animate-float` și hover effects */}
            <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 relative z-10 animate-float transition-all duration-300 hover:shadow-[0_0_40px_rgba(37,99,235,0.15)] shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-blue-400 mb-2 tracking-tight">📚 BookIo</h1>
                    <p className="text-gray-400">
                        {isLogin ? 'Bine ai revenit!' : 'Creează un cont nou de cititor.'}
                    </p>
                </div>

                <form onSubmit={trimiteFormular} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">Nume complet</label>
                            <input
                                type="text"
                                name="nume"
                                required={!isLogin}
                                value={dateFormular.nume}
                                onChange={handleInput}
                                placeholder="Ion Popescu"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition duration-150 placeholder:text-gray-600"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={dateFormular.email}
                            onChange={handleInput}
                            placeholder="exemplu@email.com"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition duration-150 placeholder:text-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">Parolă</label>
                        <div className="relative group">
                            <input
                                type={arataParola ? "text" : "password"}
                                name="parola"
                                required
                                value={dateFormular.parola}
                                onChange={handleInput}
                                placeholder="••••••••"
                                className="w-full pl-4 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition duration-150 placeholder:text-gray-600"
                            />
                            <button
                                type="button"
                                onClick={() => setArataParola(!arataParola)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none z-20"
                                title={arataParola ? "Ascunde parola" : "Arată parola"}
                            >
                                {arataParola ? (
                                    <AiOutlineEyeInvisible className="w-6 h-6 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                ) : (
                                    <AiOutlineEye className="w-6 h-6 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                )}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-150 mt-4 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                    >
                        {isLogin ? '🔑 Intră în cont' : '✨ Creează cont'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-800 pt-6">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition duration-150"
                    >
                        {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Autentifică-te'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;