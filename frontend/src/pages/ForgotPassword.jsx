import { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [trimitereInCurs, setTrimitereInCurs] = useState(false);

    const particlesInit = async (main) => {
        await loadFull(main);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTrimitereInCurs(true);
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            toast.success('Emailul cu instrucțiunile de resetare a fost trimis!');
            setEmail('');
        } catch (error) {
            toast.error(error.response?.data?.mesaj || 'Eroare la trimiterea emailului!');
        } finally {
            setTrimitereInCurs(false);
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
                    <h1 className="text-3xl font-black text-blue-400 mb-2 tracking-tight">Ai uitat parola?</h1>
                    <p className="text-gray-400 text-sm">
                        Introdu adresa de email asociată contului tău și îți vom trimite un link pentru resetarea parolei.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplu@email.com"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition duration-150 placeholder:text-gray-600"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={trimitereInCurs}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition duration-150 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                    >
                        {trimitereInCurs ? 'Se trimite...' : 'Trimite Link de Resetare'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-800 pt-6">
                    <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition duration-150">
                        &larr; Înapoi la Autentificare
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
