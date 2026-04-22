const processInitialData = (inputPayload) => {
  const lines = inputPayload.trim().split("\n");
  const primaryText = lines[0];
  const desiredRank = globalThis.parseInt(lines[1], 10);
  return [primaryText, desiredRank];
};

const acquireSortedStarters = (inputSource) => {
  return Array.from(new Set(inputSource)).sort();
};

function* generateUniqueCharactersInOrder(sourceContent, sortedStarters) {
  for (const currentSymbol of sortedStarters) {
    for (let charPosition = 0; charPosition < sourceContent.length; ++charPosition) {
      // The original code's condition `str.slice(i, i + j) !== initials[index]`
      // when `initials[index]` is a single character, effectively means that
      // only single characters can ever be added to the set.
      // If `j > 1`, `str.slice(i, i + j)` will be a string of length > 1 (or 1 if truncated at end of string),
      // which will always be different from a single character `initials[index]`.
      // Thus, the inner loop always 'continues' (breaks) after j=1.
      // This generator faithfully reproduces that behavior by only yielding single characters.
      if (sourceContent[charPosition] === currentSymbol) {
        yield currentSymbol;
      }
    }
  }
}

const determineRankedElement = (dataStream) => {
  const [baseString, lookupRank] = processInitialData(dataStream);
  const orderedLeaders = acquireSortedStarters(baseString);

  const collectedUniqueSymbols = new Set();
  const symbolGenerator = generateUniqueCharactersInOrder(baseString, orderedLeaders);

  for (const potentialSymbol of symbolGenerator) {
    collectedUniqueSymbols.add(potentialSymbol);
    if (collectedUniqueSymbols.size >= lookupRank) {
      break;
    }
  }

  const finalSortedSymbols = Array.from(collectedUniqueSymbols).sort();
  return finalSortedSymbols[lookupRank - 1];
};

const getSystemResource = (resourcePath) => {
  const systemIO = globalThis.require("fs");
  return systemIO.readFileSync(resourcePath, "utf8");
};

(() => {
  const inputData = getSystemResource("/dev/stdin");
  const finalAnswer = determineRankedElement(inputData);
  globalThis.console.log(finalAnswer);
})();