const fs = require('fs');
const file = 'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The exact corrupted strings shown in the image and logs
const fixes = {
  'PainÃ©is': 'Painéis',
  'PainǸis': 'Painéis',
  'Painis': 'Painéis',
  'ConfiguraÃ§Ãµes': 'Configurações',
  'Configuraǜes': 'Configurações',
  'CÃ³DIGO': 'CÓDIGO',
  'CDIGO': 'CÓDIGO',
  'RecepÃ§Ã£o': 'Recepção',
  'Recepo': 'Recepção',
  'VÃ­deos': 'Vídeos',
  'Vdeos': 'Vídeos',
  'AnÃºncios': 'Anúncios',
  'Anncios': 'Anúncios',
  'PatrocÃ­nios': 'Patrocínios',
  'Patrocnios': 'Patrocínios',
  'RÃ¡dio': 'Rádio',
  'Rdio': 'Rádio',
  'PlantÃ£o': 'Plantão',
  'Planto': 'Plantão',
  'PadrÃ£o': 'Padrão',
  'Padro': 'Padrão',
  'NotÃ­cias': 'Notícias',
  'Notcias': 'Notícias',
  'NotÃ­cia': 'Notícia',
  'Notcia': 'Notícia',
  'DinÃ¢mico': 'Dinâmico',
  'Dinmico': 'Dinâmico',
  'programaçÃ£o': 'programação',
  'programao': 'programação',
  'ProgramaçÃ£o': 'Programação',
  'Programao': 'Programação',
  'ExibiçÃ£o': 'Exibição',
  'Exibio': 'Exibição',
  'MÃ­dia': 'Mídia',
  'Mdia': 'Mídia',
  'invÃ¡lido': 'inválido',
  'invlido': 'inválido',
  'OpçÃµes': 'Opções',
  'Opes': 'Opções'
};

for (const [bad, good] of Object.entries(fixes)) {
  content = content.split(bad).join(good);
}

fs.writeFileSync(file, content, 'utf8');
