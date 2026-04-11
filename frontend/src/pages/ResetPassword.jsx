import { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [parola, setParola] = useState('');
    const [confirmParola, setConfirmParola] = useState('');
    const [arataParola, setArataParola] = useState(false);
    const [seReseteaza, setSeReseteaza] = useState(false);

    const particlesInit = async (main) => {
        await loadFull(main);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (parola !== confirmParola) {
            toast.error("Parolele nu se potrivesc!");
            return;
        }

        setSeReseteaza(true);
        try {
            await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { parola });
            toast.success('Parola a fost resetată cu succes!');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.mesaj || 'Eroare! Token expirat sau invalid.');
        } finally {
            setSeReseteaza(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 px-4 relative overflow-hidden font-sans">
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

            <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 relative z-10 hover:shadow-[0_0_40px_rgba(37,99,235,0.15)] shadow-2xl transition-all duration-300 animate-float">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-blue-400 mb-2 tracking-tight">Setați parola nouă</h1>
                    <p className="text-gray-400 text-sm">
                        Alege o parolă puternică pentru contul tău.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">Parola Nouă</label>
                        <div className="relative group">
                            <input
                                type={arataParola ? "text" : "password"}
                                required
                                value={parola}
                                onChange={(e) => setParola(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-4 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition duration-150 placeholder:text-gray-600"
                            />
                            <button
                                type="button"
                                onClick={() => setArataParola(!arataParola)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none z-20"
                            >
                                {arataParola ? (
                                    <AiOutlineEyeInvisible className="w-6 h-6 text-gray-500 group-hover:text-blue-400" />
                                ) : (
                                    <AiOutlineEye className="w-6 h-6 text-gray-500 group-hover:text-blue-400" />
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">Confirmă Parola</label>
                        <div className="relative group">
                            <input
                                type={arataParola ? "text" : "password"}
                                required
                                value={confirmParola}
                                onChange={(e) => setConfirmParola(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-4 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition duration-150 placeholder:text-gray-600"
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={seReseteaza}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition duration-150 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                    >
                        {seReseteaza ? 'Se salvează...' : 'Salvează Noua Parolă'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
