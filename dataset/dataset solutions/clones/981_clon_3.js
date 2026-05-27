const inputConfig = { input: 'tmp', newline: '\r\n' };

(function() {
  const fileSystem = require('fs');

  const rawInputLines = fileSystem.readFileSync(inputConfig.input, 'ascii').split(inputConfig.newline);

  const mainTextString = rawInputLines[0];
  const numberOfPatterns = Number(rawInputLines[1]);
  const patternsToMatch = rawInputLines.slice(2, 2 + numberOfPatterns);

  function performRabinKarpMatching(
    targetText,
    searchPattern,
    charSetBase,
    primeModulo
  ) {
    const textLen = targetText.length;
    const patternLen = searchPattern.length;

    const indexedTargetText = "_" + targetText;
    const indexedSearchPattern = "_" + searchPattern;

    let hashPowerMultiplier = 1;
    for (let k = 1; k <= patternLen - 1; k++) {
      hashPowerMultiplier = (hashPowerMultiplier * charSetBase) % primeModulo;
    }

    let currentPatternHash = 0;
    let currentTextWindowHash = 0;

    for (let charIdx = 1; charIdx <= patternLen; charIdx++) {
      currentPatternHash = (charSetBase * currentPatternHash + indexedSearchPattern.charCodeAt(charIdx)) % primeModulo;
      currentTextWindowHash = (charSetBase * currentTextWindowHash + indexedTargetText.charCodeAt(charIdx)) % primeModulo;
    }

    for (let shiftOffset = 0; shiftOffset <= textLen - patternLen; shiftOffset++) {
      if (currentPatternHash === currentTextWindowHash) {
        const patternSubstring = indexedSearchPattern.slice(1, patternLen + 1);
        const textWindowSubstring = indexedTargetText.slice(shiftOffset + 1, shiftOffset + patternLen + 1);

        if (patternSubstring === textWindowSubstring) {
          return 1;
        }
      }

      if (shiftOffset < textLen - patternLen) {
        let nextWindowHash = (
          charSetBase * (currentTextWindowHash - indexedTargetText.charCodeAt(shiftOffset + 1) * hashPowerMultiplier) +
          indexedTargetText.charCodeAt(shiftOffset + patternLen + 1)
        ) % primeModulo;

        if (nextWindowHash < 0) {
          nextWindowHash += primeModulo;
        }
        currentTextWindowHash = nextWindowHash;
      }
    }
    return 0;
  }

  const baseForHashing = 256;
  const largePrimeModulo = Math.pow(2, 31) - 1;

  for (const patternKey in patternsToMatch) {
    console.log(
      performRabinKarpMatching(
        mainTextString,
        patternsToMatch[patternKey],
        baseForHashing,
        largePrimeModulo
      )
    );
  }
})();
