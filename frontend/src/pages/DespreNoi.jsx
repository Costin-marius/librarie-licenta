import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

function DespreNoi() {
  return (
    <div className="flex-1 w-full bg-ivory dark:bg-slate-900 transition-colors duration-300 font-sans overflow-x-hidden relative">
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-900 dark:text-amber-500 mb-8 tracking-tight text-center">Despre Noi</h1>
        <div className="space-y-6 text-lg text-stone-700 dark:text-stone-300 leading-relaxed">
          <p>
            Bine ai venit la <strong>BookIo</strong>, refugiul tău digital pentru literatură de calitate. Ne mândrim cu o colecție atent selecționată de cărți, de la cele mai noi bestselleruri până la ediții rare și de colecție, menite să satisfacă chiar și cele mai rafinate gusturi.
          </p>
          <p>
            Povestea noastră a început din pasiunea pură pentru cuvintele scrise și din dorința de a crea o comunitate restrânsă de cititori dedicați. Fiecare titlu prezent pe rafturile noastre virtuale a fost ales cu grijă pentru a asigura o experiență de lectură memorabilă, o evadare într-un univers liniștit, plin de cunoaștere și imaginație.
          </p>
          <p>
            Te invităm să explorezi selecțiile noastre și să te pierzi în paginile unei cărți bune. Echipa noastră este întotdeauna aici pentru a te îndruma cu recomandări personalizate, transformând simpla achiziție a unei cărți într-o adevărată descoperire culturală. Îți mulțumim că ești alături de noi în această călătorie.
          </p>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default DespreNoi;
