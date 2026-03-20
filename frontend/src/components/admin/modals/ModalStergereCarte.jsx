function ModalStergereCarte({ setArataModalStergere, confirmaStergerea }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 text-2xl">⚠️</div>
        <h3 className="text-xl font-bold mb-2">Ștergi cartea?</h3>
        <p className="text-gray-500 text-sm mb-6">Acțiunea este ireversibilă.</p>
        <div className="flex gap-3">
          <button onClick={() => setArataModalStergere(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg">Anulează</button>
          <button onClick={confirmaStergerea} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Șterge</button>
        </div>
      </div>
    </div>
  );
}

export default ModalStergereCarte;