const fs = require('fs');
const file = 'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/TvDisplay.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update listener logic
content = content.replace(
  /if \(mode === 'radio'\) \{\s*setAudioPlaylist\(rawPlaylist\.filter\(i => i\.mediaType === 'youtube' \|\| i\.mediaType === 'youtube_playlist'\)\);\s*setVisualPlaylist\(rawPlaylist\.filter\(i => i\.mediaType !== 'youtube' && i\.mediaType !== 'youtube_playlist' && i\.mediaType !== 'news'\)\);\s*\}/,
  `if (mode === 'radio') {
          setAudioPlaylist(data.audioPlaylist || []);
          setVisualPlaylist(rawPlaylist.filter(i => i.mediaType !== 'news'));
        }`
);

// Disable ads in Radio Mode
content = content.replace(
  /const ads = data\.config\?\.ads || \{ enabled: false, items: \[\] \};\s*ads\.items = \(ads\.items || \[\]\)\.filter\(i => i\.mediaType !== 'news'\);\s*setAdsConfig\(ads\);/,
  `const ads = data.config?.ads || { enabled: false, items: [] };
        ads.items = (ads.items || []).filter(i => i.mediaType !== 'news');
        if (mode === 'radio') ads.enabled = false; // Disable timed interruptions in Radio mode
        setAdsConfig(ads);`
);

fs.writeFileSync(file, content, 'utf8');
console.log('TvDisplay updated!');
