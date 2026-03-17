import React from 'react';

function CheckoutPanel({ carte, isInWishlist, handleAdaugaInCos, handleToggleWishlist }) {
    return (
        <div className="bg-[#1a1f2b] md:bg-gray-800/40 rounded-xl p-6 flex flex-col border border-gray-700/50 shadow-sm h-full">
            
            {/* Preț */}
            <div className="text-3xl font-bold text-white mb-3">
                {carte.pret} lei
            </div>

            {localStorage.getItem('rol') === 'admin' ? (
                <div className="text-blue-400 font-semibold text-sm mb-6">
                    🛠️ Stoc intern (Admin): {carte.stoc} buc.
                </div>
            ) : (
                <div className="text-sm mb-6">
                    {carte.stoc > 10 && (
                        <span className="text-green-500 font-semibold">✓ În stoc</span>
                    )}
                    {carte.stoc > 0 && carte.stoc <= 10 && (
                        <span className="text-orange-500 font-semibold">
                            🔥 Ultimele {carte.stoc} bucăți!
                        </span>
                    )}
                    {carte.stoc === 0 && (
                        <span className="text-red-500 font-semibold">Stoc epuizat</span>
                    )}
                </div>
            )}

            {/* Buton Adaugă în Coș */}
            <button
                onClick={() => handleAdaugaInCos(carte)}
                className="w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded transition-colors uppercase tracking-wider shadow-md mb-3"
            >
                Adaugă în coș
            </button>

            {/* Buton Wishlist */}
            <button
                onClick={handleToggleWishlist}
                className="w-full py-2.5 bg-transparent border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-gray-300 text-sm font-medium rounded transition-all flex items-center justify-center gap-2"
            >
                {isInWishlist ? (
                    <>
                        <span className="text-pink-500 text-lg leading-none">❤️</span> În wishlist-ul tău
                    </>
                ) : (
                    <>
                        <span className="text-gray-400 text-lg leading-none">🤍</span> Adaugă în wishlist
                    </>
                )}
            </button>

            {/* Informații Livrare & Retur */}
            <div className="mt-auto pt-6 flex flex-col gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <span className="text-orange-400 text-base">🚚</span>
                    <p>Livrare gratuită la comenzi peste 150 lei.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-orange-400 text-base">📦</span>
                    <p>Retur gratuit în 14 zile.</p>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPanel;