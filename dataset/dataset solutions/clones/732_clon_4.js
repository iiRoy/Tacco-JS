const qL = require('readline');
const streamProcessor = qL.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let collectedLines = [];

streamProcessor.on('line', (currentLineData) => {
  collectedLines.push(currentLineData);
});

streamProcessor.on('close', () => {
  collectedLines.forEach(inputDatum => {
    const parsedValues = inputDatum.split(' ').map(Number);

    if (parsedValues[0] || parsedValues[1] || parsedValues[2]) {
      const paramOne = parsedValues[0];
      const paramTwo = parsedValues[1];
      const targetSum = parsedValues[2];

      const multiplierOne = paramOne / 100 + 1;
      const multiplierTwo = paramTwo / 100 + 1;

      let resultAccumulator = 0;

      const iterationRange = Array.from({ length: 999 }, (_, index) => index + 1);

      const calculatedOutcomes = iterationRange.flatMap(primaryVal => {
        return iterationRange.map(secondaryVal => {
          return { primaryVal, secondaryVal };
        })
        .filter(pairOfVals => {
          return Math.floor(pairOfVals.primaryVal * multiplierOne) + Math.floor(pairOfVals.secondaryVal * multiplierOne) === targetSum;
        })
        .map(pairOfVals => {
          return Math.floor(pairOfVals.primaryVal * multiplierTwo) + Math.floor(pairOfVals.secondaryVal * multiplierTwo);
        });
      });

      if (calculatedOutcomes.length > 0) {
        resultAccumulator = Math.max(...calculatedOutcomes);
      }
      console.log(resultAccumulator);
    }
  });
});