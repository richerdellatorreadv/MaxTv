const fs = require('fs');

const files = [
  'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx',
  'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/TvDisplay.jsx'
];

const replacements = [
  [/Painis/g, 'Painéis'],
  [/Pain.*?is/g, 'Painéis'],
  [/Configura.*?es/g, 'Configurações'],
  [/C.*?DIGO/g, 'CÓDIGO'],
  [/Recepc.*?o/g, 'Recepção'],
  [/Recep.*?o/g, 'Recepção'],
  [/V.*?deos/g, 'Vídeos'],
  [/V.*?deo/g, 'Vídeo'],
  [/v.*?deos/g, 'vídeos'],
  [/v.*?deo/g, 'vídeo'],
  [/An.*?ncios/g, 'Anúncios'],
  [/Patroc.*?nios/g, 'Patrocínios'],
  [/R.*?dio/g, 'Rádio'],
  [/Plant.*?o/g, 'Plantão'],
  [/Padr.*?o/g, 'Padrão'],
  [/Not.*?cias/g, 'Notícias'],
  [/Not.*?cia/g, 'Notícia'],
  [/Din.*?mico/g, 'Dinâmico'],
  [/programa.*?o/g, 'programação'],
  [/Programa.*?o/g, 'Programação'],
  [/Exibi.*?o/g, 'Exibição'],
  [/M.*?dia/g, 'Mídia'],
  [/m.*?dia/g, 'mídia'],
  [/inv.*?lido/g, 'inválido'],
  [/puxar.*?/g, 'puxará'],
  [/Op.*?es/g, 'Opções']
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed encodings!');
