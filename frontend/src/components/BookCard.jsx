import { Link } from 'react-router-dom';

function BookCard({ carte, adaugaInCos, toggleWishlist, wishlist }) {
    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.02)] dark:shadow-none dark:border dark:border-slate-700/50 transition-all duration-500" data-purpose="book-card">
            <div className="relative mb-4 group/image overflow-hidden rounded-xl">
                <Link to={`/carte/${carte._id}`}>
                    <div className="w-full aspect-[2/3] transition-all duration-500 z-10 bg-stone-100 dark:bg-slate-700">
                        <img 
                            alt={carte.titlu} 
                            className="w-full h-full object-cover shadow-xl dark:shadow-slate-950/50 group-hover/image:scale-105 transition-transform duration-700 ease-out" 
                            src={carte.imagine_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop"}
                        />
                    </div>
                </Link>

                {/* Status Badges */}
                <div className="absolute top-2 left-2 z-20 flex flex-col items-start gap-2 pointer-events-none">
                    {carte.stoc <= 3 && carte.stoc > 0 && (
                        <span className="px-3 py-1 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-md border border-red-100 dark:border-red-900/50 uppercase tracking-tight shadow-sm backdrop-blur-sm">
                            Doar {carte.stoc} în stoc
                        </span>
                    )}
                </div>

                {/* Hover Overlay Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center gap-4 z-20 pointer-events-none group-hover/image:pointer-events-auto">
                    
                    <Link to={`/carte/${carte._id}`} className="p-3 rounded-full bg-white/90 text-stone-600 hover:text-amber-500 hover:bg-white shadow-lg transition-transform hover:scale-110" title="Vezi detalii">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </Link>

                    {/* Buton Wishlist */}
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(carte._id); }} 
                        className={`p-3 rounded-full shadow-lg transition-transform hover:scale-110 ${wishlist.includes(carte._id) ? 'bg-white text-red-500' : 'bg-white/90 text-stone-600 hover:text-red-500 hover:bg-white'}`} 
                        title={wishlist.includes(carte._id) ? "Elimină din wishlist" : "Adaugă în wishlist"}
                    >
                        <svg className="w-6 h-6" fill={wishlist.includes(carte._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </button>

                    {/* Buton Cart */}
                    {carte.stoc > 0 ? (
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); adaugaInCos(carte); }} 
                            className="p-3 rounded-full bg-amber-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-amber-400" 
                            title="Adaugă în coș"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                        </button>
                    ) : (
                        <button disabled className="p-3 rounded-full bg-stone-500/80 text-white shadow-lg cursor-not-allowed">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-8 transition-colors duration-300 flex flex-col items-center h-full text-center">
                <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-semibold mb-1">{carte.autor}</p>
                <Link to={`/carte/${carte._id}`}>
                    <h3 className="text-xl font-serif font-bold text-anthracite dark:text-stone-100 line-clamp-1 hover:text-amber-500 transition-colors">
                        {carte.titlu}
                    </h3>
                </Link>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 line-clamp-1">Editura: {carte.editura}</p>
                <div className="mt-4 pt-3 flex items-center justify-center w-full">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-500">
                        {carte.pret} <span className="text-base font-bold opacity-80">RON</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default BookCard;