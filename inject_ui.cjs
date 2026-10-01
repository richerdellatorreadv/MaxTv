const fs = require('fs');
const file = 'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /(<section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">\s*<div className="bg-slate-800\/50 p-4.*?)(\s*<section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-6 flex gap-6">)/s;

const match = content.match(regex);
if (match) {
  const [fullMatch, mainAndAdsSections, clockSection] = match;
  
  const radioUI = `
            {displayMode === 'alternate' ? (
              <>
${mainAndAdsSections}
              </>
            ) : (
              <>
                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl ring-2 ring-purple-500/30">
                  <div className="bg-purple-900/20 p-4 border-b border-purple-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-purple-400"><Music className="text-purple-400"/> Trilha Sonora (Fundo Musical)</h3>
                    <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-700 w-full md:w-auto">
                      <button onClick={() => appendToPlaylist('audio', { mediaType: 'youtube', content: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 justify-center"><Youtube size={16} className="text-red-500"/> Add Música</button>
                      <button onClick={() => appendToPlaylist('audio', { mediaType: 'youtube_playlist', content: '' })} className="flex-1 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 justify-center"><ListVideo size={16} className="text-red-500"/> Add Playlist</button>
                    </div>
                  </div>
                  <div className="p-4">
                    {audioPlaylist.length === 0 ? (
                      <div className="text-center text-slate-500 py-8 font-bold border-2 border-dashed border-slate-800 rounded-2xl">
                         Adicione vídeos de música (o som tocará no fundo)
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {audioPlaylist.map((item, idx) => (
                          <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, idx, "audio")} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, idx, "audio")} className={\`flex items-center gap-3 bg-slate-950 border p-2 rounded-xl group transition cursor-move \${draggedItemIndex === idx && draggedListType === "audio" ? "opacity-50 scale-95 border-purple-500" : "border-slate-800 hover:border-purple-500"}\`}>
                            <span className="text-slate-600 font-mono font-bold w-6 text-center">{idx + 1}</span>
                            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                              <Youtube size={24} className="text-red-500" />
                            </div>
                            <div className="flex-1">
                               <input type="text" value={item.content} onChange={(e) => {
                                 const val = e.target.value;
                                 setAudioPlaylist(prev => prev.map(i => i.id === item.id ? { ...i, content: val } : i));
                               }} placeholder={item.mediaType === 'youtube' ? "ID do Vídeo YouTube" : "ID da Playlist YouTube"} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 w-full outline-none focus:border-purple-500 text-sm font-mono transition" />
                            </div>
                            <div className="flex-1"><p className="text-sm font-bold text-slate-200">{item.mediaType === 'youtube' ? 'YouTube' : 'YT Playlist'}</p></div>
                            <button onClick={() => deleteFromPlaylist('audio', item.id)} className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition"><Trash2 size={18} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl ring-2 ring-blue-500/30">
                  <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-blue-400"><MonitorPlay className="text-blue-400"/> Programação Visual Contínua</h3>
                    <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-700 w-full md:w-auto">
                      <button onClick={() => appendToPlaylist('signage', { mediaType: 'image', content: '' })} className="flex-1 hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 justify-center"><Image size={16} className="text-blue-400"/> Imagem</button>
                      <button onClick={() => appendToPlaylist('signage', { mediaType: 'video', content: '' })} className="flex-1 hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 justify-center"><Video size={16} className="text-blue-400"/> Vídeo</button>
                      <button onClick={() => appendToPlaylist('signage', { mediaType: 'text', content: '' })} className="flex-1 hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 justify-center"><Type size={16} className="text-blue-400"/> Texto</button>
                    </div>
                  </div>
                  <div className="p-4">
                    {signagePlaylist.length === 0 ? (
                      <div className="text-center text-slate-500 py-8 font-bold border-2 border-dashed border-slate-800 rounded-2xl">
                        Adicione imagens, vídeos e letreiros que rodarão na tela
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {signagePlaylist.map((item, idx) => (
                          <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, idx, "signage")} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, idx, "signage")} className={\`flex items-center gap-3 bg-slate-950 border p-2 rounded-xl group transition cursor-move \${draggedItemIndex === idx && draggedListType === "signage" ? "opacity-50 scale-95 border-blue-500" : "border-slate-800 hover:border-blue-500"}\`}>
                            <span className="text-slate-600 font-mono font-bold w-6 text-center">{idx + 1}</span>
                            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.mediaType === 'image' && <img src={item.content} className="w-full h-full object-cover" />}
                              {item.mediaType === 'video' && <video src={item.content} className="w-full h-full object-cover" />}
                              {item.mediaType === 'text' && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 text-[10px] font-bold p-1 text-center leading-tight truncate">{item.content}</div>}
                            </div>
                            <div className="flex-1">
                              <input type="text" value={item.content} onChange={(e) => {
                                const val = e.target.value;
                                setSignagePlaylist(prev => prev.map(i => i.id === item.id ? { ...i, content: val } : i));
                              }} placeholder={item.mediaType === 'text' ? "Digite o texto..." : "Cole a URL da Mídia..."} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 w-full outline-none focus:border-blue-500 text-sm font-mono transition" />
                            </div>
                            <div className="flex-1"><p className="text-sm font-bold text-slate-200">{item.mediaType === 'text' ? 'Texto' : 'Mídia Visual'}</p></div>
                            {item.mediaType !== 'video' && (
                              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                                <Clock size={14} className="text-slate-500" />
                                <input type="number" min="1" value={item.durationSeconds} onChange={(e) => updateDuration('signage', item.id, e.target.value)} className="bg-transparent text-white font-mono w-10 outline-none text-right" />
                                <span className="text-xs text-slate-500 font-bold">SEG</span>
                              </div>
                            )}
                            <button onClick={() => deleteFromPlaylist('signage', item.id)} className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition"><Trash2 size={18} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
`;
  
  content = content.replace(regex, radioUI + clockSection);
  fs.writeFileSync(file, content, 'utf8');
  console.log('UI injected!');
} else {
  console.log('Regex match failed!');
}
