const fs = require('fs');
const file = 'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add audioPlaylist state
content = content.replace(
  /const \[signagePlaylist, setSignagePlaylist\] = useState\(\[\]\);/,
  "const [signagePlaylist, setSignagePlaylist] = useState([]);\n  const [audioPlaylist, setAudioPlaylist] = useState([]);"
);

// 2. Read DB
content = content.replace(
  /setSignagePlaylist\(rawPlaylist\);/,
  "setSignagePlaylist(rawPlaylist);\n        setAudioPlaylist(data.audioPlaylist || []);"
);

// 3. Clear DB
content = content.replace(
  /setSignagePlaylist\(\[\]\);\s*setAdsPlaylist\(\[\]\);/,
  "setSignagePlaylist([]);\n      setAudioPlaylist([]);\n      setAdsPlaylist([]);"
);

// 4. Save DB (in openTvManager)
content = content.replace(
  /playlist: signagePlaylist,/,
  "playlist: signagePlaylist,\n          audioPlaylist: audioPlaylist,"
);

// 5. Save Workspace (in saveWorkspace)
content = content.replace(
  /playlist: signagePlaylist,/,
  "playlist: signagePlaylist,\n        audioPlaylist: audioPlaylist,"
);

// 6. Handle Drop
content = content.replace(
  /if \(listType === 'signage'\) \{\s*const newItems = \[\.\.\.signagePlaylist\];\s*const \[draggedItem\] = newItems\.splice\(draggedItemIndex, 1\);\s*newItems\.splice\(targetIndex, 0, draggedItem\);\s*setSignagePlaylist\(newItems\);\s*\} else \{/s,
  `if (listType === 'signage') {
      const newItems = [...signagePlaylist];
      const [draggedItem] = newItems.splice(draggedItemIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      setSignagePlaylist(newItems);
    } else if (listType === 'audio') {
      const newItems = [...audioPlaylist];
      const [draggedItem] = newItems.splice(draggedItemIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      setAudioPlaylist(newItems);
    } else {`
);

// 7. Append Media
content = content.replace(
  /if \(listType === 'signage'\) setSignagePlaylist\(prev => \[\.\.\.prev, newItem\]\);\s*else setAdsPlaylist\(prev => \[\.\.\.prev, newItem\]\);/s,
  `if (listType === 'signage') setSignagePlaylist(prev => [...prev, newItem]);
    else if (listType === 'audio') setAudioPlaylist(prev => [...prev, newItem]);
    else setAdsPlaylist(prev => [...prev, newItem]);`
);

// 8. Update Duration
content = content.replace(
  /if \(listType === 'signage'\) setSignagePlaylist\(prev => prev\.map\(item => item\.id === id \? \{ \.\.\.item, durationSeconds: num \} : item\)\);\s*else setAdsPlaylist\(prev => prev\.map\(item => item\.id === id \? \{ \.\.\.item, durationSeconds: num \} : item\)\);/s,
  `if (listType === 'signage') setSignagePlaylist(prev => prev.map(item => item.id === id ? { ...item, durationSeconds: num } : item));
    else if (listType === 'audio') setAudioPlaylist(prev => prev.map(item => item.id === id ? { ...item, durationSeconds: num } : item));
    else setAdsPlaylist(prev => prev.map(item => item.id === id ? { ...item, durationSeconds: num } : item));`
);

// 9. Delete Item
content = content.replace(
  /if \(listType === 'signage'\) setSignagePlaylist\(prev => prev\.filter\(i => i\.id !== id\)\);\s*else setAdsPlaylist\(prev => prev\.filter\(i => i\.id !== id\)\);/s,
  `if (listType === 'signage') setSignagePlaylist(prev => prev.filter(i => i.id !== id));
    else if (listType === 'audio') setAudioPlaylist(prev => prev.filter(i => i.id !== id));
    else setAdsPlaylist(prev => prev.filter(i => i.id !== id));`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Script ran!');
