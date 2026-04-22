const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const charSequence = Array.from(sourceData)
  .filter(c => /[a-z]/i.test(c))
  .map(c => c.toLowerCase());

const letterCounts = charSequence.reduce((accumulator, character) => {
  accumulator.set(character, (accumulator.get(character) || 0) + 1);
  return accumulator;
}, new Map());

const alphabet = Array.from({ length: 26 }, (_, index) => String.fromCharCode(97 + index));

const formattedLines = alphabet.map(singleLetter => {
  const currentCount = letterCounts.get(singleLetter) || 0;
  return `${singleLetter} : ${currentCount}`;
});

const finalResult = formattedLines.join('\n');

console.log(finalResult);