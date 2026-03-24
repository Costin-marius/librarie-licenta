import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// IMPORTURI COMPONENTE PRINCIPALE
import Sidebar from '../components/admin/Sidebar';
import TabStatistici from '../components/admin/TabStatistici';
import TabCarti from '../components/admin/TabCarti';
import TabComenzi from '../components/admin/TabComenzi';

import ModalDetaliiComanda from '../components/admin/modals/ModalDetaliiComanda';
import ModalStergereCarte from '../components/admin/modals/ModalStergereCarte';
import ModalFormularCarte from '../components/admin/modals/ModalFormularCarte';
import ModalStergereComanda from '../components/admin/modals/ModalStergereComanda';

function AdminDashboard() {
  // STATE-URI GENERALE
  const [tabCurent, setTabCurent] = useState('dashboard');
  
  // STATE-URI PENTRU CĂRȚI
  const [carti, setCarti] = useState([]);
  const [termenCautare, setTermenCautare] = useState('');
  const [arataModalStergere, setArataModalStergere] = useState(false);
  const [idDeSters, setIdDeSters] = useState(null);
  const [arataModal, setArataModal] = useState(false);
  const [idEditare, setIdEditare] = useState(null);
  const [dateFormular, setDateFormular] = useState({
    isbn: '', titlu: '', autor: '', editura: '', categorie: '', pret: '', pretVechi: '', stoc: '', imagine_url: ''
  });

  // STATE-URI PENTRU COMENZI
  const [comenzi, setComenzi] = useState([]);
  const [arataModalStergereComanda, setArataModalStergereComanda] = useState(false);
  const [idComandaDeSters, setIdComandaDeSters] = useState(null);
  const [arataModalDetalii, setArataModalDetalii] = useState(false);
  const [comandaSelectata, setComandaSelectata] = useState(null);

  // STATE PENTRU GRAFIC
  const [perioadaGrafic, setPerioadaGrafic] = useState(7);

  // FETCH DATE INITIAL
  useEffect(() => {
    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
      window.location.href = '/login';
    } else {
      fetchCarti();
      fetchComenzi();
    }
  }, []);

  const fetchCarti = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/carti');
      setCarti(response.data);
    } catch (error) {
      toast.error("Nu am putut încărca inventarul.");
    }
  };

  const fetchComenzi = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/comenzi');
      setComenzi(response.data);
    } catch (error) {
      toast.error("Nu am putut încărca comenzile.");
    }
  };

  // FUNCȚII GENERALE
  const handleDelogare = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // FUNCȚII CĂRȚI
  const deschideModalAdaugare = () => {
    setIdEditare(null);
    setDateFormular({ isbn: '', titlu: '', autor: '', editura: '', categorie: '', pret: '', pretVechi: '', stoc: '', imagine_url: '' });
    setArataModal(true);
  };

  const deschideModalEditare = (carte) => {
    setIdEditare(carte._id);
    setDateFormular({ ...carte });
    setArataModal(true);
  };

  const inchideModal = () => setArataModal(false);

  const salveazaCarte = async (e) => {
    e.preventDefault();
    try {
      if (idEditare) {
        await axios.put(`http://localhost:5000/api/carti/${idEditare}`, dateFormular);
        toast.success('Cartea a fost actualizată!');
      } else {
        await axios.post('http://localhost:5000/api/carti', dateFormular);
        toast.success('Cartea a fost adăugată în inventar!');
      }
      inchideModal();
      fetchCarti();
    } catch (error) {
      toast.error('Eroare la salvare!');
    }
  };

  const cereConfirmareStergere = (id) => {
    setIdDeSters(id);
    setArataModalStergere(true);
  };

  const confirmaStergerea = async () => {
    if (!idDeSters) return;
    try {
      await axios.delete(`http://localhost:5000/api/carti/${idDeSters}`);
      toast.success("Înregistrarea a fost ștearsă.");
      fetchCarti();
    } catch (error) {
      toast.error("Eroare la ștergere!");
    } finally {
      setArataModalStergere(false);
      setIdDeSters(null);
    }
  };

  const normalizareText = (text) => text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  const cartiFiltrate = carti.filter(carte =>
    normalizareText(`${carte.titlu} ${carte.autor} ${carte.isbn}`).includes(normalizareText(termenCautare))
  );

  // FUNCȚII COMENZI
  const schimbaStatusComanda = async (id, statusNou) => {
    try {
      await axios.patch(`http://localhost:5000/api/comenzi/${id}/status`, { stare: statusNou });
      toast.success(`Status schimbat în: ${statusNou}`);
      fetchComenzi();
    } catch (error) {
      toast.error("Eroare la actualizarea statusului!");
    }
  };

  const deschideDetalii = (comanda) => {
    setComandaSelectata(comanda);
    setArataModalDetalii(true);
  };

  const confirmaStergereaComanda = async () => {
    if (!idComandaDeSters) return;
    try {
      await axios.delete(`http://localhost:5000/api/comenzi/${idComandaDeSters}`);
      toast.success("Comanda a fost ștearsă.");
      fetchComenzi();
    } catch (error) {
      toast.error("Eroare la ștergere!");
    } finally {
      setArataModalStergereComanda(false);
      setIdComandaDeSters(null);
    }
  };

  // CALCUL STATISTICI PENTRU CARDURI
  const totalCartiInStoc = carti.reduce((acc, carte) => acc + Number(carte.stoc || 0), 0);
  const totalComenziIstoric = comenzi.length;
  const incasariTotale = comenzi
    .filter(c => c.stare !== 'Anulată')
    .reduce((acc, comanda) => acc + Number(comanda.total || 0), 0)
    .toFixed(2);

  // GENERARE DATE GRAFIC DINAMIC
  const genereazaDateGrafic = () => {
    const dateGrafic = [];
    const azi = new Date();
    
    for (let i = perioadaGrafic - 1; i >= 0; i--) {
      const dataCurenta = new Date(azi);
      dataCurenta.setDate(azi.getDate() - i);
      
      const formatData = perioadaGrafic > 30 
        ? dataCurenta.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' }) 
        : dataCurenta.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' });

      const comenziInZi = comenzi.filter(c => {
        if (!c.createdAt || c.stare === 'Anulată') return false;
        const dataComanda = new Date(c.createdAt);
        if (perioadaGrafic > 30) {
          return dataComanda.getMonth() === dataCurenta.getMonth() && dataComanda.getFullYear() === dataCurenta.getFullYear();
        } else {
          return dataComanda.getDate() === dataCurenta.getDate() && dataComanda.getMonth() === dataCurenta.getMonth();
        }
      });

      const incasariZi = comenziInZi.reduce((sum, c) => sum + Number(c.total || 0), 0);

      if (perioadaGrafic > 30) {
        const existDeja = dateGrafic.find(d => d.data === formatData);
        if (existDeja) {
          existDeja.incasari += incasariZi;
          existDeja.comenzi += comenziInZi.length;
        } else {
          dateGrafic.push({ data: formatData, incasari: incasariZi, comenzi: comenziInZi.length });
        }
      } else {
        dateGrafic.push({ data: formatData, incasari: Number(incasariZi.toFixed(2)), comenzi: comenziInZi.length });
      }
    }
    return dateGrafic;
  };

  const dateGraficGenerate = genereazaDateGrafic();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-200 font-sans overflow-hidden transition-colors duration-300">
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />

      <Sidebar tabCurent={tabCurent} setTabCurent={setTabCurent} handleDelogare={handleDelogare} />

      <main className="flex-1 flex flex-col overflow-hidden relative z-0 w-full">
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 transition-colors duration-300">
          {tabCurent === 'carti' ? (
            <>
              <div className="relative w-96">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">🔍</span>
                <input
                  type="text"
                  placeholder="Caută în inventar..."
                  value={termenCautare}
                  onChange={(e) => setTermenCautare(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
                />
              </div>
              <button onClick={deschideModalAdaugare} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20">
                ➕ Adaugă Carte
              </button>
            </>
          ) : tabCurent === 'comenzi' ? (
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Gestionare Comenzi</h2>
          ) : (
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Privire de ansamblu</h2>
          )}
        </header>

        <div className="flex-1 overflow-auto p-8">
          {tabCurent === 'dashboard' && <TabStatistici totalCartiInStoc={totalCartiInStoc} totalComenziIstoric={totalComenziIstoric} incasariTotale={incasariTotale} perioadaGrafic={perioadaGrafic} setPerioadaGrafic={setPerioadaGrafic} dateGraficGenerate={dateGraficGenerate} />}
          {tabCurent === 'carti' && <TabCarti cartiFiltrate={cartiFiltrate} deschideModalEditare={deschideModalEditare} cereConfirmareStergere={cereConfirmareStergere} />}
          {tabCurent === 'comenzi' && <TabComenzi comenzi={comenzi} schimbaStatusComanda={schimbaStatusComanda} deschideDetalii={deschideDetalii} setIdComandaDeSters={setIdComandaDeSters} setArataModalStergereComanda={setArataModalStergereComanda} />}
        </div>
      </main>

      {/* RENDERIZARE MODALE */}
      {arataModalDetalii && comandaSelectata && <ModalDetaliiComanda comandaSelectata={comandaSelectata} setArataModalDetalii={setArataModalDetalii} />}
      {arataModalStergere && <ModalStergereCarte setArataModalStergere={setArataModalStergere} confirmaStergerea={confirmaStergerea} />}
      {arataModal && <ModalFormularCarte idEditare={idEditare} inchideModal={inchideModal} salveazaCarte={salveazaCarte} dateFormular={dateFormular} setDateFormular={setDateFormular} />}
      {arataModalStergereComanda && <ModalStergereComanda setArataModalStergereComanda={setArataModalStergereComanda} confirmaStergereaComanda={confirmaStergereaComanda} />}
    </div>
  );
}

export default AdminDashboard;