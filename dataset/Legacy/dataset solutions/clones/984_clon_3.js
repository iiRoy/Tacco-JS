const cfg = { input: '/dev/stdin', newline: '\n' };

const fileContents = require('fs').readFileSync(cfg.input, 'ascii');
let inputLines = fileContents.split(cfg.newline);

const mainText = inputLines[0];
const queryCount = Number(inputLines[1]);
const patternsToMatch = inputLines.slice(2, 2 + queryCount);

inputLines = null;

const PRIME_MODULUS = Math.pow(2, 31) - 1;

function performRabinKarpMatching(sourceText, searchPattern, radixBase, primeModulus) {
  const textLength = sourceText.length;
  const indexedSourceText = "_" + sourceText;

  const patternLength = searchPattern.length;
  const indexedSearchPattern = "_" + searchPattern;

  if (patternLength > textLength) {
    return 0;
  }

  let hashMultiplier = 1;
  for (let k = 0; k < patternLength - 1; k++) {
      hashMultiplier = (hashMultiplier * radixBase) % primeModulus;
  }

  let currentPatternHash = 0;
  const currentTextWindowHashes = {};
  currentTextWindowHashes[0] = 0;

  for (let charIndex = 1; charIndex <= patternLength; charIndex++) {
    const patternCharValue = indexedSearchPattern.charCodeAt(charIndex);
    const patternHashTerm = (radixBase * currentPatternHash);
    currentPatternHash = (patternHashTerm + patternCharValue) % primeModulus;

    const textCharValue = indexedSourceText.charCodeAt(charIndex);
    const textHashTerm = (radixBase * currentTextWindowHashes[0]);
    currentTextWindowHashes[0] = (textHashTerm + textCharValue) % primeModulus;
  }

  for (let currentShift = 0; currentShift <= textLength - patternLength; currentShift++) {
    if (currentPatternHash === currentTextWindowHashes[currentShift]) {
      const textWindowSlice = indexedSourceText.slice(currentShift + 1, currentShift + patternLength + 1);
      const patternFullSlice = indexedSearchPattern.slice(1, patternLength + 1);

      if (patternFullSlice === textWindowSlice) {
        return 1;
      }
    }

    if (currentShift < textLength - patternLength) {
      const charToRemove = indexedSourceText.charCodeAt(currentShift + 1);
      const charToAdd = indexedSourceText.charCodeAt(currentShift + patternLength + 1);
      const previousWindowHash = currentTextWindowHashes[currentShift];

      let termToSubtract = (charToRemove * hashMultiplier) % primeModulus;
      let intermediateHash = (previousWindowHash - termToSubtract + primeModulus) % primeModulus;
      let nextWindowHash = (radixBase * intermediateHash + charToAdd) % primeModulus;

      currentTextWindowHashes[currentShift + 1] = nextWindowHash;
    }
  }
  return 0;
}

for (let patternIndex = 0; patternIndex < patternsToMatch.length; patternIndex++) {
  console.log(performRabinKarpMatching(mainText, patternsToMatch[patternIndex], 256, PRIME_MODULUS));
}
