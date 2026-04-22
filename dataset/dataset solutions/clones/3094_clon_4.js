const characterMapping = new Map([
  ['A', 'T'],
  ['T', 'A'],
  ['C', 'G']
]);

function getComplementaryBase(baseSymbol) {
  return characterMapping.get(baseSymbol) || 'C';
}

const acquiredSequence = require('fs').readFileSync('/dev/stdin', 'utf8');

console.log(getComplementaryBase(acquiredSequence));