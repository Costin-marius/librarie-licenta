import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function TabStatistici({ 
  totalCartiInStoc, 
  totalComenziIstoric, 
  incasariTotale, 
  perioadaGrafic, 
  setPerioadaGrafic, 
  dateGraficGenerate 
}) {

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sumaCurata = Number(payload[0].value).toFixed(2);
      return (
        <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-2xl z-50 relative">
          <p className="text-gray-300 text-sm font-bold mb-2">{label}</p>
          <p className="text-blue-400 font-black text-xl">{sumaCurata} RON</p>
          <p className="text-gray-400 text-sm mt-1">{payload[0].payload.comenzi} comenzi valide</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* CARDURI STATISTICI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">📦</div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total cărți în stoc</p>
            <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{totalCartiInStoc} buc.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">🛒</div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Comenzi totale</p>
            <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{totalComenziIstoric}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">💰</div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Încasări brute (include transport)</p>
            <p className="text-2xl font-black text-green-600 dark:text-green-400">{incasariTotale} RON</p>
          </div>
        </div>
      </div>

      {/* GRAFIC CU SELECT */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-xl transition-colors duration-300 w-full">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-black text-gray-800 dark:text-gray-200">Evoluție Vânzări</h3>
            <p className="text-sm text-gray-500">Încasări totale confirmate</p>
          </div>
          <select 
            value={perioadaGrafic} 
            onChange={(e) => setPerioadaGrafic(Number(e.target.value))}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg py-2 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
          >
            <option value={7}>Ultimele 7 zile</option>
            <option value={30}>Ultimele 30 zile</option>
            <option value={365}>Ultimul an (pe luni)</option>
          </select>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dateGraficGenerate} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncasari" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
              <XAxis dataKey="data" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#e5e7eb" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} lei`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="incasari" stroke="#3b82f6" strokeWidth={4} activeDot={{ r: 8 }} fillOpacity={1} fill="url(#colorIncasari)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default TabStatistici;