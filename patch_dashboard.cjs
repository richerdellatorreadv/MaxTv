const fs = require('fs');
const path = 'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx';
let c = fs.readFileSync(path, 'utf8');

// 1. Add radioVisualPlaylist state after audioPlaylist state
c = c.replace(
  "  const [audioPlaylist, setAudioPlaylist] = useState([]);",
  "  const [audioPlaylist, setAudioPlaylist] = useState([]);\n  const [radioVisualPlaylist, setRadioVisualPlaylist] = useState([]);"
);

// 2. Load radioVisualPlaylist from Firebase in openTvManager
c = c.replace(
  "      setAudioPlaylist(d.audioPlaylist || []);",
  "      setAudioPlaylist(d.audioPlaylist || []);\n      setRadioVisualPlaylist(d.radioPlaylist || []);"
);

// 3. Reset radioVisualPlaylist on empty TV
c = c.replace(
  "      setSignagePlaylist([]); setAudioPlaylist([]); setDisplayMode('alternate');",
  "      setSignagePlaylist([]); setAudioPlaylist([]); setRadioVisualPlaylist([]); setDisplayMode('alternate');"
);

// 4. Save radioVisualPlaylist to Firebase (save as radioPlaylist key)
c = c.replace(
  "        status: 'online', playlist: signagePlaylist, audioPlaylist,",
  "        status: 'online', playlist: signagePlaylist, audioPlaylist, radioPlaylist: radioVisualPlaylist,"
);

// 5. Update handleDrop to handle 'radioVisual' list type
c = c.replace(
  "    const setterMap = { signage: setSignagePlaylist, audio: setAudioPlaylist, ads: setAdsPlaylist };",
  "    const setterMap = { signage: setSignagePlaylist, audio: setAudioPlaylist, ads: setAdsPlaylist, radioVisual: setRadioVisualPlaylist };"
);
c = c.replace(
  "    const listMap = { signage: signagePlaylist, audio: audioPlaylist, ads: adsPlaylist };",
  "    const listMap = { signage: signagePlaylist, audio: audioPlaylist, ads: adsPlaylist, radioVisual: radioVisualPlaylist };"
);

// 6. Update appendToPlaylist to handle radioVisual
c = c.replace(
  "    if (listType === 'signage') setSignagePlaylist(p => [...p, item]);\n    else if (listType === 'audio') setAudioPlaylist(p => [...p, item]);\n    else setAdsPlaylist(p => [...p, item]);",
  "    if (listType === 'signage') setSignagePlaylist(p => [...p, item]);\n    else if (listType === 'audio') setAudioPlaylist(p => [...p, item]);\n    else if (listType === 'radioVisual') setRadioVisualPlaylist(p => [...p, item]);\n    else setAdsPlaylist(p => [...p, item]);"
);

// 7. Update removeFromList to handle radioVisual
c = c.replace(
  "    if (listType === 'signage') setSignagePlaylist(p => p.filter(i => i.id !== id));\n    else if (listType === 'audio') setAudioPlaylist(p => p.filter(i => i.id !== id));\n    else setAdsPlaylist(p => p.filter(i => i.id !== id));",
  "    if (listType === 'signage') setSignagePlaylist(p => p.filter(i => i.id !== id));\n    else if (listType === 'audio') setAudioPlaylist(p => p.filter(i => i.id !== id));\n    else if (listType === 'radioVisual') setRadioVisualPlaylist(p => p.filter(i => i.id !== id));\n    else setAdsPlaylist(p => p.filter(i => i.id !== id));"
);

// 8. Update updateDuration to handle radioVisual
c = c.replace(
  "    if (listType === 'signage') setSignagePlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));\n    else if (listType === 'audio') setAudioPlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));\n    else setAdsPlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));",
  "    if (listType === 'signage') setSignagePlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));\n    else if (listType === 'audio') setAudioPlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));\n    else if (listType === 'radioVisual') setRadioVisualPlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));\n    else setAdsPlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));"
);

// 9. Update updateContent to handle radioVisual
c = c.replace(
  "    if (listType === 'signage') setSignagePlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));\n    else if (listType === 'audio') setAudioPlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));\n    else setAdsPlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));",
  "    if (listType === 'signage') setSignagePlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));\n    else if (listType === 'audio') setAudioPlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));\n    else if (listType === 'radioVisual') setRadioVisualPlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));\n    else setAdsPlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));"
);

