function Sidebar({ tabCurent, setTabCurent, handleDelogare }) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col hidden md:flex transition-colors duration-300 z-10">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400 transition-colors">AdminPanel</h2>
        <p className="text-xs text-gray-500 mt-1">Gestiune Magazin</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => setTabCurent('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${tabCurent === 'dashboard' ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
        >
          📊 Dashboard
        </button>
        
        <button
          onClick={() => setTabCurent('carti')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${tabCurent === 'carti' ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
        >
          📦 Inventar Cărți
        </button>
        
        <button
          onClick={() => setTabCurent('comenzi')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${tabCurent === 'comenzi' ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
        >
          🛒 Comenzi Clienți
        </button>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <button onClick={handleDelogare} className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/40 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 py-2 rounded-lg transition-colors border border-gray-300 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-800">
          🚪 Delogare
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;