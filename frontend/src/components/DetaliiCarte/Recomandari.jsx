import React from 'react';
import BookCard from '../BookCard';

function Recomandari({ titlu, cartiSimilare, wishlist, handleAdaugaInCos, handleToggleWishlist }) {
    if (!cartiSimilare || cartiSimilare.length === 0) return null;

    return (
        <div className="max-w-6xl mx-auto mt-12 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-white">
                    {titlu || "Cărți similare care te-ar putea interesa"}
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {cartiSimilare.map((carte) => (
                    <div key={carte._id} className="w-full">
                        <BookCard 
                            carte={carte} 
                            adaugaInCos={handleAdaugaInCos} 
                            toggleWishlist={handleToggleWishlist} 
                            wishlist={wishlist} 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Recomandari;