function ModalDetaliiComanda({ comandaSelectata, setArataModalDetalii }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-xl font-bold">Detalii Comandă #{comandaSelectata._id.slice(-6)}</h3>
            <p className="text-sm text-gray-500">{comandaSelectata.dateLivrare?.nume} • {comandaSelectata.dateLivrare?.telefon}</p>
          </div>
          <button onClick={() => setArataModalDetalii(false)} className="text-2xl text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Adresă Livrare</h4>
            <p className="text-sm">{comandaSelectata.dateLivrare?.adresa}, {comandaSelectata.dateLivrare?.oras}</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-gray-500 border-b border-gray-200 dark:border-gray-800">
                <th className="py-2">Produs</th>
                <th className="py-2 text-center">Cantitate</th>
                <th className="py-2 text-right">Preț Unit.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {comandaSelectata.produse.map((p, index) => (
                <tr key={index} className="text-sm">
                  <td className="py-3 font-medium">{p.titlu}</td>
                  <td className="py-3 text-center">x {p.cantitate}</td>
                  <td className="py-3 text-right">{p.pret} RON</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
            <span className="font-bold text-lg">Total de plată:</span>
            <span className="font-black text-xl text-blue-600 dark:text-blue-400">{comandaSelectata.total} RON</span>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => setArataModalDetalii(false)} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
              Închide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalDetaliiComanda;