import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatWidget = ({ cos, setCos }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Bună! Cu ce te pot ajuta astăzi?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [cartiCatalog, setCartiCatalog] = useState([]);
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Fetch catalogul la prima deschidere (sau mount) pentru a putea corela book_id cu _id ul real
    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/carti');
                setCartiCatalog(response.data);
            } catch (err) {
                console.error("Nu am putut aduce catalogul pentru ChatWidget", err);
            }
        };
        fetchCatalog();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const handleAdaugaInCos = async (carteGasita, quantity = 1) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await axios.post('http://localhost:5000/api/user/cos/adauga', 
                    { carteId: carteGasita._id, cantitate: quantity }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error("Eroare adaugare cos db din chat", error);
            }
        }
        
        // Actualizăm starea globală a coșului
        const existaInCos = cos.find(item => item._id === carteGasita._id);
        if (existaInCos) {
            setCos(cos.map(item => item._id === carteGasita._id ? { ...item, cantitate: item.cantitate + quantity } : item));
        } else {
            setCos([...cos, { ...carteGasita, cantitate: quantity }]);
        }
        toast.success(`"${carteGasita.titlu}" a fost adăugată din Chat!`);
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        setInputValue('');
        
        const newMessages = [...messages, { role: 'user', content: userText }];
        setMessages(newMessages);
        setIsTyping(true);
        abortControllerRef.current = new AbortController();

        try {
            // Trimitem doar ultimele mesaje la backend pentru context
            // Istoricul nu trimite mesajul curent al userului in history, pt ca îl trimite in "message"
            const historyForApi = messages.map(m => ({ role: m.role, content: m.content })).slice(-8);

            const { data } = await axios.post('http://localhost:5000/api/chat', {
                message: userText,
                history: historyForApi
            }, {
                signal: abortControllerRef.current.signal
            });

            if (data.type === "BOOK_RECOMMENDATIONS") {
                // Afișăm intenția AI-ului și transmitem cărțile
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: data.text || data.reply,
                    type: 'recommendation',
                    books: data.payload 
                }]);
            } else if (data.type === "TEXT") {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }

        } catch (error) {
            if (axios.isCancel(error)) {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Generarea răspunsului a fost oprită.' }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Mă scuzi, dar întâmpin dificultăți tehnice. Te rog să încerci mai târziu!" }]);
                console.error(error);
            }
        } finally {
            setIsTyping(false);
            abortControllerRef.current = null;
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-[60]">
            {/* Butonul Plutitor */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-105 ${isOpen ? 'bg-stone-600 scale-95' : 'bg-amber-500 hover:bg-amber-600'}`}
                aria-label="Toggle Chat"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                )}
            </button>

            {/* Fereastra de Chat */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-slate-700 flex flex-col overflow-hidden animate-fade-in-up">
                    
                    {/* Header */}
                    <div className="bg-amber-500 dark:bg-amber-600 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                                B
                            </div>
                            <div>
                                <h3 className="font-bold font-serif leading-tight">Asistent BookIo</h3>
                                <div className="flex items-center gap-1.5 opacity-90 text-[11px] font-medium tracking-wide">
                                    <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                                    Online
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setMessages([{ role: 'assistant', content: 'Bună! Sunt librarul tău virtual BookIo. Cu ce te pot ajuta astăzi?' }])} 
                            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            title="Șterge conversația"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 dark:bg-slate-800/50 scrollbar-hide">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm flex flex-col gap-3 ${
                                    msg.role === 'user' 
                                        ? 'bg-amber-500 text-white rounded-br-none' 
                                        : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border border-stone-100 dark:border-slate-700 rounded-bl-none shadow-sm'
                                }`}>
                                    <div>{msg.content}</div>
                                    
                                    {/* Mini-Carduri Cărți */}
                                    {msg.type === 'recommendation' && msg.books && msg.books.length > 0 && (
                                        <div className="flex flex-col gap-5 mt-2 border-t border-stone-100 dark:border-slate-700 pt-3">
                                            {msg.books.map(book => (
                                                <div key={book._id} className="flex flex-col gap-3">
                                                    {/* Text descriere stil chat */}
                                                    {book.descriere && (
                                                        <div className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                                            {book.descriere}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Cardul propriu-zis (Mini-card) */}
                                                    <div className="flex gap-3 items-center bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl p-2 hover:shadow-md transition-shadow">
                                                        <img src={book.imagine_url || book.imagine} alt={book.titlu} className="w-12 h-16 object-cover rounded shadow-sm" />
                                                        <div className="flex-1 overflow-hidden">
                                                            <h4 className="font-bold text-xs truncate text-stone-800 dark:text-stone-200" title={book.titlu}>{book.titlu}</h4>
                                                            <p className="text-[10px] text-stone-500 truncate" title={book.autor}>{book.autor}</p>
                                                            <p className="font-bold text-amber-600 dark:text-amber-500 text-xs mt-0.5">{book.pret} lei</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleAdaugaInCos(book)}
                                                            className="w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-500 text-amber-600 hover:text-white dark:bg-amber-900/30 dark:hover:bg-amber-500 transition-colors flex items-center justify-center shrink-0 shadow-sm"
                                                            title="Adaugă în coș"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start items-end gap-2">
                                <div className="bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1 h-fit">
                                    <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                                <button 
                                    onClick={() => abortControllerRef.current?.abort()}
                                    className="mb-1 text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 px-2.5 py-1.5 bg-stone-200 hover:bg-red-500 text-stone-600 hover:text-white dark:bg-slate-700 dark:text-stone-300 dark:hover:bg-red-600 rounded-lg transition-colors"
                                >
                                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16"></rect></svg> STOP
                                </button>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-stone-100 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 focus:ring-2 focus:ring-amber-500/50 text-sm text-stone-700 dark:text-stone-200"
                            placeholder="Scrie un mesaj..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputValue.trim() || isTyping}
                            className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center transition-colors shrink-0"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
