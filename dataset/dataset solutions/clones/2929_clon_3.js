function processData(rawDataString) {
  const inputParts = rawDataString.split(" ");

  const growthFactor = Number(inputParts[0]);
  const subtractionAmount = Number(inputParts[1]);
  const startingValue = Number(inputParts[2]);

  const numberOfIterations = 10;

  let calculatedSequence = [];
  calculatedSequence[0] = startingValue;

  for (let currentIteration = 1; currentIteration <= numberOfIterations; currentIteration++) {
    const previousSequenceValue = calculatedSequence[currentIteration - 1];
    const currentCalculatedValue = growthFactor * previousSequenceValue - subtractionAmount;
    
    calculatedSequence[currentIteration] = currentCalculatedValue;
    console.log(currentCalculatedValue);
  }
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
