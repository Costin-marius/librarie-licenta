import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

function Livrare() {
  return (
    <div className="flex-1 w-full bg-ivory dark:bg-slate-900 transition-colors duration-300 font-sans overflow-x-hidden relative">
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-900 dark:text-amber-500 mb-8 tracking-tight text-center">Livrare și Retur</h1>
        
        <div className="space-y-10 text-stone-700 dark:text-stone-300 leading-relaxed">
            <section>
                <h2 className="text-2xl font-bold text-anthracite dark:text-stone-200 mb-4 border-b border-amber-200 dark:border-amber-900/50 pb-2">1. Politica de Livrare</h2>
                <p className="mb-4">
                    La BookIo, ne străduim ca titlurile preferate să ajungă la tine în cel mai scurt timp și în plină siguranță. Colaborăm exclusiv cu firme de curierat rapid recunoscute la nivel național.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Costul livrării:</strong> Transportul costă 30 RON pentru comenzile sub 150 RON. Beneficiezi de <strong>livrare gratuită</strong> la comenzi a căror valoare totală depășește 150 RON.</li>
                    <li><strong>Timpul de livrare:</strong> Din momentul confirmării comenzii, coletele sunt predate curierului în maximum 24 de ore lucrătoare. Timpul mediu de tranzit este de 1-2 zile lucrătoare.</li>
                    <li><strong>Urmărirea comenzii:</strong> Imediat ce pachetul părăsește depozitul nostru, vei primi un email cu numărul de AWB pentru a urmări statusul livrării în timp real.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-anthracite dark:text-stone-200 mb-4 border-b border-amber-200 dark:border-amber-900/50 pb-2">2. Procedura de Retur</h2>
                <p className="mb-4">
                    Ne dorim să fii pe deplin mulțumit de achiziția ta. Dacă totuși consideri că produsele primite nu corespund așteptărilor tale, poți opta pentru returul acestora în termen de <strong>14 zile calendaristice</strong> de la recepționare.
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Cărțile returnate trebuie să fie în aceeași condiție în care au fost livrate: fără urme de uzură, îndoituri grave ale coperților sau notițe pe pagini.</li>
                    <li>Costul transportului pentru retur va fi suportat de tine, excepție făcând cazurile în care ai primit un produs defect sau o altă carte decât cea comandată.</li>
                    <li>Rambursarea sumei se va face în contul bancar specificat de tine în formularul de retur, în termen de maximum 7 zile lucrătoare de la primirea și verificarea stării cărților returnate.</li>
                </ul>
                <p>
                    Pentru a iniția un retur, te rugăm să ne scrii un e-mail la <strong>salut@bookio-boutique.ro</strong>, specificând numărul comenzii și contul IBAN unde dorești rambursarea sumei.
                </p>
            </section>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default Livrare;
