function determineDivisibleCount(lowerLimit, upperLimit, divisor) {
  const firstMatchingMultiple = Math.ceil(lowerLimit / divisor) * divisor;
  const lastMatchingMultiple = Math.floor(upperLimit / divisor) * divisor;

  if (firstMatchingMultiple > lastMatchingMultiple) {
    return 0;
  }

  return (lastMatchingMultiple - firstMatchingMultiple) / divisor + 1;
}

function computeRangeExclusions(startBound, endBound, factorA, factorB) {
  const totalNumbers = endBound - startBound + 1;
  const divisibleByA = determineDivisibleCount(startBound, endBound, factorA);
  const divisibleByB = determineDivisibleCount(startBound, endBound, factorB);
  const divisibleByBoth = determineDivisibleCount(startBound, endBound, factorA * factorB);

  return totalNumbers - divisibleByA - divisibleByB + divisibleByBoth;
}

function processInputLinesRecursively(remainingInputString, resultsAccumulator = []) {
  if (remainingInputString.length === 0) {
    return resultsAccumulator;
  }

  const eolIndex = remainingInputString.indexOf('\n');
  const currentLine = eolIndex === -1 ? remainingInputString : remainingInputString.substring(0, eolIndex);
  const restOfString = eolIndex === -1 ? '' : remainingInputString.substring(eolIndex + 1);

  if (currentLine.trim().length > 0) {
    const numberTokens = [];
    let currentToken = '';
    for (let i = 0; i < currentLine.length; i++) {
      const character = currentLine[i];
      if (character === ' ' || character === '\t') {
        if (currentToken.length > 0) {
          numberTokens.push(currentToken);
          currentToken = '';
        }
      } else {
        currentToken += character;
      }
    }
    if (currentToken.length > 0) {
      numberTokens.push(currentToken);
    }

    const valP = Number(numberTokens[0]);
    const valQ = Number(numberTokens[1]);
    const valR = Number(numberTokens[2]);
    const valS = Number(numberTokens[3]);

    resultsAccumulator.push(computeRangeExclusions(valP, valQ, valR, valS));
  }

  return processInputLinesRecursively(restOfString, resultsAccumulator);
}

function performTask(rawTextData) {
  const computedOutcomes = processInputLinesRecursively(rawTextData);
  return computedOutcomes.join('\n');
}

const systemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(performTask(systemInput));