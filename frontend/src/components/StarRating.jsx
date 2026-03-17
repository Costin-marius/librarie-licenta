import React, { useState } from 'react';

function StarRating({ ratingMediu, numarRecenzii, userRating, onRatingSubmit }) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRatingSubmit(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                        title={`Acordă nota ${star}`}
                    >
                        <svg
                            className={`w-6 h-6 transition-colors duration-200 ${
                                star <= (hoverRating || userRating || ratingMediu || 0)
                                    ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]'
                                    : 'text-gray-600 hover:text-yellow-200'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                ))}
            </div>
            <span className="text-sm font-medium text-gray-400">
                {ratingMediu > 0 
                    ? `${ratingMediu} din 5 (${numarRecenzii} ${numarRecenzii === 1 ? 'recenzie' : 'recenzii'})` 
                    : 'Fii primul care lasă o recenzie!'}
            </span>
        </div>
    );
}

export default StarRating;