import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Am adaugat setRolUtilizator si setVizualizare ca props
function Login({ setRolUtilizator, setVizualizare , setNumeUtilizator}) {
    const [isLogin, setIsLogin] = useState(true);
    const [dateFormular, setDateFormular] = useState({ email: '', parola: '', nume: '' });

    const handleInput = (e) => {
        setDateFormular({ ...dateFormular, [e.target.name]: e.target.value });
    };

    const trimiteFormular = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                const response = await axios.post('http://localhost:5000/api/auth/login', {
                    email: dateFormular.email,
                    parola: dateFormular.parola
                });
                
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('rol', response.data.rol || 'user');
                localStorage.setItem('nume', response.data.nume || ''); // Salvăm în browser
    if(setNumeUtilizator) setNumeUtilizator(response.data.nume || '')
    
                
                // Actualizam starea in App.jsx imediat
                if(setRolUtilizator) setRolUtilizator(response.data.rol || 'user');
                if(setNumeUtilizator) setNumeUtilizator(response.data.nume || '')

                toast.success('Te-ai autentificat!');
                
                // Ne intoarcem la magazin
                setTimeout(() => {
                    if(setVizualizare) setVizualizare('magazin');
                    else window.location.href = '/';
                }, 1000);

            } else {
                await axios.post('http://localhost:5000/api/auth/register', dateFormular);
                toast.success('Cont creat! Acum te poți loga.');
                setIsLogin(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Eroare la autentificare!');
        }
    };

    return (
        /* w-full h-full si items-center justify-center ca sa stea pe mijlocul ecranului */
        <div className="w-full h-full flex items-center justify-center bg-gray-950 px-4">
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />

            <div className="max-w-md w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-400 mb-2">📚 Librăria Ta</h1>
                    <p className="text-gray-400">
                        {isLogin ? 'Bine ai revenit!' : 'Creează un cont nou.'}
                    </p>
                </div>

                <form onSubmit={trimiteFormular} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nume complet</label>
                            <input type="text" name="nume" required={!isLogin} value={dateFormular.nume} onChange={handleInput} placeholder="ex: Ion Popescu" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input type="email" name="email" required value={dateFormular.email} onChange={handleInput} placeholder="exemplu@email.com" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Parolă</label>
                        <input type="password" name="parola" required value={dateFormular.parola} onChange={handleInput} placeholder="••••••••" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-4 shadow-lg">
                        {isLogin ? '🔑 Intră în cont' : '✨ Creează cont'}
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-gray-800 pt-6">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:text-blue-300 font-semibold transition">
                        {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Autentifică-te'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;