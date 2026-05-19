const inputSettings = { sourcePath: '/dev/stdin', lineSeparator: '\n' };

const rawInputContent = require('fs').readFileSync(inputSettings.sourcePath, 'ascii');
const inputLines = rawInputContent.split(inputSettings.lineSeparator);

const [mainTextString, patternCountStr, ...patternArray] = inputLines;
const numPatterns = Number(patternCountStr);
const patternsToSearch = patternArray.slice(0, numPatterns);

function findPatternOccurrences(mainText, searchPattern, baseVal, primeMod) {
  const textLen = mainText.length;
  const patternLen = searchPattern.length;

  if (patternLen === 0) return 1;
  if (patternLen > textLen) return 0;

  const charCodeAtPosition = (str, idx) => str.charCodeAt(idx);

  const computeSegmentHash = (segment) => {
    return Array.from(segment).reduce((accumulator, character) => {
      return (baseVal * accumulator + character.charCodeAt(0)) % primeMod;
    }, 0);
  };

  const targetPatternHash = computeSegmentHash(searchPattern);
  const highestPowerOfBase = Math.pow(baseVal, patternLen - 1) % primeMod;

  let currentWindowHash = computeSegmentHash(mainText.substring(0, patternLen));

  const shiftIndices = Array.from({ length: textLen - patternLen + 1 }, (_, index) => index);

  const matchFound = shiftIndices.some(currentShift => {
    if (targetPatternHash === currentWindowHash) {
      if (searchPattern === mainText.substring(currentShift, currentShift + patternLen)) {
        return true;
      }
    }

    if (currentShift < textLen - patternLen) {
      const charExitingWindow = charCodeAtPosition(mainText, currentShift);
      const charEnteringWindow = charCodeAtPosition(mainText, currentShift + patternLen);

      let nextHashValue = (baseVal * (currentWindowHash - charExitingWindow * highestPowerOfBase) + charEnteringWindow) % primeMod;
      currentWindowHash = (nextHashValue + primeMod) % primeMod;
    }
    return false;
  });

  return matchFound ? 1 : 0;
}

const hashingBase = 256;
const largePrimeModulo = Math.pow(2, 31) - 1;

patternsToSearch.forEach(currentPattern => {
  console.log(findPatternOccurrences(mainTextString, currentPattern, hashingBase, largePrimeModulo));
});
