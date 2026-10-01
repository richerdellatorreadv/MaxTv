const fs = require('fs');

const files = [
  'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx',
  'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/TvDisplay.jsx'
];

const fixes = {
  'PainÃ©is': 'Painéis', 'PainǸis': 'Painéis', 'Painis': 'Painéis',
  'ConfiguraÃ§Ãµes': 'Configurações', 'Configuraǜes': 'Configurações', 'Configuraes': 'Configurações',
  'CÃ³DIGO': 'CÓDIGO', 'CDIGO': 'CÓDIGO', 'CDIGO': 'CÓDIGO',
  'RecepÃ§Ã£o': 'Recepção', 'Recepo': 'Recepção', 'Recepo': 'Recepção',
  'VÃ­deos': 'Vídeos', 'Vdeos': 'Vídeos', 'Vdeos': 'Vídeos', 'Vídeos': 'Vídeos',
  'AnÃºncios': 'Anúncios', 'Anncios': 'Anúncios', 'Anncios': 'Anúncios',
  'PatrocÃ­nios': 'Patrocínios', 'Patrocnios': 'Patrocínios', 'Patrocnios': 'Patrocínios',
  'RÃ¡dio': 'Rádio', 'Rdio': 'Rádio', 'Rdio': 'Rádio',
  'PlantÃ£o': 'Plantão', 'Planto': 'Plantão', 'Planto': 'Plantão',
  'PadrÃ£o': 'Padrão', 'Padro': 'Padrão', 'Padro': 'Padrão',
  'NotÃ­cias': 'Notícias', 'Notcias': 'Notícias', 'Notcias': 'Notícias',
  'DinÃ¢mico': 'Dinâmico', 'Dinmico': 'Dinâmico', 'Dinmico': 'Dinâmico',
  'programaçÃ£o': 'programação', 'programao': 'programação', 'programao': 'programação',
  'ProgramaçÃ£o': 'Programação', 'Programao': 'Programação', 'Programao': 'Programação',
  'ExibiçÃ£o': 'Exibição', 'Exibio': 'Exibição', 'Exibio': 'Exibição',
  'MÃ­dia': 'Mídia', 'Mdia': 'Mídia', 'Mdia': 'Mídia',
  'invÃ¡lido': 'inválido', 'invlido': 'inválido', 'invlido': 'inválido',
  'OpçÃµes': 'Opções', 'Opes': 'Opções', 'Opes': 'Opções',
  'PatrocÃ­nio': 'Patrocínio', 'Patrocnio': 'Patrocínio', 'Patrocnio': 'Patrocínio',
  'MÃºsica': 'Música', 'Msica': 'Música', 'Msica': 'Música'
};

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fallback: fix the weird symbol  if we know the context
    content = content.replace(/Pain.is/g, 'Painéis');
    content = content.replace(/Configura..es/g, 'Configurações');
    content = content.replace(/C.DIGO/g, 'CÓDIGO');
    content = content.replace(/Recep..o/g, 'Recepção');
    content = content.replace(/V.deos/g, 'Vídeos');
    content = content.replace(/An.ncios/g, 'Anúncios');
    content = content.replace(/Patroc.nios/g, 'Patrocínios');
    content = content.replace(/Patroc.nio/g, 'Patrocínio');
    content = content.replace(/R.dio/g, 'Rádio');
    content = content.replace(/Plant.o/g, 'Plantão');
    content = content.replace(/Padr.o/g, 'Padrão');
    content = content.replace(/Not.cias/g, 'Notícias');
    content = content.replace(/Din.mico/g, 'Dinâmico');
    content = content.replace(/programa..o/gi, 'Programação');
    content = content.replace(/Exibi..o/g, 'Exibição');
    content = content.replace(/M.dia/g, 'Mídia');
    content = content.replace(/M.sica/g, 'Música');
    content = content.replace(/inv.lido/g, 'inválido');
    content = content.replace(/Op..es/g, 'Opções');

    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('UTF8 Fixed!');
