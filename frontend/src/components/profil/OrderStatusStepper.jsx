import React from 'react';

const OrderStatusStepper = ({ statusCurent }) => {
    // 1. Verificăm prima dată starea de excepție: Anulată
    if (statusCurent === 'Anulată') {
        return (
            <div className="w-full mt-6 mb-4">
                <div className="flex items-center justify-center p-4 bg-red-900/10 border border-red-500/30 rounded-xl">
                    <span className="text-red-500 font-bold tracking-wider flex items-center gap-2 uppercase text-sm">
                        ❌ Comandă Anulată
                    </span>
                </div>
            </div>
        );
    }

    // 2. Dacă nu e anulată, afișăm tracker-ul normal
    const stari = ['Plasată', 'În procesare', 'Expediată', 'Livrată'];
    const indexCurent = stari.indexOf(statusCurent) !== -1 ? stari.indexOf(statusCurent) : 0;

    return (
        <div className="w-full mt-6 mb-4 px-2">
            <div className="flex items-center justify-between relative">
                {/* Linia din spate */}
                <div className="absolute left-0 top-4 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-slate-700 -z-10 rounded"></div>
                
                {/* Linia colorată care arată progresul */}
                <div 
                    className="absolute left-0 top-4 -translate-y-1/2 h-1 bg-amber-500 -z-10 rounded transition-all duration-500 ease-in-out" 
                    style={{ width: `${(indexCurent / (stari.length - 1)) * 100}%` }}
                ></div>

                {/* Bulinele pentru fiecare pas */}
                {stari.map((stare, index) => {
                    const completat = index <= indexCurent;
                    return (
                        <div key={stare} className="flex flex-col items-center gap-2 bg-transparent px-1 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 shadow-sm ${completat ? 'bg-amber-500 border-amber-500 text-white' : 'bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-gray-500'} `}>
                                {completat ? '✓' : index + 1}
                            </div>
                            <span className={`text-xs font-semibold uppercase tracking-wider hidden sm:block ${completat ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                {stare}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderStatusStepper;
