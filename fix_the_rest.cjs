const fs = require('fs');
const path = 'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
  'SincronizaÃ§Ã£o concluÃ­da': 'Sincronização concluída',
  'paginaÃ§Ã£o': 'paginação',
  'pÃ¡gina': 'página',
  'atÃ©': 'até',
  'seguranÃ§a': 'segurança',
  'pÃ¡ginas': 'páginas',
  'vÃ­deos': 'vídeos',
  'VÃ­deos': 'Vídeos',
  'vÃ­deo': 'vídeo',
  'VÃ­deo': 'Vídeo',
  'nÃ£o': 'não',
  'extraÃ­dos': 'extraídos',
  'estÃ¡ vazia ou Ã© privada': 'está vazia ou é privada',
  'extraÃ§Ã£o': 'extração',
  'mÃºsica': 'música',
  'mÃºsicas': 'músicas',
  'invisÃ­vel': 'invisível',
  'puxarÃ¡': 'puxará',
  'NavegaÃ§Ã£o': 'Navegação',
  'integraÃ§Ãµes': 'integrações',
  'serviÃ§os': 'serviços',
  'NecessÃ¡ria': 'Necessária',
  'automÃ¡tica': 'automática',
  'CONFIGURAÃ‡Ã•ES': 'CONFIGURAÇÕES',
  'CÃ³digo': 'Código',
  'RecepcÃ£o': 'Recepção',
  'ExibiÃ§Ã£o': 'Exibição',
  'ProgramaÃ§Ã£o': 'Programação',
  'RodÃ­zio': 'Rodízio',
  'sequÃªncia': 'sequência',
  'anÃºncio': 'anúncio',
  'tocarÃ¡': 'tocará',
  'ContÃ­nua': 'Contínua',
  'rodarÃ£o': 'rodarão',
  'RelÃ³gio': 'Relógio',
  'rodapÃ©': 'rodapé',
  'PROGRAMAÃ‡ÃƒO': 'PROGRAMAÇÃO',
  'ANÃšNCIO': 'ANÚNCIO'
};

for (const [bad, good] of Object.entries(replacements)) {
  content = content.split(bad).join(good);
}

fs.writeFileSync(path, content, 'utf8');
console.log("FINAL FIX APPLIED!");
