import React, { useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

function SuccessPage({ setCos }) {
    const navigate = useNavigate();

    useEffect(() => {
        // Golim coșul pentru că am ajuns aici => plata a fost validată (sau în curs de validare direct de Stripe)
        const emptyCartAsync = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await axios.delete('http://localhost:5000/api/user/cos/goleste', { 
                        headers: { Authorization: `Bearer ${token}` } 
                    });
                } catch (err) {
                    console.error("Eroare la golirea coșului backend", err);
                }
            }
            // Golim starea din Frontend și localStorage
            setCos([]);
            localStorage.removeItem('cos');
        };

        emptyCartAsync();
    }, [setCos]);

    const particlesInit = async (main) => {
        await loadFull(main);
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
                    particles: {
                        color: { value: "#22c55e" }, // green particles
                        links: { color: "#22c55e", distance: 150, enable: true, opacity: 0.2, width: 1 },
                        move: { enable: true, speed: 1.5, outModes: { default: "bounce" } },
                        number: { density: { enable: true, area: 800 }, value: 50 },
                        opacity: { value: 0.5 },
                        shape: { type: "circle" },
                        size: { value: { min: 2, max: 4 } },
                    },
                    detectRetina: true,
                }}
                className="absolute inset-0 z-0"
            />
            
            <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-sm p-10 rounded-2xl border border-green-900/50 relative z-10 shadow-[0_0_40px_rgba(34,197,94,0.15)] text-center animate-float">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Plată reușită!</h1>
                <p className="text-green-400 font-semibold text-lg mb-4">Comanda ta a fost achitată cu succes.</p>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                    Îți mulțumim pentru comandă! Așteptăm cu nerăbdare să îți pregătim coletul. O chitanță a fost emisă și trimisă pe adresa ta de email.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/profil')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition duration-150 shadow-lg"
                    >
                        Vezi Comanda (Profil)
                    </button>
                    
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 font-bold py-3 rounded-xl transition duration-150"
                    >
                        Înapoi la Magazin
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SuccessPage;
