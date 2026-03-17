import React from 'react';
import BookCard from '../BookCard'; // Importăm cardul tău existent de carte

function Recomandari({ cartiSimilare, wishlist, handleAdaugaInCos, handleToggleWishlist }) {
    // Dacă nu avem cărți similare, nu afișăm secțiunea deloc
    if (!cartiSimilare || cartiSimilare.length === 0) {
        return null; 
    }

    return (
        <div className="mt-20 pt-10 border-t border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="bg-blue-600 w-2 h-8 rounded-full"></span>
                Cărți similare care te-ar putea interesa
            </h2>
            
            {/* Grid-ul cu cărți */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cartiSimilare.map((carteSimilara) => {
                    const isInWishlist = wishlist.some(item => item._id === carteSimilara._id);
                    return (
                        <BookCard
                            key={carteSimilara._id}
                            carte={carteSimilara}
                            handleAdaugaInCos={handleAdaugaInCos}
                            handleToggleWishlist={handleToggleWishlist}
                            isInWishlist={isInWishlist}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default Recomandari;