// 10. Replace radio visual section to use radioVisualPlaylist instead of signagePlaylist
// Fix: the radio mode visual list was using signagePlaylist. Replace specific section.
c = c.replace(
  `                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl ring-2 ring-blue-500/30">
                  <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2 text-blue-300"><MonitorPlay size={20} /> Programacao Visual (Vitrines)</h3>
                      <p className="text-sm text-slate-400 mt-0.5">Imagens e videos em loop continuo na tela da TV</p>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700 gap-1">
                      <button onClick={() => appendToPlaylist('signage', { mediaType: 'image', content: '' })} className="hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><ImageIcon size={14} className="text-blue-400" />Imagem</button>
                      <button onClick={() => appendToPlaylist('signage', { mediaType: 'video', content: '' })} className="hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Video size={14} className="text-blue-400" />Video</button>
                      <button onClick={() => appendToPlaylist('signage', { mediaType: 'text', content: '' })} className="hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Type size={14} className="text-blue-400" />Texto</button>
                    </div>
                  </div>
                  <div className="p-4">
                    {signagePlaylist.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
                        <ImageIcon size={32} className="mx-auto mb-3 text-blue-900" />
                        <p className="text-slate-400 font-bold">Nenhuma vitrine adicionada.</p>
                        <p className="text-slate-500 text-sm mt-1">Adicione imagens e videos que aparecerao enquanto a musica toca.</p>
                      </div>
                    ) : (
                      <div className="grid gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">{signagePlaylist.map((item, idx) => <ItemRow key={item.id} item={item} idx={idx} listType="signage" accent="blue" />)}</div>
                    )}
                  </div>
                </section>`,
  `                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl ring-2 ring-blue-500/30">
                  <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2 text-blue-300"><MonitorPlay size={20} /> Programacao Visual (Vitrines)</h3>
                      <p className="text-sm text-slate-400 mt-0.5">Imagens e videos em loop continuo na tela da TV</p>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700 gap-1">
                      <button onClick={() => appendToPlaylist('radioVisual', { mediaType: 'image', content: '' })} className="hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><ImageIcon size={14} className="text-blue-400" />Imagem</button>
                      <button onClick={() => appendToPlaylist('radioVisual', { mediaType: 'video', content: '' })} className="hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Video size={14} className="text-blue-400" />Video</button>
                      <button onClick={() => appendToPlaylist('radioVisual', { mediaType: 'text', content: '' })} className="hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Type size={14} className="text-blue-400" />Texto</button>
                      {radioVisualPlaylist.length > 0 && <button onClick={() => { if(window.confirm('Apagar tudo das Vitrines?')) setRadioVisualPlaylist([]); }} className="hover:bg-slate-800 text-red-400 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Trash2 size={14} />Limpar</button>}
                    </div>
                  </div>
                  <div className="p-4">
                    {radioVisualPlaylist.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
                        <ImageIcon size={32} className="mx-auto mb-3 text-blue-900" />
                        <p className="text-slate-400 font-bold">Nenhuma vitrine adicionada.</p>
                        <p className="text-slate-500 text-sm mt-1">Adicione imagens e videos que aparecerao enquanto a musica toca.</p>
                      </div>
                    ) : (
                      <div className="grid gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">{radioVisualPlaylist.map((item, idx) => <ItemRow key={item.id} item={item} idx={idx} listType="radioVisual" accent="blue" />)}</div>
                    )}
                  </div>
                </section>`
);

// 11. Add "Clear All" buttons to signagePlaylist section header (alternate mode)
c = c.replace(
  `                    <div className="flex items-center gap-2 w-full md:max-w-xl bg-slate-950 p-1.5 rounded-xl border border-slate-700 focus-within:border-red-500 transition">
                      <div className="bg-red-500/20 p-1.5 rounded-lg"><MonitorPlay size={16} className="text-red-500" /></div>
                      <input type="text" placeholder="Link do clipe ou playlist YouTube..." value={youtubeInput} onChange={e => setYoutubeInput(e.target.value)} className="bg-transparent text-white text-sm outline-none w-full" />
                      <button onClick={handleAddYoutube} disabled={!youtubeInput || isExtractingYt} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50">
                        {isExtractingYt ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
                      </button>
                    </div>`,
  `                    <div className="flex gap-2 items-center w-full md:max-w-2xl">
                      {signagePlaylist.length > 0 && <button onClick={() => { if(window.confirm('Apagar tudo da Programacao Principal?')) setSignagePlaylist([]); }} className="bg-red-900/40 hover:bg-red-900/70 text-red-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap"><Trash2 size={14} />Limpar Tudo</button>}
                      <div className="flex items-center gap-2 flex-1 bg-slate-950 p-1.5 rounded-xl border border-slate-700 focus-within:border-red-500 transition">
                        <div className="bg-red-500/20 p-1.5 rounded-lg"><MonitorPlay size={16} className="text-red-500" /></div>
                        <input type="text" placeholder="Link do clipe ou playlist YouTube..." value={youtubeInput} onChange={e => setYoutubeInput(e.target.value)} className="bg-transparent text-white text-sm outline-none w-full" />
                        <button onClick={handleAddYoutube} disabled={!youtubeInput || isExtractingYt} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50">
                          {isExtractingYt ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
                        </button>
                      </div>
                    </div>`
);

