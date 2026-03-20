function ModalFormularCarte({ idEditare, inchideModal, salveazaCarte, dateFormular, setDateFormular }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold">{idEditare ? 'Editează Înregistrarea' : 'Adaugă Carte Nouă'}</h3>
          <button onClick={inchideModal} className="text-2xl">&times;</button>
        </div>
        <form onSubmit={salveazaCarte} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {['isbn', 'titlu', 'autor', 'editura', 'categorie'].map(camp => (
            <div key={camp}>
              <label className="block text-xs font-medium text-gray-400 uppercase mb-1">{camp}</label>
              <input
                type="text"
                required
                value={dateFormular[camp]}
                onChange={(e) => setDateFormular({ ...dateFormular, [camp]: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Preț (RON)</label>
            <input
              type="number"
              required
              value={dateFormular.pret}
              onChange={(e) => setDateFormular({ ...dateFormular, pret: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Stoc (Buc)</label>
            <input
              type="number"
              required
              value={dateFormular.stoc}
              onChange={(e) => setDateFormular({ ...dateFormular, stoc: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Link Imagine Copertă</label>
            <input
              type="text"
              required
              value={dateFormular.imagine_url}
              onChange={(e) => setDateFormular({ ...dateFormular, imagine_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-800">
            <button type="button" onClick={inchideModal} className="px-5 py-2.5 bg-gray-800 rounded-lg font-medium">
              Renunță
            </button>
            <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold">
              {idEditare ? 'Salvează' : 'Adaugă'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalFormularCarte;