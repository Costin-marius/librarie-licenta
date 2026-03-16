function BookFilters({ 
    criteriuSortare, 
    setCriteriuSortare, 
    categorieSelectata, 
    setCategorieSelectata, 
    categoriiDisponibile, 
    carti 
}) {
    return (
        <section className="mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <h2 className="text-3xl font-serif font-bold text-anthracite dark:text-stone-100 transition-colors duration-300">
                    Răsfoiește Colecțiile
                </h2>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-stone-600 dark:text-stone-400 text-sm whitespace-nowrap">
                        Sortează:
                    </span>
                    <select
                        value={criteriuSortare}
                        onChange={(e) => setCriteriuSortare(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-anthracite dark:text-stone-300 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2 outline-none cursor-pointer transition-colors"
                    >
                        <option value="default">Relevanță</option>
                        <option value="pretCresc">Preț: Crescător</option>
                        <option value="pretDesc">Preț: Descrescător</option>
                        <option value="az">Titlu: A - Z</option>
                        <option value="za">Titlu: Z - A</option>
                    </select>
                </div>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
                {/* Butonul TOATE cu numarul total */}
                <button
                    onClick={() => setCategorieSelectata('Toate')}
                    className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                        categorieSelectata === 'Toate'
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-stone-300 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-500'
                    }`}
                >
                    Toate <span className="ml-1 opacity-70 text-sm font-bold">({carti.length})</span>
                </button>

                {/* Butoanele pentru restul categoriilor */}
                {categoriiDisponibile.filter(cat => cat !== 'Toate').map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategorieSelectata(cat)}
                        className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                            categorieSelectata === cat
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-stone-300 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-500'
                        }`}
                    >
                        {cat} <span className="ml-1 opacity-70 text-sm font-bold">({carti.filter(c => c.categorie === cat).length})</span>
                    </button>
                ))}
            </div>
        </section>
    );
}

export default BookFilters;