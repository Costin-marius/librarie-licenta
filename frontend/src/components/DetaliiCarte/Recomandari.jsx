import React from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../BookCard';

// Am adăugat "categorie" aici, în paranteză
function Recomandari({ titlu, cartiSimilare, categorie, wishlist, handleAdaugaInCos, handleToggleWishlist }) {
    if (!cartiSimilare || cartiSimilare.length === 0) return null;

    return (
        <div className="max-w-6xl mx-auto mt-12 mb-8">
            <div className="flex items-center justify-between mb-6">
                
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {titlu || "Cărți similare care te-ar putea interesa"}
                    </h2>
                </div>

                {categorie && (
                    <Link 
                        to={`/?categorie=${categorie}`} 
                        className="text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-wider flex items-center gap-1 group"
                    >
                        Vezi tot
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </Link>
                )}

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