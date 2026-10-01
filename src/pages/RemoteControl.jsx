import { useState, useRef } from 'react';
import { ref as dbRef, set, get } from 'firebase/database';
import { db } from '../firebase';
import { Tv, Image as ImageIcon, Type, LogOut, Upload, Loader2, Video, Play, Trash2, Clock } from 'lucide-react';

export default function RemoteControl() {
  const [code, setCode] = useState('');
  const [connectedCode, setConnectedCode] = useState(null);
  
  const [localPlaylist, setLocalPlaylist] = useState([]);
  const [defaultDuration, setDefaultDuration] = useState(10);
  const [textInput, setTextInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleConnect = async () => {
    const codeUpper = code.toUpperCase();
    const tvRef = dbRef(db, `tvs/${codeUpper}`);
    const snapshot = await get(tvRef);
    
    if (snapshot.exists()) {
      setConnectedCode(codeUpper);
    } else {
      alert("TV não encontrada com esse código.");
    }
  };

  const addToPlaylist = (type, content) => {
    const newItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      mediaType: type,
      content: content,
      duration: type === 'video' ? 0 : Number(defaultDuration)
    };
    setLocalPlaylist(prev => [...prev, newItem]);
    setTextInput('');
  };

  const removeFromPlaylist = (id) => {
    setLocalPlaylist(prev => prev.filter(item => item.id !== id));
  };

  const publishPlaylist = async () => {
    if (!connectedCode) return;
    const tvRef = dbRef(db, `tvs/${connectedCode}`);
    try {
      await set(tvRef, {
        status: 'online',
        playlist: localPlaylist,
        updatedAt: Date.now()
      });
    } catch (error) {
      alert("Erro ao transmitir! Erro: " + error.message);
    }
  };

  const clearTV = async () => {
    if (!connectedCode) return;
    const tvRef = dbRef(db, `tvs/${connectedCode}`);
    await set(tvRef, { status: 'online', playlist: [], updatedAt: Date.now() });
    setLocalPlaylist([]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const cloudName = "zha5nslc";
      const apiKey = "835138123447751";
      const apiSecret = "IiJLE2trXaguxzT5DRtLt2WnwJM";
      const timestamp = Math.floor(Date.now() / 1000).toString();

      const msgBuffer = new TextEncoder().encode(`timestamp=${timestamp}${apiSecret}`);
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      
      if (data.secure_url) {
        const isVideo = data.resource_type === 'video';
        addToPlaylist(isVideo ? 'video' : 'image', data.secure_url);
      } else {
        throw new Error(data.error?.message || "Erro desconhecido no Cloudinary");
      }

    } catch (error) {
      alert("Erro no upload: " + error.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  if (!connectedCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-950 text-white">
        <Tv size={80} className="text-blue-500 mb-8" />
        <h1 className="text-3xl font-bold mb-2">Conectar à TV</h1>
        <p className="text-slate-400 mb-10 text-center">Digite o código que aparece na tela da TV</p>
        
        <input 
          type="text" 
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="EX: A7B9"
          className="bg-slate-900 border-2 border-slate-700 text-white text-4xl text-center uppercase font-mono tracking-widest rounded-xl p-6 w-full max-w-sm mb-6 focus:border-blue-500 focus:outline-none transition"
        />
        
        <button 
          onClick={handleConnect}
          disabled={code.length !== 4}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-5 px-8 rounded-xl w-full max-w-sm transition text-xl"
        >
          Conectar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 text-white">
      <header className="flex justify-between items-center bg-slate-900 p-5 rounded-2xl mb-6 border border-slate-800 shadow-lg sticky top-4 z-10">
        <div>
          <h2 className="font-bold text-slate-400 text-sm uppercase tracking-wider mb-1">TV Conectada</h2>
          <div className="text-blue-400 font-mono tracking-widest text-2xl font-black">{connectedCode}</div>
        </div>
        <button onClick={() => setConnectedCode(null)} className="p-3 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500/20 transition">
          <LogOut size={24} />
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-6 max-w-md w-full mx-auto pb-10">
        
        {/* PLAYLIST MANAGER */}
        <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Sua Playlist</h3>
            <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
              {localPlaylist.length} Itens
            </span>
          </div>

          {localPlaylist.length === 0 ? (
            <div className="text-center py-8 bg-slate-950/50 rounded-xl border border-dashed border-slate-700">
              <p className="text-slate-500">Lista vazia.</p>
              <p className="text-slate-600 text-sm mt-1">Adicione itens abaixo!</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3 mb-6 max-h-60 overflow-y-auto pr-2">
              {localPlaylist.map((item, index) => (
                <li key={item.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="bg-slate-950 p-2 rounded-lg text-slate-400">
                      <span className="font-mono text-xs">{index + 1}</span>
                    </div>
                    <div className="bg-slate-700 p-2 rounded-lg">
                      {item.mediaType === 'image' && <ImageIcon size={18} className="text-purple-400" />}
                      {item.mediaType === 'video' && <Video size={18} className="text-purple-400" />}
                      {item.mediaType === 'text' && <Type size={18} className="text-blue-400" />}
                    </div>
                    <div className="truncate text-sm font-medium flex-1 pr-2">
                      {item.mediaType === 'text' ? item.content : 'Mídia Upload'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.mediaType !== 'video' && (
                      <span className="text-xs bg-slate-900 text-slate-300 px-2 py-1 rounded font-mono border border-slate-700">
                        {item.duration}s
                      </span>
                    )}
                    <button onClick={() => removeFromPlaylist(item.id)} className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-3">
            <button 
              onClick={publishPlaylist}
              disabled={localPlaylist.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 font-bold py-4 rounded-xl transition shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
            >
              <Play size={20} fill="currentColor" /> Transmitir
            </button>
            <button 
              onClick={clearTV}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 rounded-xl transition"
              title="Limpar TV"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </section>

        {/* ADD MEDIA SECTION */}
        <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            Adicionar Mídias
          </h3>

          <div className="flex items-center gap-4 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <Clock className="text-slate-400" size={20} />
            <div className="flex-1">
              <label className="text-xs text-slate-400 block mb-1">Tempo de exibição (Fotos/Texto)</label>
              <input 
                type="number" 
                min="1"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className="bg-transparent text-white font-mono text-lg outline-none w-full"
              />
            </div>
            <span className="text-slate-500 font-mono">segundos</span>
          </div>
          
          <input 
            type="file"
            accept="image/*,video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-slate-700 hover:border-purple-500 bg-slate-950 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition disabled:opacity-50 mb-6"
          >
            {isUploading ? (
              <>
                <Loader2 size={32} className="text-purple-500 animate-spin" />
                <span className="text-slate-300 font-medium">Fazendo upload...</span>
              </>
            ) : (
              <>
                <div className="bg-slate-800 p-3 rounded-full flex gap-2">
                  <ImageIcon size={20} className="text-purple-400" />
                  <Video size={20} className="text-purple-400" />
                </div>
                <div className="text-center">
                  <span className="block text-slate-200 font-medium">Adicionar Foto ou Vídeo</span>
                </div>
              </>
            )}
          </button>

          <div className="relative">
            <textarea 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white mb-3 h-24 focus:border-blue-500 focus:outline-none transition resize-none text-sm"
              placeholder="Ou digite uma mensagem de texto..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button 
              onClick={() => addToPlaylist('text', textInput)}
              disabled={!textInput.trim()}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-blue-400 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2"
            >
              <Type size={18} /> Adicionar Letreiro
            </button>
          </div>
        </section>
        
      </main>
    </div>
  );
}
