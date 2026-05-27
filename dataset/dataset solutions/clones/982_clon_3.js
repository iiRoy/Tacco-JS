const appConfig = { input: '/dev/stdin', newline: '\n' };

function readAndParseInput(configObj) {
  const fileContent = require('fs').readFileSync(configObj.input, 'ascii');
  const rawLines = fileContent.split(configObj.newline);

  const mainText = rawLines[0];
  const numPatterns = Number(rawLines[1]);
  const patternsToMatch = rawLines.slice(2, 2 + numPatterns);

  return { mainText, numPatterns, patternsToMatch };
}

const { mainText, numPatterns, patternsToMatch } = readAndParseInput(appConfig);

const PRIME_MODULUS = Math.pow(2, 31) - 1;

function findPatternRabinKarp(txtStr, patStr, alphabetSize, primeModulus) {
  const textLen = txtStr.length;
  const patLen = patStr.length;

  if (patLen === 0) {
    return 1;
  }
  if (patLen > textLen) {
    return 0;
  }

  let hashMultiplier = 1;
  for (let k = 0; k < patLen - 1; k++) {
    hashMultiplier = (hashMultiplier * alphabetSize) % primeModulus;
  }

  let patHash = 0;
  let currentTextHash = 0;

  for (let idx = 0; idx < patLen; idx++) {
    patHash = (alphabetSize * patHash + patStr.charCodeAt(idx)) % primeModulus;
    currentTextHash = (alphabetSize * currentTextHash + txtStr.charCodeAt(idx)) % primeModulus;
  }

  for (let shiftVal = 0; shiftVal <= textLen - patLen; shiftVal++) {
    if (patHash === currentTextHash) {
      let isExactMatch = true;
      for (let k = 0; k < patLen; k++) {
        if (patStr.charCodeAt(k) !== txtStr.charCodeAt(shiftVal + k)) {
          isExactMatch = false;
          break;
        }
      }
      if (isExactMatch) {
        return 1;
      }
    }

    if (shiftVal < textLen - patLen) {
      currentTextHash = (alphabetSize * (currentTextHash - txtStr.charCodeAt(shiftVal) * hashMultiplier) + txtStr.charCodeAt(shiftVal + patLen)) % primeModulus;
    }
  }

  return 0;
}

for (const currentPattern of patternsToMatch) {
  console.log(findPatternRabinKarp(mainText, currentPattern, 256, PRIME_MODULUS));
}