// 12. Add "Clear All" to Ads section header
c = c.replace(
  `                      <div className="flex gap-2 mb-4">
                        <button onClick={() => appendToPlaylist('ads', { mediaType: 'image', content: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 justify-center"><ImageIcon size={14} className="text-yellow-400" />Imagem</button>
                        <button onClick={() => appendToPlaylist('ads', { mediaType: 'video', content: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 justify-center"><Video size={14} className="text-yellow-400" />Video</button>
                        <button onClick={() => appendToPlaylist('ads', { mediaType: 'text', content: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 justify-center"><Type size={14} className="text-yellow-400" />Texto</button>
                      </div>`,
  `                      <div className="flex gap-2 mb-4">
                        <button onClick={() => appendToPlaylist('ads', { mediaType: 'image', content: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 justify-center"><ImageIcon size={14} className="text-yellow-400" />Imagem</button>
                        <button onClick={() => appendToPlaylist('ads', { mediaType: 'video', content: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 justify-center"><Video size={14} className="text-yellow-400" />Video</button>
                        <button onClick={() => appendToPlaylist('ads', { mediaType: 'text', content: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 justify-center"><Type size={14} className="text-yellow-400" />Texto</button>
                        {adsPlaylist.length > 0 && <button onClick={() => { if(window.confirm('Apagar todos os anuncios?')) setAdsPlaylist([]); }} className="bg-red-900/40 hover:bg-red-900/70 text-red-400 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Trash2 size={14} />Limpar</button>}
                      </div>`
);

// 13. Add "Clear All" to audio section
c = c.replace(
  `                      <button onClick={() => appendToPlaylist('audio', { mediaType: 'youtube', content: '' })} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Play size={14} className="text-red-500" /> Video YT</button>
                      <button onClick={() => appendToPlaylist('audio', { mediaType: 'youtube_playlist', content: '' })} className="hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><MonitorPlay size={14} className="text-red-500" /> Playlist YT</button>`,
  `                      <button onClick={() => appendToPlaylist('audio', { mediaType: 'youtube', content: '' })} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Play size={14} className="text-red-500" /> Video YT</button>
                      <button onClick={() => appendToPlaylist('audio', { mediaType: 'youtube_playlist', content: '' })} className="hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><MonitorPlay size={14} className="text-red-500" /> Playlist YT</button>
                      {audioPlaylist.length > 0 && <button onClick={() => { if(window.confirm('Apagar toda a trilha sonora?')) setAudioPlaylist([]); }} className="hover:bg-slate-800 text-red-400 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Trash2 size={14} />Limpar</button>}`
);

// 14. Also add button from library that goes to radioVisual when in radio mode
c = c.replace(
  `                        <button onClick={() => appendToPlaylist('signage', item)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-2 rounded-lg">+ PROGRAMACAO</button>
                        {displayMode === 'alternate' && <button onClick={() => appendToPlaylist('ads', item)} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-black py-2 rounded-lg">+ ANUNCIO</button>}`,
  `                        {displayMode === 'alternate' && <button onClick={() => appendToPlaylist('signage', item)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-2 rounded-lg">+ PROGRAMACAO</button>}
                        {displayMode === 'radio' && <button onClick={() => appendToPlaylist('radioVisual', item)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-2 rounded-lg">+ VITRINE</button>}
                        {displayMode === 'radio' && <button onClick={() => appendToPlaylist('audio', item)} className="w-full bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black py-2 rounded-lg">+ MUSICA</button>}
                        {displayMode === 'alternate' && <button onClick={() => appendToPlaylist('ads', item)} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-black py-2 rounded-lg">+ ANUNCIO</button>}`
);

fs.writeFileSync(path, c, 'utf8');
console.log('Done!');
