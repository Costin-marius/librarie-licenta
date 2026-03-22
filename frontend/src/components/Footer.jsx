import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-anthracite dark:bg-slate-950 text-stone-300 pt-20 pb-10 px-6 md:px-12 transition-colors duration-300 mt-20 border-t-4 border-amber-500" data-purpose="main-footer">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div className="md:col-span-1">
                    <h2 className="text-4xl font-serif font-bold text-white mb-6 tracking-wide">
                        BookIo<span className="text-amber-500">.</span>
                    </h2>
                    <p className="max-w-sm text-stone-400 mb-8 leading-relaxed">
                        Un refugiu digital pentru iubitorii de cuvinte. Selecționăm cu grijă fiecare titlu pentru a-ți oferi nu doar o carte, ci o experiență senzorială completă.
                    </p>
                    <div className="flex space-x-4">
                        {/* Iconite Social Media */}
                        <a className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all duration-300 shadow-sm" href="#">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                        </a>
                        <a className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all duration-300 shadow-sm" href="#">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                        </a>
                    </div>
                </div>

                <div className="md:col-span-1 flex flex-col md:items-end">
                    <div className="w-full md:w-auto">
                        <h3 className="text-white font-semibold mb-6 uppercase tracking-widest text-sm opacity-90 md:text-right">Informații Utile</h3>
                        <ul className="space-y-3 text-sm text-stone-400 md:text-right">
                            <li><Link className="hover:text-amber-500 transition-colors duration-300" to="/despre-noi">Despre Noi</Link></li>
                            <li><Link className="hover:text-amber-500 transition-colors duration-300" to="/contact">Contact</Link></li>
                            <li><Link className="hover:text-amber-500 transition-colors duration-300" to="/livrare">Livrare și Retur</Link></li>
                            <li><Link className="hover:text-amber-500 transition-colors duration-300" to="/termeni">Termeni și Condiții</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-stone-800/60 text-sm text-stone-500 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
                <p>© 2026 BookIo. Creat cu pasiune pentru cititori.</p>
                <div className="flex space-x-3 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer">
                    <span className="text-xl">💳</span>
                    <span className="text-xs font-semibold uppercase tracking-widest">Securizat</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;