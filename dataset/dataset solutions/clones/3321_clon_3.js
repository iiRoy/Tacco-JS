console.log((function(inputDataString) {
  const getInteger = (str) => parseInt(str, 10);
  const getFloat = (str) => parseFloat(str);

  const processedLines = inputDataString.trim().split('\n');

  const firstLineTokens = processedLines.shift().split(' ');
  const totalCoins = getInteger(firstLineTokens[0]);

  const coinSuccessProbabilities = processedLines[0].split(' ').map(getFloat);

  const dpTable = [];
  for (let rowIdx = 0; rowIdx < totalCoins; rowIdx++) {
    dpTable.push(Array(totalCoins + 1).fill(0.0));
  }

  const initialCoinProb = coinSuccessProbabilities[0];
  const initialCoinFailureProb = 1.0 - initialCoinProb;

  dpTable[0][0] = initialCoinFailureProb;
  dpTable[0][1] = initialCoinProb;

  for (let currentCoinIdx = 0; currentCoinIdx < totalCoins - 1; currentCoinIdx++) {
    const nextCoinIdx = currentCoinIdx + 1;
    const probOfNextSuccess = coinSuccessProbabilities[nextCoinIdx];
    const probOfNextFailure = 1.0 - probOfNextSuccess;

    for (let headsSoFar = 0; headsSoFar <= currentCoinIdx + 1; headsSoFar++) {
      const prevProbValue = dpTable[currentCoinIdx][headsSoFar];

      // Case: Next coin is a head
      if (headsSoFar + 1 <= totalCoins) {
        dpTable[nextCoinIdx][headsSoFar + 1] += prevProbValue * probOfNextSuccess;
      }
      // Case: Next coin is a tail
      dpTable[nextCoinIdx][headsSoFar] += prevProbValue * probOfNextFailure;
    }
  }

  const minimumHeadsForSuccess = Math.floor((totalCoins + 1) / 2);
  let accumulatedProbability = 0.0;

  const finalRow = dpTable[totalCoins - 1];
  for (let headsCountFinal = minimumHeadsForSuccess; headsCountFinal <= totalCoins; headsCountFinal++) {
    accumulatedProbability += finalRow[headsCountFinal];
  }

  return accumulatedProbability.toString();

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
