const discoverCombinations = (sourceContent) => {
  const lineSeries = sourceContent.trim().split('\n');

  const [countAlpha, countBeta, countGamma, countDelta] = lineSeries.shift().split(' ').map(val => +val);

  const dataSets = lineSeries.map(textLine => textLine.split(' ').map(val => +val).sort((n1, n2) => n2 - n1));

  const [setAlpha, setBeta, setGamma] = dataSets;

  const gatheredOutcomes = [];
  const limitingProduct = 3000;

  const indicesForAlpha = Array.from({ length: countAlpha }, (_, i) => i);
  const indicesForBeta = Array.from({ length: countBeta }, (_, i) => i);
  const indicesForGamma = Array.from({ length: countGamma }, (_, i) => i);

  indicesForAlpha.forEach(primaryIndex => {
    indicesForBeta.forEach(secondaryIndex => {
      indicesForGamma.some(tertiaryIndex => {
        if ((primaryIndex + 1) * (secondaryIndex + 1) * (tertiaryIndex + 1) > limitingProduct) {
          return true;
        }
        gatheredOutcomes.push(setAlpha[primaryIndex] + setBeta[secondaryIndex] + setGamma[tertiaryIndex]);
        return false;
      });
    });
  });

  const finalSelection = gatheredOutcomes.sort((valA, valB) => valB - valA).slice(0, countDelta);

  return finalSelection.join('\n');
};

const rawDataPayload = process.stdin.readFileSync(0, 'utf8');
process.stdout.write(discoverCombinations(rawDataPayload));