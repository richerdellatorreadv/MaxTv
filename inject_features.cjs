const fs = require('fs');
const file = 'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add States
content = content.replace(
  "const [configTicker, setConfigTicker] = useState('');",
  "const [configTicker, setConfigTicker] = useState('');\n  const [configNewsTicker, setConfigNewsTicker] = useState(false);\n  const [displayMode, setDisplayMode] = useState('alternate');\n  const [draggedItemIndex, setDraggedItemIndex] = useState(null);\n  const [draggedListType, setDraggedListType] = useState(null);"
);

// 2. Read from DB
content = content.replace(
  "setConfigTicker(data.config?.tickerText || '');",
  "setConfigTicker(data.config?.tickerText || '');\n      setConfigNewsTicker(data.config?.newsTicker || false);\n      setDisplayMode(data.config?.displayMode || 'alternate');"
);

// 3. Clear on logout
content = content.replace(
  "setConfigClock(false); setConfigTicker('');",
  "setConfigClock(false); setConfigTicker(''); setConfigNewsTicker(false); setDisplayMode('alternate');"
);

// 4. Save to DB
content = content.replace(
  "tickerText: configTicker,",
  "tickerText: configTicker,\n          newsTicker: configNewsTicker,\n          displayMode: displayMode,"
);

// 5. Drag Handlers
const dragHandlers = `
  const handleDragStart = (e, index, listType) => {
    setDraggedItemIndex(index);
    setDraggedListType(listType);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetIndex, listType) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedListType !== listType) return;
    if (listType === 'signage') {
      const newItems = [...signagePlaylist];
      const [draggedItem] = newItems.splice(draggedItemIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      setSignagePlaylist(newItems);
    } else {
      const newItems = [...adsPlaylist];
      const [draggedItem] = newItems.splice(draggedItemIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      setAdsPlaylist(newItems);
    }
    setDraggedItemIndex(null);
    setDraggedListType(null);
  };
`;
content = content.replace(
  "const appendToPlaylist = (listType, media) => {",
  dragHandlers + "\n  const appendToPlaylist = (listType, media) => {"
);

// 6. UI Toggle for DisplayMode
const displayModeUI = `
            <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-lg mt-4 mb-4">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="bg-slate-800 p-3 rounded-lg"><MonitorPlay className="text-blue-500" size={24}/></div>
                <div>
                  <h3 className="font-bold text-white">Modo de Exibição</h3>
                  <p className="text-sm text-slate-400">Como a TV se comporta com vídeos e imagens</p>
                </div>
              </div>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700">
                <button onClick={() => setDisplayMode('alternate')} className={\`px-6 py-2 rounded-lg font-bold text-sm transition \${displayMode === 'alternate' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}\`}>Alternado (Tela Cheia)</button>
                <button onClick={() => setDisplayMode('radio')} className={\`px-6 py-2 rounded-lg font-bold text-sm transition \${displayMode === 'radio' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}\`}>Modo Rádio (Vídeos ocultos)</button>
              </div>
            </div>
`;
content = content.replace(
  '<section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">',
  displayModeUI + '\n            <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">'
);

// 7. UI Toggle for News Ticker
const newsTickerUI = `
                <div className="flex items-center justify-between bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-lg mt-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-800 p-3 rounded-lg"><Newspaper className="text-blue-500" size={24}/></div>
                    <div>
                      <h3 className="font-bold text-white">Letreiro de Notícias G1 (Rodapé)</h3>
                      <p className="text-sm text-slate-400">Exibe as últimas manchetes passando no rodapé da TV</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={configNewsTicker} onChange={(e) => setConfigNewsTicker(e.target.checked)} className="sr-only peer" />
                    <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
`;
content = content.replace(
  '<div className="flex items-center justify-between bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-lg mt-4">\n                  <div className="flex items-center gap-4">\n                    <div className="bg-slate-800 p-3 rounded-lg"><Type className="text-blue-500"',
  newsTickerUI + '\n                <div className="flex items-center justify-between bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-lg mt-4">\n                  <div className="flex items-center gap-4">\n                    <div className="bg-slate-800 p-3 rounded-lg"><Type className="text-blue-500"'
);

// 8. Signage Drag UI
content = content.replace(
  '<div key={item.id} className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 rounded-xl group hover:border-blue-500 transition">',
  '<div key={item.id} draggable onDragStart={(e) => handleDragStart(e, idx, "signage")} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, idx, "signage")} className={\`flex items-center gap-3 bg-slate-950 border p-2 rounded-xl group transition cursor-move \${draggedItemIndex === idx && draggedListType === "signage" ? "opacity-50 scale-95 border-blue-500" : "border-slate-800 hover:border-blue-500"}\`}>'
);

// 9. Ads Drag UI
content = content.replace(
  '<div key={item.id} className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 rounded-xl group hover:border-yellow-500 transition">',
  '<div key={item.id} draggable onDragStart={(e) => handleDragStart(e, idx, "ads")} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, idx, "ads")} className={\`flex items-center gap-3 bg-slate-950 border p-2 rounded-xl group transition cursor-move \${draggedItemIndex === idx && draggedListType === "ads" ? "opacity-50 scale-95 border-yellow-500" : "border-slate-800 hover:border-yellow-500"}\`}>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Features injected back into Dashboard!');
