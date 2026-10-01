import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { ref as dbRef, set, get, onValue, push, remove } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { Tv, Music, Image as ImageIcon, Type, LogOut, Upload, Loader2, Video, Play, Trash2, Clock, FolderHeart, LayoutDashboard, Settings, MonitorPlay, Presentation, Megaphone, Save, ArrowLeft, Key, Newspaper } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('tvs');
  const [user, setUser] = useState(null);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const radioVisualFileInputRef = useRef(null);
  const [textInput, setTextInput] = useState('');
  const [myTvs, setMyTvs] = useState([]);
  const [newTvCode, setNewTvCode] = useState('');
  const [newTvName, setNewTvName] = useState('');
  const [selectedTv, setSelectedTv] = useState(null);
  const [youtubeInput, setYoutubeInput] = useState('');
  const [isExtractingYt, setIsExtractingYt] = useState(false);
  const [audioYoutubeInput, setAudioYoutubeInput] = useState('');
  const [isExtractingAudioYt, setIsExtractingAudioYt] = useState(false);
  const [signagePlaylist, setSignagePlaylist] = useState([]);
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [adsTimeEnabled, setAdsTimeEnabled] = useState(true);
  const [adsBetweenVideosEnabled, setAdsBetweenVideosEnabled] = useState(false);
  const [adsInterval, setAdsInterval] = useState(15);
  const [adsPlaybackMode, setAdsPlaybackMode] = useState('single');
  const [adsPlaylist, setAdsPlaylist] = useState([]);
  const [audioPlaylist, setAudioPlaylist] = useState([]);
  const [radioVisualPlaylist, setRadioVisualPlaylist] = useState([]);
  const [configClock, setConfigClock] = useState(false);
  const [configTicker, setConfigTicker] = useState('');
  const [configNewsTicker, setConfigNewsTicker] = useState(false);
  const [displayMode, setDisplayMode] = useState('alternate');
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [draggedListType, setDraggedListType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (u) {
        setUser(u);
        onValue(dbRef(db, `users/${u.uid}/media`), snap => {
          const d = snap.val();
          setMediaLibrary(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })).reverse() : []);
        });
        onValue(dbRef(db, `users/${u.uid}/tvs`), snap => {
          const d = snap.val();
          setMyTvs(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
        });
        onValue(dbRef(db, `users/${u.uid}/settings`), snap => {
          if (snap.exists() && snap.val().youtubeApiKey) setYoutubeApiKey(snap.val().youtubeApiKey);
        });
      }
    });
    return unsub;
  }, []);

  const saveGlobalSettings = async () => {
    if (!user) return;
    setIsSavingSettings(true);
    try { await set(dbRef(db, `users/${user.uid}/settings/youtubeApiKey`), youtubeApiKey.trim()); alert('Salvo!'); }
    catch (e) { alert('Erro: ' + e.message); }
    finally { setIsSavingSettings(false); }
  };

  const handleAddTv = async () => {
    if (!newTvCode || !newTvName || !user) return;
    const code = newTvCode.toUpperCase();
    await set(dbRef(db, `users/${user.uid}/tvs/${code}`), { name: newTvName, code, addedAt: Date.now() });
    setNewTvCode(''); setNewTvName('');
  };

  const removeTv = async (code) => {
    if (!window.confirm('Remover esta TV?')) return;
    await remove(dbRef(db, `users/${user.uid}/tvs/${code}`));
  };

  const openTvManager = async (tv) => {
    setSelectedTv(tv);
    const snap = await get(dbRef(db, `tvs/${tv.code}`));
    if (snap.exists()) {
      const d = snap.val();
      setSignagePlaylist(d.playlist || []);
      setAudioPlaylist(d.audioPlaylist || []);
      setRadioVisualPlaylist(d.radioPlaylist || []);
      setDisplayMode(d.config?.displayMode || 'alternate');
      setConfigClock(d.config?.showClock || false);
      setConfigTicker(d.config?.tickerText || '');
      setConfigNewsTicker(d.config?.newsTicker || false);
      const ads = d.config?.ads || {};
      setAdsEnabled(ads.enabled || false);
      setAdsTimeEnabled(ads.timeEnabled ?? true);
      setAdsBetweenVideosEnabled(ads.betweenVideosEnabled ?? false);
      setAdsInterval(ads.intervalMinutes || 15);
      setAdsPlaybackMode(ads.playbackMode || 'single');
      setAdsPlaylist(ads.items || []);
    } else {
      setSignagePlaylist([]); setAudioPlaylist([]); setRadioVisualPlaylist([]); setDisplayMode('alternate');
      setConfigClock(false); setConfigTicker(''); setConfigNewsTicker(false);
      setAdsEnabled(false); setAdsTimeEnabled(true); setAdsBetweenVideosEnabled(false);
      setAdsInterval(15); setAdsPlaybackMode('single'); setAdsPlaylist([]);
    }
    setActiveTab('manage_tv');
  };

  const saveWorkspace = async () => {
    if (!selectedTv) return;
    setIsSaving(true);
    try {
      await set(dbRef(db, `tvs/${selectedTv.code}`), {
        status: 'online', playlist: signagePlaylist, audioPlaylist, radioPlaylist: radioVisualPlaylist,
        config: {
          displayMode, showClock: configClock, tickerText: configTicker, newsTicker: configNewsTicker,
          ads: { enabled: adsEnabled, timeEnabled: adsTimeEnabled, betweenVideosEnabled: adsBetweenVideosEnabled, intervalMinutes: Number(adsInterval), playbackMode: adsPlaybackMode, items: adsPlaylist }
        },
        updatedAt: Date.now()
      });
      alert('TV sincronizada!');
    } catch (e) { alert('Erro: ' + e.message); }
    finally { setIsSaving(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const cloudName = 'zha5nslc'; const apiKey = '835138123447751'; const apiSecret = 'IiJLE2trXaguxzT5DRtLt2WnwJM';
      const ts = Math.floor(Date.now() / 1000).toString();
      const msgBuffer = new TextEncoder().encode(`timestamp=${ts}${apiSecret}`);
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
      const sig = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      const fd = new FormData();
      fd.append('file', file); fd.append('api_key', apiKey); fd.append('timestamp', ts); fd.append('signature', sig);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) await push(dbRef(db, `users/${user.uid}/media`), { mediaType: data.resource_type === 'video' ? 'video' : 'image', content: data.secure_url, createdAt: Date.now() });
    } catch (err) { alert('Erro no upload: ' + err.message); }
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const handleRadioVisualUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const cloudName = 'zha5nslc'; const apiKey = '835138123447751'; const apiSecret = 'IiJLE2trXaguxzT5DRtLt2WnwJM';
      const ts = Math.floor(Date.now() / 1000).toString();
      const msgBuffer = new TextEncoder().encode(`timestamp=${ts}${apiSecret}`);
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
      const sig = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      const fd = new FormData();
      fd.append('file', file); fd.append('api_key', apiKey); fd.append('timestamp', ts); fd.append('signature', sig);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) {
        const mediaType = data.resource_type === 'video' ? 'video' : 'image';
        setRadioVisualPlaylist(prev => [...prev, {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          mediaType,
          content: data.secure_url,
          durationSeconds: mediaType === 'video' ? 0 : 10
        }]);
      }
    } catch (err) { alert('Erro no upload: ' + err.message); }
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const addTextToLibrary = () => {
    if (!textInput.trim() || !user) return;
    push(dbRef(db, `users/${user.uid}/media`), { mediaType: 'text', content: textInput, createdAt: Date.now() });
    setTextInput('');
  };

  const handleAddYoutube = async () => {
    if (!youtubeInput.trim()) return;
    const listMatch = youtubeInput.match(/list=([a-zA-Z0-9_-]+)/);
    const videoMatch = youtubeInput.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    let items = [];
    if (listMatch) {
      if (youtubeApiKey) {
        setIsExtractingYt(true);
        try {
          let all = []; let next = ''; let pc = 0;
          while (pc < 10) {
            let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${listMatch[1]}&key=${youtubeApiKey}`;
            if (next) url += `&pageToken=${next}`;
            const res = await fetch(url); const d = await res.json();
            if (d.error) throw new Error(d.error.message);
            if (d.items?.length) all.push(...d.items.map(i => ({ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), mediaType: 'youtube', content: i.snippet.resourceId.videoId, durationSeconds: 0, title: i.snippet.title })).filter(i => i.title !== 'Deleted video' && i.title !== 'Private video'));
            next = d.nextPageToken;
            if (!next) break;
            pc++;
          }
          if (all.length > 0) { items = all; alert(all.length + ' videos extraidos!'); } else alert('Playlist vazia ou privada.');
        } catch (err) { alert('Erro: ' + err.message); }
        finally { setIsExtractingYt(false); }
      }
      if (items.length === 0) {
        if (window.confirm('Importar como Playlist inteira?')) items = [{ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), mediaType: 'youtube_playlist', content: listMatch[1], durationSeconds: 0, title: 'Playlist YT' }];
        else if (videoMatch?.[2]?.length === 11) items = [{ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), mediaType: 'youtube', content: videoMatch[2], durationSeconds: 0, title: 'Clipe YT' }];
      }
    } else if (videoMatch?.[2]?.length === 11) {
      items = [{ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), mediaType: 'youtube', content: videoMatch[2], durationSeconds: 0, title: 'Clipe YT' }];
    }
    if (items.length > 0) { setSignagePlaylist(prev => [...prev, ...items]); setYoutubeInput(''); }
    else if (!listMatch) alert('Link invalido.');
  };

  const handleAddAudioYoutube = async () => {
    if (!audioYoutubeInput.trim()) return;
    const listMatch = audioYoutubeInput.match(/list=([a-zA-Z0-9_-]+)/);
    const videoMatch = audioYoutubeInput.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    let items = [];

    if (listMatch) {
      if (youtubeApiKey) {
        setIsExtractingAudioYt(true);
        try {
          let all = []; let next = ''; let pc = 0;
          while (pc < 10) {
            let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${listMatch[1]}&key=${youtubeApiKey}`;
            if (next) url += `&pageToken=${next}`;
            const res = await fetch(url); const d = await res.json();
            if (d.error) throw new Error(d.error.message);
            if (d.items?.length) {
              all.push(...d.items.map(i => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                mediaType: 'youtube',
                content: i.snippet.resourceId.videoId,
                durationSeconds: 0,
                title: i.snippet.title
              })).filter(i => i.title !== 'Deleted video' && i.title !== 'Private video'));
            }
            next = d.nextPageToken;
            if (!next) break;
            pc++;
          }
          if (all.length > 0) { items = all; alert(all.length + ' musicas extraidas!'); }
          else alert('Playlist vazia ou privada.');
        } catch (err) { alert('Erro: ' + err.message); }
        finally { setIsExtractingAudioYt(false); }
      }
      if (items.length === 0) {
        // Sem chave de API: importar como bloco de playlist nativa
        items = [{ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), mediaType: 'youtube_playlist', content: listMatch[1], durationSeconds: 0, title: 'Playlist YT (Bloco)' }];
      }
    } else if (videoMatch?.[2]?.length === 11) {
      items = [{ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), mediaType: 'youtube', content: videoMatch[2], durationSeconds: 0, title: 'Musica YT' }];
    }

    if (items.length > 0) { setAudioPlaylist(prev => [...prev, ...items]); setAudioYoutubeInput(''); }
    else alert('Link invalido. Cole o link completo do video ou playlist.');
  };

  const handleDragStart = (e, idx, listType) => { setDraggedItemIndex(idx); setDraggedListType(listType); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetIdx, listType) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedListType !== listType) return;
    const setterMap = { signage: setSignagePlaylist, audio: setAudioPlaylist, ads: setAdsPlaylist, radioVisual: setRadioVisualPlaylist };
    const listMap = { signage: signagePlaylist, audio: audioPlaylist, ads: adsPlaylist, radioVisual: radioVisualPlaylist };
    const arr = [...listMap[listType]]; const [item] = arr.splice(draggedItemIndex, 1); arr.splice(targetIdx, 0, item);
    setterMap[listType](arr); setDraggedItemIndex(null); setDraggedListType(null);
  };
  const appendToPlaylist = (listType, media) => {
    const item = { id: Date.now().toString() + Math.random().toString(36).substr(2, 5), mediaType: media.mediaType, content: media.content || '', durationSeconds: media.mediaType === 'video' ? 0 : 10 };
    if (listType === 'signage') setSignagePlaylist(p => [...p, item]);
    else if (listType === 'audio') setAudioPlaylist(p => [...p, item]);
    else if (listType === 'radioVisual') setRadioVisualPlaylist(p => [...p, item]);
    else setAdsPlaylist(p => [...p, item]);
  };
  const removeFromList = (listType, id) => {
    if (listType === 'signage') setSignagePlaylist(p => p.filter(i => i.id !== id));
    else if (listType === 'audio') setAudioPlaylist(p => p.filter(i => i.id !== id));
    else if (listType === 'radioVisual') setRadioVisualPlaylist(p => p.filter(i => i.id !== id));
    else setAdsPlaylist(p => p.filter(i => i.id !== id));
  };
  const updateDuration = (listType, id, val) => {
    const n = Number(val);
    if (listType === 'signage') setSignagePlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));
    else if (listType === 'audio') setAudioPlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));
    else if (listType === 'radioVisual') setRadioVisualPlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));
    else setAdsPlaylist(p => p.map(i => i.id === id ? { ...i, durationSeconds: n } : i));
  };
  const updateContent = (listType, id, val) => {
    if (listType === 'signage') setSignagePlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));
    else if (listType === 'audio') setAudioPlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));
    else if (listType === 'radioVisual') setRadioVisualPlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));
    else setAdsPlaylist(p => p.map(i => i.id === id ? { ...i, content: val } : i));
  };

  const ItemRow = ({ item, idx, listType, accent }) => {
    const isActive = draggedItemIndex === idx && draggedListType === listType;
    return (
      <div draggable onDragStart={(e) => handleDragStart(e, idx, listType)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, idx, listType)}
        className={`flex items-center gap-3 bg-slate-950 border p-2 rounded-xl group transition cursor-move ${isActive ? `opacity-50 scale-95 border-${accent}-500` : `border-slate-800 hover:border-${accent}-500`}`}>
        <span className="text-slate-600 font-mono font-bold w-5 text-center shrink-0">{idx + 1}</span>
        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
          {item.mediaType === 'image' && <img src={item.content} className="w-full h-full object-cover" />}
          {item.mediaType === 'video' && <video src={item.content} className="w-full h-full object-cover" />}
          {item.mediaType === 'text' && <div className="w-full h-full flex items-center justify-center bg-slate-700 text-[7px] font-bold p-1 text-center">{item.content}</div>}
          {(item.mediaType === 'youtube' || item.mediaType === 'youtube_playlist') && <MonitorPlay size={18} className="text-red-500" />}
          {item.mediaType === 'news' && <Newspaper size={18} className="text-blue-500" />}
        </div>
        <div className="flex-1 min-w-0">
          {(item.mediaType === 'image' || item.mediaType === 'video' || item.mediaType === 'text' || listType === 'audio') ? (
            <input type="text" value={item.content} onChange={e => updateContent(listType, item.id, e.target.value)}
              placeholder={item.mediaType === 'text' ? 'Digite o texto...' : (item.mediaType === 'youtube' || item.mediaType === 'youtube_playlist') ? 'ID do video ou playlist YT' : 'URL da midia...'}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 w-full outline-none focus:border-blue-500 text-sm font-mono transition" />
          ) : (
            <p className="text-sm font-bold text-slate-200 truncate">{item.title || item.mediaType}</p>
          )}
        </div>
        {item.mediaType !== 'video' && item.mediaType !== 'youtube' && item.mediaType !== 'youtube_playlist' && item.mediaType !== 'news' && (
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 shrink-0">
            <Clock size={12} className="text-slate-500" />
            <input type="number" min="1" value={item.durationSeconds} onChange={e => updateDuration(listType, item.id, e.target.value)} className="bg-transparent text-white font-mono w-8 outline-none text-right text-sm" />
            <span className="text-xs text-slate-500">s</span>
          </div>
        )}
        <button onClick={() => removeFromList(listType, item.id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition shrink-0"><Trash2 size={16} /></button>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white pb-10">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg"><MonitorPlay size={20} /></div>
              <h1 className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">TVMax SaaS</h1>
            </div>
            <div className="hidden md:flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button onClick={() => setActiveTab('tvs')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'tvs' || activeTab === 'manage_tv' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><LayoutDashboard size={16} /> Paineis</button>
              <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><Settings size={16} /> Config</button>
            </div>
          </div>
          <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-white p-2"><LogOut size={20} /></button>
        </div>
      </header>

      {activeTab === 'settings' && (
        <main className="flex-1 max-w-2xl w-full mx-auto p-4 mt-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Key className="text-blue-500" /> Configuracoes Globais</h2>
            <div className="mb-8">
              <label className="block text-slate-300 font-bold mb-2">Chave de API do YouTube (v3)</label>
              <input type="password" placeholder="AIzaSyA..." value={youtubeApiKey} onChange={e => setYoutubeApiKey(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-4 outline-none focus:border-blue-500 transition font-mono" />
              <p className="text-sm text-slate-500 mt-2">Necessaria para extrair playlists do YouTube.</p>
            </div>
            <button onClick={saveGlobalSettings} disabled={isSavingSettings} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl flex justify-center items-center gap-2">
              {isSavingSettings ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} SALVAR
            </button>
          </div>
        </main>
      )}

      {activeTab === 'tvs' && (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl h-fit">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Tv className="text-blue-500" /> Adicionar Nova TV</h2>
              <input type="text" maxLength={4} value={newTvCode} onChange={e => setNewTvCode(e.target.value)} placeholder="CODIGO (EX: A7B9)" className="bg-slate-950 border border-slate-700 text-white text-center uppercase font-mono tracking-widest rounded-xl p-4 w-full mb-4 outline-none focus:border-blue-500 transition" />
              <input type="text" value={newTvName} onChange={e => setNewTvName(e.target.value)} placeholder="Nome (ex: Recepcao, Vitrine)" className="bg-slate-950 border border-slate-700 text-white rounded-xl p-4 w-full mb-6 outline-none focus:border-blue-500 transition" />
              <button onClick={handleAddTv} className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-4 rounded-xl transition">Cadastrar Tela</button>
            </section>
            <section>
              <h3 className="font-bold mb-6 text-slate-300 text-lg">Paineis Ativos</h3>
              {myTvs.map(tv => (
                <div key={tv.id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl flex items-center justify-between hover:border-blue-500 transition mb-4">
                  <div><h4 className="font-bold text-white">{tv.name}</h4><p className="text-slate-400 font-mono text-xs">CODE: {tv.code}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => openTvManager(tv)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-500 transition">Gerenciar</button>
                    <button onClick={() => removeTv(tv.id)} className="text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </main>
      )}

      {activeTab === 'manage_tv' && selectedTv && (
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6 mt-4">
          <div className="flex-[2] flex flex-col gap-5">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-700 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('tvs')} className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition"><ArrowLeft size={20} /></button>
                <div><h2 className="font-bold text-xl">{selectedTv.name}</h2><p className="text-blue-400 font-mono text-xs">TV: {selectedTv.code}</p></div>
              </div>
              <button onClick={saveWorkspace} disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-black px-8 py-3 rounded-xl flex items-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} SINCRONIZAR TV
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 border border-slate-700 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3 md:mb-0">
                <div className="bg-slate-800 p-2 rounded-lg"><MonitorPlay className="text-blue-500" size={22} /></div>
                <div><h3 className="font-bold">Modo de Exibicao</h3><p className="text-sm text-slate-400">Define como a TV funciona</p></div>
              </div>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700">
                <button onClick={() => setDisplayMode('alternate')} className={`px-5 py-2 rounded-lg font-bold text-sm transition ${displayMode === 'alternate' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Alternado</button>
                <button onClick={() => setDisplayMode('radio')} className={`px-5 py-2 rounded-lg font-bold text-sm transition ${displayMode === 'radio' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Modo Radio</button>
              </div>
            </div>

            {displayMode === 'alternate' && (
              <>
                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Presentation className="text-blue-400" /> Programacao Principal</h3>
                    <div className="flex gap-2 items-center w-full md:max-w-2xl">
                      {signagePlaylist.length > 0 && <button onClick={() => { if(window.confirm('Apagar tudo da Programacao Principal?')) setSignagePlaylist([]); }} className="bg-red-900/40 hover:bg-red-900/70 text-red-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap"><Trash2 size={14} />Limpar Tudo</button>}
                      <div className="flex items-center gap-2 flex-1 bg-slate-950 p-1.5 rounded-xl border border-slate-700 focus-within:border-red-500 transition">
                        <div className="bg-red-500/20 p-1.5 rounded-lg"><MonitorPlay size={16} className="text-red-500" /></div>
                        <input type="text" placeholder="Link do clipe ou playlist YouTube..." value={youtubeInput} onChange={e => setYoutubeInput(e.target.value)} className="bg-transparent text-white text-sm outline-none w-full" />
                        <button onClick={handleAddYoutube} disabled={!youtubeInput || isExtractingYt} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50">
                          {isExtractingYt ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {signagePlaylist.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-2xl">
                        <Presentation size={32} className="mx-auto text-slate-600 mb-2" />
                        <p className="text-slate-400">Fila vazia. Adicione videos ou arraste da biblioteca.</p>
                      </div>
                    ) : (
                      <div className="grid gap-2">{signagePlaylist.map((item, idx) => <ItemRow key={item.id} item={item} idx={idx} listType="signage" accent="blue" />)}</div>
                    )}
                  </div>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="bg-yellow-900/20 p-4 border-b border-yellow-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-yellow-400"><Megaphone size={20} /> Anuncios / Patrocinios</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={adsEnabled} onChange={e => setAdsEnabled(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-yellow-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  {adsEnabled && (
                    <div className="p-5 border-t border-slate-800">
                      <div className="flex gap-4 mb-5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div className="flex-1">
                          <label className="flex items-center gap-2 cursor-pointer mb-2"><input type="checkbox" checked={adsTimeEnabled} onChange={e => setAdsTimeEnabled(e.target.checked)} className="accent-yellow-500" /><span className="font-bold text-sm">A cada X minutos</span></label>
                          {adsTimeEnabled && <input type="number" min="1" value={adsInterval} onChange={e => setAdsInterval(e.target.value)} className="ml-6 bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 w-20 outline-none font-mono" />}
                        </div>
                        <div className="w-px bg-slate-800"></div>
                        <div className="flex-1">
                          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={adsBetweenVideosEnabled} onChange={e => setAdsBetweenVideosEnabled(e.target.checked)} className="accent-yellow-500" /><div><span className="font-bold text-sm block">Entre os videos</span><span className="text-xs text-slate-500">Quando um clipe acabar</span></div></label>
                        </div>
                      </div>
                      <div className="mb-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={adsPlaybackMode === 'single'} onChange={() => setAdsPlaybackMode('single')} className="accent-yellow-500" /><span className="text-sm">1 por vez (Rodizio)</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={adsPlaybackMode === 'all'} onChange={() => setAdsPlaybackMode('all')} className="accent-yellow-500" /><span className="text-sm">Fila completa</span></label>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <button onClick={() => appendToPlaylist('ads', { mediaType: 'image', content: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 justify-center"><ImageIcon size={14} className="text-yellow-400" />Imagem</button>
                        <button onClick={() => appendToPlaylist('ads', { mediaType: 'video', content: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 justify-center"><Video size={14} className="text-yellow-400" />Video</button>
                        <button onClick={() => appendToPlaylist('ads', { mediaType: 'text', content: '' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 justify-center"><Type size={14} className="text-yellow-400" />Texto</button>
                        {adsPlaylist.length > 0 && <button onClick={() => { if(window.confirm('Apagar todos os anuncios?')) setAdsPlaylist([]); }} className="bg-red-900/40 hover:bg-red-900/70 text-red-400 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Trash2 size={14} />Limpar</button>}
                      </div>
                      {adsPlaylist.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-2xl"><p className="text-slate-400">Nenhum anuncio. Clique acima ou arraste da biblioteca.</p></div>
                      ) : (
                        <div className="grid gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">{adsPlaylist.map((item, idx) => <ItemRow key={item.id} item={item} idx={idx} listType="ads" accent="yellow" />)}</div>
                      )}
                    </div>
                  )}
                </section>
              </>
            )}

            {displayMode === 'radio' && (
              <>
                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl ring-2 ring-purple-500/30">
                  <div className="bg-purple-900/20 p-4 border-b border-purple-900/50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 text-purple-300"><Music size={20} /> Trilha Sonora (Toca no Fundo)</h3>
                        <p className="text-sm text-slate-400 mt-0.5">Som toca invisivel enquanto as vitrines aparecem na tela</p>
                      </div>
                      {audioPlaylist.length > 0 && (
                        <button onClick={() => { if(window.confirm('Apagar toda a trilha sonora?')) setAudioPlaylist([]); }} className="hover:bg-slate-800 text-red-400 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shrink-0"><Trash2 size={14} />Limpar Tudo</button>
                      )}
                    </div>
                    {/* YouTube input — same engine as alternate mode */}
                    <div className="flex items-center gap-2 mt-3 bg-slate-950 p-1.5 rounded-xl border border-purple-900/50 focus-within:border-purple-500 transition">
                      <div className="bg-red-500/20 p-1.5 rounded-lg shrink-0"><MonitorPlay size={16} className="text-red-500" /></div>
                      <input
                        type="text"
                        placeholder="Cole o link do video ou playlist do YouTube..."
                        value={audioYoutubeInput}
                        onChange={e => setAudioYoutubeInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddAudioYoutube()}
                        className="bg-transparent text-white text-sm outline-none w-full"
                      />
                      <button
                        onClick={handleAddAudioYoutube}
                        disabled={!audioYoutubeInput.trim() || isExtractingAudioYt}
                        className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1"
                      >
                        {isExtractingAudioYt ? <><Loader2 size={13} className="animate-spin" /> Extraindo...</> : 'Add Musica'}
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {audioPlaylist.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
                        <Music size={32} className="mx-auto mb-3 text-purple-900" />
                        <p className="text-slate-400 font-bold">Nenhuma musica adicionada.</p>
                        <p className="text-slate-500 text-sm mt-1">Cole o link de um video ou playlist do YouTube acima e clique em "Add Musica".</p>
                        <p className="text-slate-600 text-xs mt-1">Com a Chave de API configurada, playlists inteiras sao extraidas automaticamente.</p>
                      </div>
                    ) : (
                      <div className="grid gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">{audioPlaylist.map((item, idx) => <ItemRow key={item.id} item={item} idx={idx} listType="audio" accent="purple" />)}</div>
                    )}
                  </div>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl ring-2 ring-blue-500/30">
                  <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2 text-blue-300"><MonitorPlay size={20} /> Programacao Visual (Vitrines)</h3>
                      <p className="text-sm text-slate-400 mt-0.5">Imagens e videos em loop continuo na tela da TV</p>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700 gap-1 flex-wrap justify-end">
                      <input type="file" accept="image/*,video/*" className="hidden" ref={radioVisualFileInputRef} onChange={handleRadioVisualUpload} />
                      <button onClick={() => radioVisualFileInputRef.current?.click()} disabled={isUploading} className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition">
                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        Upload do PC
                      </button>
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
                </section>
              </>
            )}

            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="font-bold text-slate-300">Sobreposicoes da TV</h3>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div><p className="font-bold">Relogio Digital</p><p className="text-sm text-slate-400">Exibe hora no canto superior direito</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={configClock} onChange={e => setConfigClock(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold flex items-center gap-2"><Newspaper size={16} className="text-red-500" /> Letreiro de Noticias (G1)</p>
                  <p className="text-sm text-slate-400">Manchetes passando no rodape em tempo real</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={configNewsTicker} onChange={e => setConfigNewsTicker(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-red-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="font-bold mb-2">Letreiro Personalizado</p>
                <input type="text" value={configTicker} onChange={e => setConfigTicker(e.target.value)} placeholder="Texto do rodape personalizado (vazio = desativado)" className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition" />
              </div>
            </section>
          </div>

          <aside className="flex-1 flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4"><FolderHeart className="text-purple-400" /> Sua Biblioteca</h3>
              <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-xl p-4 flex items-center justify-center gap-2 transition disabled:opacity-50 mb-4">
                {isUploading ? <Loader2 size={22} className="text-purple-500 animate-spin" /> : <><Upload size={18} className="text-purple-400" /><span className="text-slate-300 font-bold text-sm">Upload de Midia</span></>}
              </button>
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Criar texto..." value={textInput} onChange={e => setTextInput(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
                <button onClick={addTextToLibrary} disabled={!textInput.trim()} className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold p-2 rounded-lg transition"><Type size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  {mediaLibrary.map(item => (
                    <div key={item.id} className="group relative aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                      {item.mediaType === 'image' && <img src={item.content} className="w-full h-full object-cover" />}
                      {item.mediaType === 'video' && <video src={item.content} className="w-full h-full object-cover" />}
                      {item.mediaType === 'text' && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-2 text-[10px] text-center font-bold">{item.content}</div>}
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                        {displayMode === 'alternate' && <button onClick={() => appendToPlaylist('signage', item)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-2 rounded-lg">+ PROGRAMACAO</button>}
                        {displayMode === 'radio' && <button onClick={() => appendToPlaylist('radioVisual', item)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-2 rounded-lg">+ VITRINE</button>}
                        {displayMode === 'radio' && <button onClick={() => appendToPlaylist('audio', item)} className="w-full bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black py-2 rounded-lg">+ MUSICA</button>}
                        {displayMode === 'alternate' && <button onClick={() => appendToPlaylist('ads', item)} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-black py-2 rounded-lg">+ ANUNCIO</button>}
                        <button onClick={async () => { if (window.confirm('Apagar?')) await remove(dbRef(db, `users/${user.uid}/media/${item.id}`)); }} className="absolute top-1 right-1 text-red-500 bg-red-500/20 p-1.5 rounded-md hover:bg-red-500 hover:text-white transition"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </main>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:10px}` }} />
    </div>
  );
}
