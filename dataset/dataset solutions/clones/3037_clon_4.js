function obtainRelevantRow(textualData) {
  const trimmedInput = textualData.trim();
  const lineCollection = trimmedInput.split('\n');
  if (lineCollection.length < 2) {
    return '';
  }
  return lineCollection[1];
}

function locateAlternatingSequence(sourceString) {
  let currentDiscovery = null;

  for (let idx = 0; idx < sourceString.length; ++idx) {
    if (sourceString.charAt(idx) !== '#') {
      if (currentDiscovery === null) continue;
      else break;
    }

    let potentialSequence = '';
    let phase = 0; // 0: expecting '#', 1: in '#' block, 2: in '.' block
    let observedHash = false;
    let observedDot = false;

    for (let subIdx = idx; subIdx < sourceString.length; ++subIdx) {
      const char = sourceString.charAt(subIdx);

      if (phase === 0) {
        if (char === '#') {
          potentialSequence += '#';
          observedHash = true;
          phase = 1;
        } else {
          break;
        }
      } else if (phase === 1) {
        if (char === '#') {
          potentialSequence += '#';
        } else if (char === '.') {
          potentialSequence += '.';
          observedDot = true;
          phase = 2;
        } else {
          break;
        }
      } else if (phase === 2) {
        if (char === '.') {
          potentialSequence += '.';
        } else if (char === '#') {
          potentialSequence += '#';
          phase = 1;
        } else {
          break;
        }
      }
    }

    if (observedHash && observedDot) {
      currentDiscovery = potentialSequence;
      break;
    }
  }
  return currentDiscovery;
}

function tallyCharacterOccurrences(phrase, targetSymbol) {
  if (!phrase) return 0;
  let currentCount = 0;
  for (let k = 0; k < phrase.length; ++k) {
    if (phrase.charAt(k) === targetSymbol) {
      currentCount++;
    }
  }
  return currentCount;
}

function executeAnalysis(fullInputData) {
  const pertinentRow = obtainRelevantRow(fullInputData);
  const identifiedSegment = locateAlternatingSequence(pertinentRow);

  let periodCount = 0;
  let hashCount = 0;

  if (identifiedSegment) {
    periodCount = tallyCharacterOccurrences(identifiedSegment, '.');
    hashCount = identifiedSegment.length - periodCount;
  }

  console.log(Math.min(periodCount, hashCount));
}

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
executeAnalysis(rawInput);