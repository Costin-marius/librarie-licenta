function TabCarti({ cartiFiltrate, deschideModalEditare, cereConfirmareStergere }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-300">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <th className="px-6 py-4 font-medium">Copertă</th>
            <th className="px-6 py-4 font-medium">Detalii</th>
            <th className="px-6 py-4 font-medium">Preț</th>
            <th className="px-6 py-4 font-medium">Stoc</th>
            <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
          {cartiFiltrate.map((carte) => (
            <tr key={carte._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-6 py-4 w-20">
                <img src={carte.imagine_url} alt="coperta" className="w-12 h-16 object-cover rounded shadow-sm border border-gray-200 dark:border-gray-700" />
              </td>
              <td className="px-6 py-4">
                <div className="font-bold">{carte.titlu}</div>
                <div className="text-sm text-gray-500">{carte.autor}</div>
              </td>
              <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{carte.pret} RON</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${carte.stoc < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {carte.stoc} buc
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-3">
                <button onClick={() => deschideModalEditare(carte)} className="text-amber-600 hover:text-amber-700 font-medium transition-colors">Editează</button>
                <button onClick={() => cereConfirmareStergere(carte._id)} className="text-red-600 hover:text-red-700 font-medium transition-colors">Șterge</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TabCarti;