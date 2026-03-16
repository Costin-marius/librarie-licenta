import { useState, useEffect } from 'react';

function ScrollToTop() {
    const [arataScroll, setArataScroll] = useState(false);

    useEffect(() => {
        const verificaScroll = () => {
            if (window.scrollY > 300) {
                setArataScroll(true);
            } else {
                setArataScroll(false);
            }
        };

        window.addEventListener('scroll', verificaScroll);
        return () => window.removeEventListener('scroll', verificaScroll);
    }, []);

    const mergiSus = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!arataScroll) return null; 
    return (
        <button
            onClick={mergiSus}
            className="fixed bottom-8 right-8 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:-translate-y-2 z-50 flex items-center justify-center border-2 border-white/20"
            title="Înapoi sus"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path>
            </svg>
        </button>
    );
}

export default ScrollToTop;