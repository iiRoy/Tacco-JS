'use strict';
(function(inputSource) {
  const inputLines = inputSource.toString().split('\n');
  const terminationMarker = '0';

  const relevantDataSegments = inputLines.slice(0, inputLines.indexOf(terminationMarker));

  const processedOutcomes = (function(dataChunks) {
    const calculateDeviation = (sampleSizeStr, valueSequenceStr) => {
      const sampleSize = Number(sampleSizeStr);
      const valueSequence = valueSequenceStr.split(' ').map(Number);

      const relevantValues = valueSequence.slice(0, sampleSize);

      const { totalSum, totalSquaredSum } = relevantValues.reduce(
        (accumulator, currentVal) => ({
          totalSum: accumulator.totalSum + currentVal,
          totalSquaredSum: accumulator.totalSquaredSum + (currentVal * currentVal),
        }),
        { totalSum: 0, totalSquaredSum: 0 }
      );

      const averageValue = totalSum / sampleSize;
      const variance = (totalSquaredSum / sampleSize) - (averageValue * averageValue);

      const finalDeviation = Math.sqrt(Math.max(0, variance));

      return finalDeviation.toFixed(8);
    };

    const resultCollection = Array.from({ length: Math.floor(dataChunks.length / 2) }, (_, idx) => idx * 2)
      .map(pairStartIndex => {
        const currentCount = dataChunks[pairStartIndex];
        const currentScores = dataChunks[pairStartIndex + 1];
        return calculateDeviation(currentCount, currentScores);
      });

    return resultCollection.join('\n');

  }(relevantDataSegments));

  console.log(processedOutcomes);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
