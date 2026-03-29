import React from 'react';
import OrderStatusStepper from './OrderStatusStepper';
import { generateInvoicePDF } from './FacturaPDF';

const IstoricComenzi = ({ comenzi, dateUser, inapoiLaHome }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 transition-colors h-full">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-slate-700">
                <h3 className="text-xl sm:text-2xl font-bold text-anthracite dark:text-stone-100">Comenzile Mele</h3>
                <span className="bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 px-3 py-1 rounded-full text-sm font-bold">
                    {comenzi.length} Comenzi
                </span>
            </div>

            {/* Lista de comenzi */}
            {comenzi.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-stone-500 dark:text-stone-400 text-lg mb-4">Nu ai plasat nicio comandă încă.</p>
                    <button onClick={inapoiLaHome} className="text-amber-500 font-bold hover:underline">Descoperă cărțile noastre</button>
                </div>
            ) : (
                <div className="space-y-8">
                    {comenzi.map((comanda) => (
                        <div key={comanda._id} className="border border-gray-200 dark:border-slate-600 rounded-xl p-5 sm:p-6 bg-stone-50/50 dark:bg-slate-900/50 hover:shadow-md transition-shadow">
                            
                            {/* Header Comandă */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">ID Comandă: {comanda._id.slice(-8)}</p>
                                    <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                                        Plasată pe: <span className="font-bold text-anthracite dark:text-white">
                                            {comanda.createdAt ? new Date(comanda.createdAt).toLocaleDateString('ro-RO') : 'Dată necunoscută'}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-left sm:text-right flex flex-col sm:items-end">
                                    <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Total Plată</p>
                                    <p className="text-xl font-black text-amber-600 dark:text-amber-500 mb-2">{comanda.total.toFixed(2)} lei</p>
                                    <button onClick={() => generateInvoicePDF(comanda, dateUser)} className="text-xs flex items-center justify-center gap-1.5 text-stone-600 hover:text-amber-600 dark:text-stone-300 dark:hover:text-amber-400 font-semibold border border-stone-300 hover:border-amber-400 dark:border-slate-600 dark:hover:border-amber-500/50 px-3 py-1.5 rounded-lg transition-colors bg-white dark:bg-slate-800 shadow-sm w-fit">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Descarcă Factura
                                    </button>
                                </div>
                            </div>

                            {/* Stepper-ul magic de status */}
                            <OrderStatusStepper statusCurent={comanda.stare} />

                            {/* Detalii Produse */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                                <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-4">Produse comandate:</h4>
                                <ul className="space-y-3">
                                    {comanda.produse.map((produs, idx) => (
                                        <li key={idx} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded bg-gray-200 dark:bg-slate-700 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold text-xs">{produs.cantitate}x</span>
                                                <span className="text-stone-600 dark:text-stone-300 font-medium line-clamp-1">{produs.titlu}</span>
                                            </div>
                                            <span className="font-bold text-stone-500 dark:text-stone-400 whitespace-nowrap">{(produs.pret * produs.cantitate).toFixed(2)} lei</span>
                                        </li>
                                    ))}
                                </ul>
                                
                                {/* Subtotal si Transport */}
                                {(() => {
                                    const subtotal = comanda.produse.reduce((acc, p) => acc + (p.pret * p.cantitate), 0);
                                    const costTransport = comanda.total - subtotal;
                                    return (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50 flex flex-col gap-2 text-sm max-w-sm ml-auto">
                                            <div className="flex justify-between text-stone-500 dark:text-stone-400">
                                                <span>Subtotal:</span>
                                                <span className="font-medium">{subtotal.toFixed(2)} lei</span>
                                            </div>
                                            <div className="flex justify-between text-stone-500 dark:text-stone-400">
                                                <span>Transport:</span>
                                                {costTransport <= 0.01 ? (
                                                    <span className="text-green-600 dark:text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">Gratuit</span>
                                                ) : (
                                                    <span className="font-medium">{costTransport.toFixed(2)} lei</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IstoricComenzi;
