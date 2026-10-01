const fs = require('fs');
const path = 'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

console.log("Found PainÃ©is:", content.includes('PainÃ©is'));
console.log("Found Painéis:", content.includes('Painéis'));

const utf8Fixes = {
  'PainÃ©is': 'Painéis',
  'ConfiguraÃ§Ãµes': 'Configurações',
  'CÃ³DIGO': 'CÓDIGO',
  'RecepÃ§Ã£o': 'Recepção',
  'VÃ­deos': 'Vídeos',
  'AnÃºncios': 'Anúncios',
  'PatrocÃ­nios': 'Patrocínios',
  'RÃ¡dio': 'Rádio',
  'PlantÃ£o': 'Plantão',
  'PadrÃ£o': 'Padrão',
  'NotÃ­cias': 'Notícias',
  'DinÃ¢mico': 'Dinâmico',
  'programaçÃ£o': 'programação',
  'ProgramaçÃ£o': 'Programação',
  'ExibiçÃ£o': 'Exibição',
  'MÃ­dia': 'Mídia',
  'invÃ¡lido': 'inválido',
  'OpçÃµes': 'Opções',
  'MÃºsica': 'Música',
  'PatrocÃ­nio': 'Patrocínio'
};

for (const [bad, good] of Object.entries(utf8Fixes)) {
  content = content.split(bad).join(good);
}

// Also fix any variable names that got broken
content = content.replace(/adsBetweenVdeosEnabled/g, 'adsBetweenVideosEnabled');
content = content.replace(/betweenVdeosEnabled/g, 'betweenVideosEnabled');
content = content.replace(/Vdeos/g, 'Vídeos');
content = content.replace(/Exibiǜo/g, 'Exibição');
content = content.replace(/Rdio/g, 'Rádio');
content = content.replace(/Programaǜo/g, 'Programação');

fs.writeFileSync(path, content, 'utf8');
console.log("Done fixing Dashboard.");
