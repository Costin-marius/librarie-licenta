function ModalStergereComanda({ setArataModalStergereComanda, confirmaStergereaComanda }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 text-2xl">🗑️</div>
        <h3 className="text-xl font-bold mb-2">Ștergi comanda?</h3>
        <p className="text-gray-500 text-sm mb-6">Atenție: Aceasta elimină definitiv comanda din baza de date.</p>
        <div className="flex gap-3">
          <button onClick={() => setArataModalStergereComanda(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg">Renunță</button>
          <button onClick={confirmaStergereaComanda} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Șterge</button>
        </div>
      </div>
    </div>
  );
}

export default ModalStergereComanda;