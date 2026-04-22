const checkVocal = (incomingData) => {
  const targetChar = String(incomingData);
  const vocalicCharacters = new Set(['a', 'i', 'u', 'e', 'o']);
  const categorization = vocalicCharacters.has(targetChar) ? 'vowel' : 'consonant';
  return categorization;
};

const fileData = require('node:fs').readFileSync(0);
const textContent = fileData.toString();

console.log(checkVocal(textContent));