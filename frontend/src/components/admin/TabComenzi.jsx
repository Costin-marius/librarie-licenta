function TabComenzi({ comenzi, schimbaStatusComanda, deschideDetalii, setIdComandaDeSters, setArataModalStergereComanda }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-300">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <th className="px-6 py-4 font-medium">ID / Dată</th>
            <th className="px-6 py-4 font-medium">Client</th>
            <th className="px-6 py-4 font-medium">Total</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
          {comenzi.length === 0 ? (
            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Nu există comenzi.</td></tr>
          ) : (
            comenzi.map((comanda) => (
              <tr key={comanda._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm">#{comanda._id.slice(-6)}</div>
                  <div className="text-xs text-gray-500">
                    {comanda.createdAt ? new Date(comanda.createdAt).toLocaleDateString("ro-RO") : "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{comanda.dateLivrare?.nume || "Anonim"}</td>
                <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{comanda.total} RON</td>
                <td className="px-6 py-4">
                  <select
                    value={comanda.stare}
                    onChange={(e) => schimbaStatusComanda(comanda._id, e.target.value)}
                    className="text-sm border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded p-1 outline-none cursor-pointer"
                  >
                    <option value="Plasată">Plasată</option>
                    <option value="În procesare">În procesare</option>
                    <option value="Expediată">Expediată</option>
                    <option value="Livrată">Livrată</option>
                    <option value="Anulată">Anulată</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button onClick={() => deschideDetalii(comanda)} className="text-blue-600 hover:text-blue-700 font-medium">🔍 Detalii</button>
                  <button
                    onClick={() => {
                      setIdComandaDeSters(comanda._id);
                      setArataModalStergereComanda(true);
                    }}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Șterge
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TabComenzi;