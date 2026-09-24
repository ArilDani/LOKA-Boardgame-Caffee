const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'client/src/data/menuData.js');
let content = fs.readFileSync(targetFile, 'utf8');

const imports = `
import imgBakso from '../assets/img/Bakso ala loka.jpg';
import imgNasiGoreng from '../assets/img/Nasi Goreng Loka.jpg';
import imgMixPlatter from '../assets/img/Mix Platter.jpg';
import imgSeblak from '../assets/img/Seblak ala loka.jpg';
import imgMieNyemek from '../assets/img/Mie Nyemek.jpg';
import imgPisang from '../assets/img/Pisang Goreng Sambal.jpg';
import imgMieInstan from '../assets/img/Mie Instan ala loka.jpg';

import imgJuiceAlpukat from '../assets/img/Juice Alpukat.jpg';
import imgLokacitrus from '../assets/img/Lokalcitrus.jpg';
import imgLokamilk from '../assets/img/Lokamilk.jpg';
import imgLokaOrange from '../assets/img/Lokaorange.jpg';
import imgAirMineral from '../assets/img/Air Mineral.jpg';

import imgLokachino from '../assets/img/Lokachino.jpg';
import imgMangoLokachino from '../assets/img/Manggo Lokachino.jpg';
import imgBerryLokachino from '../assets/img/Berry Lokachino.jpg';
import imgOrangeLokachino from '../assets/img/Orangecino.jpg';
import imgFrenchPress from '../assets/img/French Press.jpg';
import imgLokaV60 from '../assets/img/Loka V60.jpg';
`;

content = content.replace('export const FOOD_ITEMS', imports.trim() + '\n\nexport const FOOD_ITEMS');

content = content.replace("emoji: '🍜', // for f1", "image: imgBakso,")
  .replace("emoji: '🍳',", "image: imgNasiGoreng,")
  .replace("emoji: '🧆',", "image: imgMixPlatter,")
  .replace("emoji: '🌶️',", "image: imgSeblak,")
  .replace("emoji: '🍝',", "image: imgMieNyemek,")
  .replace("emoji: '🍌',", "image: imgPisang,")
  .replace("emoji: '🍜', // for f7", "image: imgMieInstan,") // Need regex or replace all
  .replace("emoji: '🥑',", "image: imgJuiceAlpukat,")
  .replace("emoji: '🍋',", "image: imgLokacitrus,")
  .replace("emoji: '🥛',", "image: imgLokamilk,")
  .replace("emoji: '🍊', // for d4", "image: imgLokaOrange,")
  .replace("emoji: '💧',", "image: imgAirMineral,")
  .replace("emoji: '☕', // for c1", "image: imgLokachino,")
  .replace("emoji: '🥭',", "image: imgMangoLokachino,")
  .replace("emoji: '🫐',", "image: imgBerryLokachino,")
  .replace("emoji: '🍊', // for c4", "image: imgOrangeLokachino,")
  .replace("emoji: '☕', // for c5", "image: imgFrenchPress,")
  .replace("emoji: '☕', // for c6", "image: imgLokaV60,")
  .replace("emoji: '⏱️',", "icon: 'Clock',")
  .replace("emoji: '🎲',", "icon: 'Dices',");

// Wait, the above replaces might conflict since there are multiple '☕', '🍜', '🍊'. 
// It's better to use regex with id match.

const replacements = [
  { id: 'f1', prop: "image: imgBakso," },
  { id: 'f2', prop: "image: imgNasiGoreng," },
  { id: 'f3', prop: "image: imgMixPlatter," },
  { id: 'f4', prop: "image: imgSeblak," },
  { id: 'f5', prop: "image: imgMieNyemek," },
  { id: 'f6', prop: "image: imgPisang," },
  { id: 'f7', prop: "image: imgMieInstan," },
  { id: 'd1', prop: "image: imgJuiceAlpukat," },
  { id: 'd2', prop: "image: imgLokacitrus," },
  { id: 'd3', prop: "image: imgLokamilk," },
  { id: 'd4', prop: "image: imgLokaOrange," },
  { id: 'd5', prop: "image: imgAirMineral," },
  { id: 'c1', prop: "image: imgLokachino," },
  { id: 'c2', prop: "image: imgMangoLokachino," },
  { id: 'c3', prop: "image: imgBerryLokachino," },
  { id: 'c4', prop: "image: imgOrangeLokachino," },
  { id: 'c5', prop: "image: imgFrenchPress," },
  { id: 'c6', prop: "image: imgLokaV60," },
  { id: 'p1', prop: "icon: 'Clock'," },
  { id: 'p2', prop: "icon: 'Dices'," }
];

let finalContent = fs.readFileSync(targetFile, 'utf8');
finalContent = finalContent.replace('export const FOOD_ITEMS', imports.trim() + '\n\nexport const FOOD_ITEMS');

replacements.forEach(r => {
  const regex = new RegExp(`(id:\\s*'${r.id}'[\\s\\S]*?)emoji:\\s*'.*?',`, 'g');
  finalContent = finalContent.replace(regex, `$1${r.prop}`);
});

fs.writeFileSync(targetFile, finalContent);
console.log('done');
