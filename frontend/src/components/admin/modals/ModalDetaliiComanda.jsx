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
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            {(() => {
              const subtotal = comandaSelectata.produse.reduce((sum, item) => sum + (item.pret * item.cantitate), 0);
              const costTransport = comandaSelectata.total - subtotal;
              return (
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex justify-between w-full sm:w-64 text-sm text-gray-500 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span className="font-medium">{subtotal.toFixed(2)} RON</span>
                  </div>
                  <div className="flex justify-between w-full sm:w-64 text-sm text-gray-500 dark:text-gray-400 pb-2">
                    <span>Transport:</span>
                    <span className={costTransport <= 0.01 ? "text-green-600 dark:text-green-500 font-bold" : "font-medium"}>
                      {costTransport <= 0.01 ? 'Gratuit' : `${costTransport.toFixed(2)} RON`}
                    </span>
                  </div>
                  <div className="flex justify-between w-full items-center border-t border-gray-100 dark:border-gray-800 pt-4">
                    <span className="font-bold text-lg">Total de plată:</span>
                    <span className="font-black text-xl text-blue-600 dark:text-blue-400">{comandaSelectata.total.toFixed(2)} RON</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalDetaliiComanda;