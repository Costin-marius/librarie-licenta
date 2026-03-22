import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

function Termeni() {
  return (
    <div className="flex-1 w-full bg-ivory dark:bg-slate-900 transition-colors duration-300 font-sans overflow-x-hidden relative">
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-900 dark:text-amber-500 mb-8 tracking-tight text-center">Termeni și Condiții</h1>
        
        <div className="space-y-6 text-stone-700 dark:text-stone-300 leading-relaxed text-sm lg:text-base">
            <p>
                Bine ați venit pe site-ul BookIo. Utilizarea acestui site implică acceptarea expresă a termenilor și condițiilor de mai jos. Vă recomandăm citirea cu atenție a acestora înainte de a plasa orice comandă.
            </p>

            <h2 className="text-xl font-bold text-anthracite dark:text-stone-200 mt-8 mb-2 border-b border-stone-200 dark:border-stone-700 pb-1">1. Date introductive</h2>
            <p>
                Prezentul document stabilește termenii și condițiile de utilizare a site-ului bookio-boutique.ro, precum și de achiziție a produselor oferite. Modificările acestor termeni vor fi actualizate pe această pagină.
            </p>

            <h2 className="text-xl font-bold text-anthracite dark:text-stone-200 mt-8 mb-2 border-b border-stone-200 dark:border-stone-700 pb-1">2. Procesul de Comandă</h2>
            <p>
                Comenzile se pot realiza exclusiv online, creând un cont de utilizator sau operând ca vizitator. Plasarea unei comenzi reprezintă acceptarea de către dvs. a prețului și caracteristicilor produsului selectat. Ne rezervăm dreptul de a anula comenzi în eventualitatea epuizării stocului, caz în care veți fi notificat în cel mai scurt timp.
            </p>

            <h2 className="text-xl font-bold text-anthracite dark:text-stone-200 mt-8 mb-2 border-b border-stone-200 dark:border-stone-700 pb-1">3. Politica de Prețuri și Plată</h2>
            <p>
                Toate prețurile afișate pe site includ TVA. Plata se poate efectua online prin card bancar sau ramburs la primirea coletului. Compania noastră nu stochează datele sensibile ale cardurilor bancare.
            </p>

            <h2 className="text-xl font-bold text-anthracite dark:text-stone-200 mt-8 mb-2 border-b border-stone-200 dark:border-stone-700 pb-1">4. Confidențialitatea Datelor</h2>
            <p>
                Ne angajăm să respectăm confidențialitatea datelor dumneavoastră personale. Acestea vor fi utilizate strict în scopul procesării comenzilor și, dacă ați consimțit expres, pentru informări de marketing.
            </p>

            <h2 className="text-xl font-bold text-anthracite dark:text-stone-200 mt-8 mb-2 border-b border-stone-200 dark:border-stone-700 pb-1">5. Litigii și Dispoziții Finale</h2>
            <p>
                Orice neînțelegere între vânzător și cumpărător va fi rezolvată pe cale amiabilă. În eventualitatea imposibilității unei reconcilieri, litigiul va fi soluționat de instanțele judecătorești competente din România.
            </p>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default Termeni;
