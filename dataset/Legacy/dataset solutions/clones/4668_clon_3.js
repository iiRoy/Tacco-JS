const retrieveInputData = () => {
  return require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
};

const inputLines = retrieveInputData();
const targetValue = parseInt(inputLines.shift(), 10);

const determineFactors = (numberToFactor) => {
  const factorCollection = [];
  for (let currentCandidate = 1; currentCandidate * currentCandidate <= numberToFactor; currentCandidate++) {
    if (numberToFactor % currentCandidate === 0) {
      factorCollection.push(currentCandidate);
      const complementaryFactor = numberToFactor / currentCandidate;
      if (currentCandidate !== complementaryFactor) {
        factorCollection.push(complementaryFactor);
      }
    }
  }
  return factorCollection.sort((valA, valB) => valA - valB);
};

const allFactors = determineFactors(targetValue);

let shortestLength = targetValue.toString().length;

allFactors.forEach((factorOne) => {
  const factorTwo = targetValue / factorOne;
  const currentMaxFactor = Math.max(factorOne, factorTwo);
  const currentFactorLength = currentMaxFactor.toString().length;

  if (currentFactorLength < shortestLength) {
    shortestLength = currentFactorLength;
  }
});

console.log(shortestLength);
