import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import YouTube from 'react-youtube';

const extractYt = (content) => {
  if (!content) return { videoId: '', playlistId: '' };
  const str = String(content).trim();
  const listMatch = str.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  const videoMatch = str.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/);
  const playlistId = listMatch ? listMatch[1] : (str.startsWith('PL') || str.startsWith('OLAK') ? str : '');
  const videoId = videoMatch && videoMatch[1].length === 11 ? videoMatch[1] : (str.length === 11 ? str : '');
  return { videoId, playlistId };
};

const NewsTicker = ({ source }) => {
  const [headlines, setHeadlines] = useState('');
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const rssUrl = source === 'g1' ? 'https://g1.globo.com/rss/g1/' : '';
        if (!rssUrl) return;
        const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl));
        const data = await res.json();
        if (data.items) setHeadlines(data.items.slice(0, 10).map(i => i.title).join('  •  '));
      } catch (e) {}
    };
    fetchNews();
    const interval = setInterval(fetchNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [source]);

  if (!headlines) return null;
  return (
    <div className="absolute bottom-0 left-0 w-full bg-red-700 text-white font-bold text-3xl z-[30] flex shadow-[0_-10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="bg-red-800 px-6 py-4 z-10 flex items-center justify-center shrink-0 border-r border-red-900 shadow-xl">
        <span className="uppercase tracking-widest font-black text-2xl drop-shadow-md">Plantão G1</span>
      </div>
      <div className="flex-1 flex items-center overflow-hidden">
        <div className="animate-ticker whitespace-nowrap inline-block pl-[100%] pr-[100%] tracking-wide text-2xl">
          {headlines}
        </div>
      </div>
    </div>
  );
};

