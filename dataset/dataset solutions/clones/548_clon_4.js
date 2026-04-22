function processNumericalSeries(inputDataset) {
  const parsedLines = inputDataset.split('\n');

  const entryCount = parseInt(parsedLines[0], 10);

  const numericalPairs = parsedLines.slice(1, entryCount + 1).map(segment =>
    segment.split(' ').map(parseFloat)
  );

  const accumulationStrategies = {
    'firstValueGreater': (valA, valB) => [valA + valB, 0],
    'secondValueGreater': (valA, valB) => [0, valA + valB],
    'valuesAreEquivalent': (valA, valB) => [valA, valB]
  };

  const finalResults = numericalPairs.reduce((currentAccumulators, pair) => {
    const primaryValue = pair[0];
    const secondaryValue = pair[1];

    let chosenStrategyKey;
    if (primaryValue > secondaryValue) {
      chosenStrategyKey = 'firstValueGreater';
    } else if (primaryValue < secondaryValue) {
      chosenStrategyKey = 'secondValueGreater';
    } else {
      chosenStrategyKey = 'valuesAreEquivalent';
    }

    const [deltaToFirst, deltaToSecond] = accumulationStrategies[chosenStrategyKey](primaryValue, secondaryValue);

    currentAccumulators[0] += deltaToFirst;
    currentAccumulators[1] += deltaToSecond;

    return currentAccumulators;
  }, [0.0, 0.0]);

  console.log(`${finalResults[0]} ${finalResults[1]}`);
}

let incomingStreamData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunkOfData) {
  incomingStreamData += chunkOfData;
});
process.stdin.on('end', function() {
  processNumericalSeries(incomingStreamData);
});