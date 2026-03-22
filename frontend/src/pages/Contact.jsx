import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

function Contact() {
  return (
    <div className="flex-1 w-full bg-ivory dark:bg-slate-900 transition-colors duration-300 font-sans overflow-x-hidden relative">
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-900 dark:text-amber-500 mb-8 tracking-tight text-center">Contact</h1>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-stone-200 dark:border-stone-700 mt-8">
            <h2 className="text-2xl font-bold text-anthracite dark:text-stone-200 mb-6">Ne-ar face plăcere să te auzim</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
              Dacă ai întrebări despre comanda ta, dorești recomandări de lectură sau vrei pur și simplu să ne spui părerea ta, nu ezita să ne contactezi folosind datele de mai jos.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-3">Detalii Magazin</h3>
                    <ul className="space-y-4 text-stone-700 dark:text-stone-300">
                        <li className="flex items-start gap-3">
                            <span className="text-2xl">📍</span>
                            <span>Strada Literaturii Noi, Nr. 12<br/>Sector 1, București, România</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-2xl">📞</span>
                            <span>+40 721 000 000</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-2xl">✉️</span>
                            <span>salut@bookio-boutique.ro</span>
                        </li>
                    </ul>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-3">Program de Lucru</h3>
                    <ul className="space-y-2 text-stone-700 dark:text-stone-300">
                        <li className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                            <span>Luni - Vineri</span>
                            <span className="font-medium">09:00 - 18:00</span>
                        </li>
                        <li className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                            <span>Sâmbătă</span>
                            <span className="font-medium">10:00 - 15:00</span>
                        </li>
                        <li className="flex justify-between pb-2 text-red-600 dark:text-red-400">
                            <span>Duminică</span>
                            <span className="font-medium">Închis</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default Contact;