export default function TvDisplay() {
  const [tvCode, setTvCode] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [visualPlaylist, setVisualPlaylist] = useState([]);
  const [audioPlaylist, setAudioPlaylist] = useState([]);
  const [currentVisualIndex, setCurrentVisualIndex] = useState(0);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState('alternate');

  const [adsConfig, setAdsConfig] = useState(null);
  const [adQueue, setAdQueue] = useState([]);
  const [globalAdIndex, setGlobalAdIndex] = useState(0);
  const [currentPlayingAd, setCurrentPlayingAd] = useState(null);

  const [clockConfig, setClockConfig] = useState(false);
  const [tickerText, setTickerText] = useState('');
  const [newsTicker, setNewsTicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const ytPlayerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const adYtPlayerRef = useRef(null);

  // Unmute helper for any user interaction
  useEffect(() => {
    const unMuteAll = () => {
      try {
        if (audioPlayerRef.current?.unMute) {
          audioPlayerRef.current.unMute();
          audioPlayerRef.current.setVolume(100);
        }
        if (ytPlayerRef.current?.unMute && displayMode === 'alternate') {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(100);
        }
      } catch (e) {}
    };
    window.addEventListener('click', unMuteAll, { passive: true });
    window.addEventListener('keydown', unMuteAll, { passive: true });
    window.addEventListener('touchstart', unMuteAll, { passive: true });
    return () => {
      window.removeEventListener('click', unMuteAll);
      window.removeEventListener('keydown', unMuteAll);
      window.removeEventListener('touchstart', unMuteAll);
    };
  }, [displayMode]);

  // Code extraction
  useEffect(() => {
    const segments = window.location.pathname.split('/');
    const code = segments[segments.length - 1]?.toUpperCase();
    if (code) {
      setTvCode(code);
      localStorage.setItem('tvMaxLastCode', code);
    } else {
      const saved = localStorage.getItem('tvMaxLastCode');
      if (saved) setTvCode(saved);
    }
  }, []);

  // Firebase listener
  useEffect(() => {
    if (!tvCode) return;
    const unsub = onValue(ref(db, 'tvs/' + tvCode), (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const mode = data.config?.displayMode || 'alternate';
        setDisplayMode(mode);

        if (mode === 'alternate') {
          setPlaylist((data.playlist || []).filter(i => i.mediaType !== 'news'));
        } else {
          setAudioPlaylist(data.audioPlaylist || []);
          setVisualPlaylist((data.radioPlaylist || []).filter(i => i.mediaType !== 'news'));
          setPlaylist([]);
        }

        const ads = data.config?.ads || { enabled: false, items: [] };
        ads.items = (ads.items || []).filter(i => i.mediaType !== 'news');
        if (mode === 'radio') ads.enabled = false;
        setAdsConfig(ads);

        setClockConfig(data.config?.showClock || false);
        setTickerText(data.config?.tickerText || '');
        setNewsTicker(data.config?.newsTicker || false);
      } else {
        setPlaylist([]);
        setAudioPlaylist([]);
        setVisualPlaylist([]);
      }
    });
    return unsub;
  }, [tvCode]);

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Timed ads
  useEffect(() => {
    if (!adsConfig?.enabled || !adsConfig?.timeEnabled || !adsConfig.items?.length) return;
    const ms = (adsConfig.intervalMinutes || 15) * 60 * 1000;
    const t = setInterval(() => {
      if (adsConfig.playbackMode === 'all') setAdQueue([...adsConfig.items]);
      else {
        setAdQueue([adsConfig.items[globalAdIndex % adsConfig.items.length]]);
        setGlobalAdIndex(p => p + 1);
      }
    }, ms);
    return () => clearInterval(t);
  }, [adsConfig, globalAdIndex]);

  // Ad queue pause/resume
  useEffect(() => {
    if (adQueue.length > 0 && !currentPlayingAd) {
      if (ytPlayerRef.current?.pauseVideo) ytPlayerRef.current.pauseVideo();
      if (audioPlayerRef.current?.pauseVideo) audioPlayerRef.current.pauseVideo();
      setCurrentPlayingAd(adQueue[0]);
    } else if (adQueue.length === 0 && currentPlayingAd) {
      setCurrentPlayingAd(null);
      if (ytPlayerRef.current?.playVideo) ytPlayerRef.current.playVideo();
      if (audioPlayerRef.current?.playVideo) audioPlayerRef.current.playVideo();
    }
  }, [adQueue, currentPlayingAd]);

  const handleAdEnd = () => {
    setAdQueue(p => p.slice(1));
    setCurrentPlayingAd(null);
  };

  // Alternate Mode video progression
  const handleAlternateVideoEnd = () => {
    if (playlist.length === 0) return;
    setCurrentIndex(p => (p + 1) % playlist.length);
  };

  // Radio Mode visual progression
  const handleVisualEnd = () => {
    if (visualPlaylist.length === 0) return;
    setCurrentVisualIndex(p => (p + 1) % visualPlaylist.length);
  };

  // Radio Mode audio progression
  const handleAudioEnd = () => {
    if (audioPlaylist.length === 0) return;
    setCurrentAudioIndex(p => (p + 1) % audioPlaylist.length);
  };

  // Alternate mode YouTube state change
  const handleAlternateYtState = (event) => {
    if (event.data === 0) {
      const isPlaylistBlock = playlist[currentIndex]?.mediaType === 'youtube_playlist';
      if (adsConfig?.enabled && adsConfig?.betweenVideosEnabled && adsConfig.items?.length > 0) {
        if (adsConfig.playbackMode === 'all') setAdQueue([...adsConfig.items]);
        else {
          setAdQueue([adsConfig.items[globalAdIndex % adsConfig.items.length]]);
          setGlobalAdIndex(p => p + 1);
        }
        if (!isPlaylistBlock) handleAlternateVideoEnd();
      } else {
        if (!isPlaylistBlock) handleAlternateVideoEnd();
      }
    }
  };

  // Image & Text slide timer (Alternate mode)
  useEffect(() => {
    if (displayMode !== 'alternate' || currentPlayingAd) return;
    const item = playlist[currentIndex];
    if (!item) return;
    if (item.mediaType === 'image' || item.mediaType === 'text') {
      const t = setTimeout(handleAlternateVideoEnd, (item.durationSeconds || 10) * 1000);
      return () => clearTimeout(t);
    }
  }, [currentIndex, playlist, currentPlayingAd, displayMode]);

  // Image & Text slide timer (Radio mode visuals)
  useEffect(() => {
    if (displayMode !== 'radio' || currentPlayingAd) return;
    const item = visualPlaylist[currentVisualIndex];
    if (!item) return;
    if (item.mediaType === 'image' || item.mediaType === 'text') {
      const t = setTimeout(handleVisualEnd, (item.durationSeconds || 10) * 1000);
      return () => clearTimeout(t);
    }
  }, [currentVisualIndex, visualPlaylist, currentPlayingAd, displayMode]);

  // Ad Image / Text timer
  useEffect(() => {
    if (!currentPlayingAd) return;
    if (currentPlayingAd.mediaType === 'image' || currentPlayingAd.mediaType === 'text') {
      const t = setTimeout(handleAdEnd, (currentPlayingAd.durationSeconds || 10) * 1000);
      return () => clearTimeout(t);
    }
  }, [currentPlayingAd]);

  // Render a visual media item (Alternate or Radio Visual)
  const renderVisualMedia = (item, isAd = false) => {
    if (!item) return null;

    if (item.mediaType === 'image') {
      return <img src={item.content} alt="" className="w-full h-full object-cover" />;
    }

    if (item.mediaType === 'video') {
      return (
        <video
          src={item.content}
          autoPlay
          muted={displayMode === 'radio' && !isAd}
          playsInline
          onEnded={isAd ? handleAdEnd : displayMode === 'radio' ? handleVisualEnd : handleAlternateVideoEnd}
          className="w-full h-full object-cover"
        />
      );
    }

    if (item.mediaType === 'text') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black p-12">
          <h1 className="text-7xl md:text-9xl font-bold text-center text-white drop-shadow-2xl">
            {item.content}
          </h1>
        </div>
      );
    }

    if (item.mediaType === 'youtube' || item.mediaType === 'youtube_playlist') {
      const { videoId, playlistId } = extractYt(item.content);
      const isPlaylist = item.mediaType === 'youtube_playlist' || (!videoId && !!playlistId);
      const isMuted = displayMode === 'radio' && !isAd;

      const playerVars = {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        mute: isMuted ? 1 : 1, // Start muted for autoplay approval
      };

      if (isPlaylist) {
        playerVars.listType = 'playlist';
        playerVars.list = playlistId || videoId;
      }

      return (
        <YouTube
          videoId={!isPlaylist ? (videoId || item.content) : undefined}
          opts={{ width: '100%', height: '100%', playerVars }}
          onReady={(e) => {
            if (isAd) {
              adYtPlayerRef.current = e.target;
              e.target.mute();
              e.target.playVideo();
              setTimeout(() => {
                try { e.target.unMute(); e.target.setVolume(100); } catch (err) {}
              }, 600);
            } else {
              ytPlayerRef.current = e.target;
              e.target.mute();
              e.target.playVideo();
              if (!isMuted) {
                setTimeout(() => {
                  try { e.target.unMute(); e.target.setVolume(100); } catch (err) {}
                }, 600);
              }
            }
          }}
          onStateChange={isAd ? (e => e.data === 0 && handleAdEnd()) : displayMode === 'radio' ? (e => e.data === 0 && handleVisualEnd()) : handleAlternateYtState}
          onError={(e) => {
            console.warn('Visual YouTube error, skipping:', e);
            if (isAd) handleAdEnd();
            else if (displayMode === 'radio') handleVisualEnd();
            else handleAlternateVideoEnd();
          }}
          className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
        />
      );
    }

    return null;
  };

  // Render Background Audio Player (Radio mode only)
  const renderBackgroundAudio = () => {
    if (displayMode !== 'radio' || audioPlaylist.length === 0) return null;
    const item = audioPlaylist[currentAudioIndex];
    if (!item) return null;

    const { videoId, playlistId } = extractYt(item.content);
    const isPlaylist = item.mediaType === 'youtube_playlist' || (!videoId && !!playlistId);

    const playerVars = {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      mute: 1, // Start muted for browser autoplay approval
    };

    if (isPlaylist) {
      playerVars.listType = 'playlist';
      playerVars.list = playlistId || videoId;
    }

    return (
      <div
        key={`audio-${currentAudioIndex}-${item.id || item.content}`}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: '200px',
          height: '200px',
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -999,
        }}
      >
        <YouTube
          videoId={!isPlaylist ? (videoId || item.content) : undefined}
          opts={{ width: '200', height: '200', playerVars }}
          onReady={(e) => {
            audioPlayerRef.current = e.target;
            try {
              e.target.mute();
              e.target.playVideo();
              setTimeout(() => {
                try {
                  e.target.unMute();
                  e.target.setVolume(100);
                } catch (err) {}
              }, 600);
            } catch (err) {}
          }}
          onStateChange={(e) => {
            // Video ended: advance to next song in radio playlist
            if (e.data === 0) {
              handleAudioEnd();
            }
          }}
          onError={(e) => {
            console.warn('Audio track error, advancing to next song:', e);
            handleAudioEnd();
          }}
          className="w-full h-full"
        />
      </div>
    );
  };

  // Empty state check
  if (!tvCode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <h1 className="text-2xl font-bold">Código não encontrado</h1>
      </div>
    );
  }

  const isCompletelyEmpty =
    displayMode === 'alternate'
      ? playlist.length === 0
      : visualPlaylist.length === 0 && audioPlaylist.length === 0;

  if (isCompletelyEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl shadow-2xl flex flex-col items-center max-w-lg text-center animate-pulse">
          <QRCodeSVG
            value={'https://tvmax.vercel.app/' + tvCode}
            size={200}
            bgColor="#0f172a"
            fgColor="#3b82f6"
            level="H"
            includeMargin
            className="rounded-xl mb-8 shadow-xl"
          />
          <h1 className="text-4xl font-black mb-4 tracking-tight">
            TV: <span className="text-blue-500">{tvCode}</span>
          </h1>
          <p className="text-slate-400">Nenhum conteúdo configurado. Acesse o painel e sincronize.</p>
        </div>
      </div>
    );
  }

  const activeVisualItem =
    displayMode === 'alternate' ? playlist[currentIndex] : visualPlaylist[currentVisualIndex];

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative font-sans select-none">
      {/* VISUAL LAYER */}
      <div className="absolute inset-0 z-0">
        {activeVisualItem ? (
          renderVisualMedia(activeVisualItem, false)
        ) : displayMode === 'radio' && audioPlaylist.length > 0 ? (
          /* Ambient screen if radio mode has audio but no visual items */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="relative flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-purple-600/20 animate-ping absolute" />
              <div className="w-32 h-32 rounded-full bg-purple-600/30 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                <span className="text-5xl">🎵</span>
              </div>
            </div>
            <h2 className="text-white text-3xl font-black mt-8 tracking-wide">TVMax Rádio</h2>
            <p className="text-purple-300 text-lg mt-2">Trilha sonora em execução</p>
          </div>
        ) : null}
      </div>

      {/* BACKGROUND AUDIO PLAYER (Radio Mode) */}
      {renderBackgroundAudio()}

      {/* AD OVERLAY LAYER */}
      {currentPlayingAd && (
        <div className="absolute inset-0 z-10 bg-black animate-fade-in">
          {renderVisualMedia(currentPlayingAd, true)}
          <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10 uppercase tracking-widest shadow-2xl">
            Patrocínio
          </div>
        </div>
      )}

      {/* CUSTOM TICKER */}
      {tickerText && !newsTicker && (
        <div className="absolute bottom-0 w-full bg-blue-600 text-white font-bold text-3xl py-4 z-[30] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="animate-ticker whitespace-nowrap inline-block pl-[100%] pr-[100%] tracking-wide">
            {tickerText}
          </div>
        </div>
      )}

      {/* G1 NEWS TICKER */}
      {newsTicker && <NewsTicker source="g1" />}

      {/* CLOCK */}
      {clockConfig && (
        <div className={'absolute top-8 right-8 z-[40] ' + (currentPlayingAd ? 'hidden' : '')}>
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl shadow-2xl flex flex-col items-center">
            <span className="text-white text-5xl font-black tabular-nums tracking-tight drop-shadow-lg">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
