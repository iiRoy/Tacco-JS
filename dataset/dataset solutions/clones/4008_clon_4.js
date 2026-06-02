function processInput(rawData) {
  const cleanedData = rawData.trim();
  const lineSegments = cleanedData.split('\n');
  const firstLineTokens = lineSegments[0].split(' ');
  const firstNumericValue = parseInt(firstLineTokens[0], 10);
  const secondLineElements = lineSegments[1].split(' ');

  const presentSymbols = new Set(secondLineElements);

  const targetSymbols = ['P', 'W', 'G', 'Y'];
  const foundSymbolCount = targetSymbols.reduce((accumulator, currentSymbol) => {
    return accumulator + (presentSymbols.has(currentSymbol) ? 1 : 0);
  }, 0);

  const resultLookup = {
    3: "Three"
  };
  console.log(resultLookup[foundSymbolCount] || "Four");
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
