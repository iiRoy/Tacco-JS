function createNumericSeries(currentMultiplier, upperMultiplierBound, currentSeries = []) {
  if (currentMultiplier > upperMultiplierBound) {
    return currentSeries;
  }
  currentSeries.push(2019 * currentMultiplier);
  return createNumericSeries(currentMultiplier + 1, upperMultiplierBound, currentSeries);
}

function tallyOccurrences(numberCollection, sourceText, indexPosition = 0, foundTotal = 0) {
  if (indexPosition >= numberCollection.length) {
    return foundTotal;
  }
  const currentNumberString = String(numberCollection[indexPosition]);
  const isContained = sourceText.includes(currentNumberString);
  return tallyOccurrences(
    numberCollection,
    sourceText,
    indexPosition + 1,
    foundTotal + (isContained ? 1 : 0)
  );
}

function executeProcess(incomingData) {
  const generatedSequence = createNumericSeries(1, 99);
  const finalCount = tallyOccurrences(generatedSequence, incomingData);
  console.log(finalCount);
}

executeProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));