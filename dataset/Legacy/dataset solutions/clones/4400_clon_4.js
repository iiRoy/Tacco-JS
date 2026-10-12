'use strict';

const nextAlphabeticalLookup = {
  'a': 'b', 'b': 'c', 'c': 'd', 'd': 'e', 'e': 'f', 'f': 'g', 'g': 'h', 'h': 'i', 'i': 'j', 'j': 'k', 'k': 'l', 'l': 'm', 'm': 'n', 'n': 'o', 'o': 'p', 'p': 'q', 'q': 'r', 'r': 's', 's': 't', 't': 'u', 'u': 'v', 'v': 'w', 'w': 'x', 'x': 'y', 'y': 'z', 'z': 'None'
};

const determineSuccessorSymbol = (currentSymbol) => {
  return nextAlphabeticalLookup[currentSymbol];
};

const findMinimumAlphabeticalSymbol = (sourceText) => {
  const validSymbols = Array.from(sourceText)
    .filter(symbol => symbol >= 'a' && symbol <= 'z');

  if (validSymbols.length === 0) {
    return null;
  }

  const minimumSymbol = validSymbols.reduce((min, current) => {
    return current < min ? current : min;
  }, 'z');

  return minimumSymbol;
};

function processInputData(sourceText) {
  const smallestPresentAlphabetical = findMinimumAlphabeticalSymbol(sourceText);

  if (smallestPresentAlphabetical === null) {
    console.log('a');
  } else {
    console.log(determineSuccessorSymbol(smallestPresentAlphabetical));
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
