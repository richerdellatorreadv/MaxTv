const fs = require('fs');
const path = 'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add drag and drop states
content = content.replace(
  "const [signagePlaylist, setSignagePlaylist] = useState([]);",
  "const [signagePlaylist, setSignagePlaylist] = useState([]);\n  const [draggedItemIndex, setDraggedItemIndex] = useState(null);\n  const [draggedListType, setDraggedListType] = useState(null);\n"
);

// 2. Add DisplayMode state
content = content.replace(
  "const [configTicker, setConfigTicker] = useState('');",
  "const [configTicker, setConfigTicker] = useState('');\n  const [displayMode, setDisplayMode] = useState('alternate');"
);

// 3. Update openTvManager to load displayMode
content = content.replace(
  "setConfigTicker(data.config?.tickerText || '');",
  "setConfigTicker(data.config?.tickerText || '');\n      setDisplayMode(data.config?.displayMode || 'alternate');"
);
content = content.replace(
  "setConfigClock(false); setConfigTicker('');",
  "setConfigClock(false); setConfigTicker(''); setDisplayMode('alternate');"
);

// 4. Update saveWorkspace to save displayMode
content = content.replace(
  "tickerText: configTicker,",
  "tickerText: configTicker,\n          displayMode: displayMode,"
);

// 5. Add Drag Handlers
const dragHandlers = 
  const handleDragStart = (e, index, listType) => {
    setDraggedItemIndex(index);
    setDraggedListType(listType);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image
    const crt = document.createElement('div');
    crt.style.visibility = 'hidden';
    document.body.appendChild(crt);
    e.dataTransfer.setDragImage(crt, 0, 0);
    setTimeout(() => document.body.removeChild(crt), 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

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
;
content = content.replace(
  "const handleAddNews = () => {",
  dragHandlers + "\n  const handleAddNews = (targetList = 'signage') => {\n"
);

// 6. Update handleAddNews to push to correct list
content = content.replace(
  "setSignagePlaylist(prev => [...prev, {",
  "const payload = {\n         id: Date.now().toString() + Math.random().toString(36).substr(2, 5),\n         mediaType: 'news',\n         content: 'g1',\n         durationSeconds: 15,\n         title: 'Plantão G1 (Dinâmico)'\n      };\n      if(targetList === 'signage') setSignagePlaylist(prev => [...prev, payload]);\n      else setAdsPlaylist(prev => [...prev, payload]);\n// "
);

// 7. Inject DisplayMode Toggle in the Header
const toggleHtml = 
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-lg mt-4">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-800 p-3 rounded-lg"><MonitorPlay className="text-blue-500" size={24}/></div>
                  <div>
                    <h3 className="font-bold text-white">Modo de Exibição</h3>
                    <p className="text-sm text-slate-400">Como a TV se comporta com vídeos e imagens</p>
                  </div>
                </div>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700">
                  <button onClick={() => setDisplayMode('alternate')} className={\px-6 py-2 rounded-lg font-bold text-sm transition \\}>Alternado (Tela Cheia)</button>
                  <button onClick={() => setDisplayMode('radio')} className={\px-6 py-2 rounded-lg font-bold text-sm transition \\}>Modo Rádio (Vídeos ocultos)</button>
                </div>
              </div>
;
content = content.replace(
  "</div>\n\n            <section className=\"bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl\">",
  "</div>\n" + toggleHtml + "\n            <section className=\"bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl\">"
);

// 8. Inject Draggable properties into Signage list
content = content.replace(
  /<div key=\{item.id\} className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between hover:bg-slate-900 transition">/g,
  '<div key={item.id} draggable onDragStart={(e) => handleDragStart(e, index, "signage")} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index, "signage")} className={g-slate-950 p-4 border-b border-slate-800 flex items-center justify-between hover:bg-slate-900 transition cursor-move }>'
);

// 9. Inject Draggable properties into Ads list
content = content.replace(
  /<div key=\{item.id\} className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">/g,
  '<div key={item.id} draggable onDragStart={(e) => handleDragStart(e, index, "ads")} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index, "ads")} className={g-slate-900 p-4 border-b border-slate-800 flex items-center justify-between hover:bg-slate-800 transition cursor-move }>'
);

// 10. Add Add News button to Ads section
content = content.replace(
  /<h4 className="font-bold text-white mb-4">Fila de Patrocinadores<\/h4>/g,
  '<div className="flex justify-between items-center mb-4"><h4 className="font-bold text-white">Fila de Patrocinadores</h4> <button onClick={() => handleAddNews("ads")} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1.5 rounded-lg border border-slate-700 font-bold transition flex items-center gap-1"><Newspaper size={14}/> Add Notícia G1</button></div>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Dashboard patched successfully');
