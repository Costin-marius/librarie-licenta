import React from 'react';

function PoliticaRetur() {
    return (
        <div className="bg-ivory dark:bg-slate-900 min-h-screen pt-32 pb-20 px-6 md:px-12 transition-colors duration-300">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl border border-stone-200 dark:border-slate-700">
                <h1 className="text-4xl font-serif font-bold text-amber-900 dark:text-amber-500 mb-8 border-b border-stone-200 dark:border-slate-700 pb-4">
                    Politica de Retur
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none text-anthracite dark:text-stone-300">
                    <p className="lead text-xl mb-6 font-medium">
                        La BookIo, dorim să fii pe deplin mulțumit de cărțile pe care le cumperi. Dacă te-ai răzgândit sau produsul nu corespunde așteptărilor tale, ai la dispoziție o procedură simplă și rapidă de retur.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-amber-700 dark:text-amber-400">
                        Termenul de retur
                    </h2>
                    <p className="mb-6">
                        Conform legislației în vigoare, poți returna orice produs achiziționat în termen de <strong>14 zile calendaristice</strong> de la momentul în care ai intrat în posesia fizică a comenzii. Produsul trebuie să fie în acceași stare în care a fost livrat (fără urme de uzură, îndoituri grave ale coperților sau pagini lipsă).
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-amber-700 dark:text-amber-400">
                        Cum inițiezi un retur?
                    </h2>
                    <p className="mb-6">
                        Nu este nevoie să completezi formulare complicate. Tot ce trebuie să faci este să ne trimiți un e-mail cu detaliile comenzii pentru care dorești rambursarea.
                    </p>

                    <div className="bg-stone-50 dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            Trimite-ne un e-mail la:
                        </h3>
                        <a 
                            href="mailto:retur@bookio.ro?subject=Cerere%20Retur&body=Buna%20ziua,%0A%0ADoresc%20sa%20efectuez%20un%20retur.%0A%0ANumarul%20Comenzii:%20[Completeaza%20aici]%0AMotivul%20Returului:%20[Completeaza%20aici]%0A%0AMultumesc!" 
                            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
                        >
                            <span>costinmarius23@stud.ase.ro</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </a>
                        <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
                            Te rugăm să incluzi în e-mail <strong>Numărul Comenzii</strong> și <strong>Motivul Returului</strong>.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-amber-700 dark:text-amber-400">
                        Rambursarea sumei
                    </h2>
                    <p>
                        Odată ce coletul de retur a ajuns la noi și a fost verificat, îți vom rambursa contravaloarea produselor în contul bancar specificat de tine sau pe cardul utilizat la plată, în termen de maxim <strong>5 zile lucrătoare</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PoliticaRetur;
