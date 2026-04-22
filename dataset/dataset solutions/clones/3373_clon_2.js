function computeProduct(dataSource) {
  const lines = dataSource.split('\n');
  const numericalStrings = lines[0].split(' ');

  const thresholdCount = parseInt(numericalStrings[0]);
  const targetNumber = parseInt(numericalStrings[1]);

  if (thresholdCount === 1) {
    console.log(thresholdCount);
    return 0;
  }

  var factorList = [];

  var currentDivisor = 7;
  var divisorIncrement = 4;

  const determinePrimeFactors = valToFactor => {
    if (valToFactor < 2)
      return [];
    if (valToFactor === 2 || valToFactor === 3 || valToFactor === 5)
      return [valToFactor];
    if (valToFactor % 2 === 0)
      return [2, ...determinePrimeFactors(valToFactor / 2)];
    if (valToFactor % 3 === 0)
      return [3, ...determinePrimeFactors(valToFactor / 3)];
    if (valToFactor % 5 === 0)
      return [5, ...determinePrimeFactors(valToFactor / 5)];

    const upperBound = Math.sqrt(valToFactor);

    while (currentDivisor <= upperBound) {
      if (valToFactor % currentDivisor === 0)
        return [currentDivisor, ...determinePrimeFactors(valToFactor / currentDivisor)];
      currentDivisor += divisorIncrement;
      divisorIncrement = 6 - divisorIncrement;
    }
    return [valToFactor];
  };

  foundFactors = determinePrimeFactors(targetNumber);

  var factorFrequencies = {};

  for (var idx = 0; idx < foundFactors.length; idx++) {
    var individualFactor = foundFactors[idx];
    factorFrequencies[individualFactor] = (factorFrequencies[individualFactor]) ? factorFrequencies[individualFactor] + 1 : 1;
  }

  console.log(factorFrequencies.length);

  if (factorFrequencies.length === 0) {
    console.log(targetNumber);
    return 0;
  }

  var finalProduct = 1;

  var uniqueFactors = Object.keys(factorFrequencies);

  for (var idx = 0; idx < uniqueFactors.length; idx++) {
    if (parseInt(factorFrequencies[uniqueFactors[idx]]) >= thresholdCount) {
      finalProduct = finalProduct * parseInt(uniqueFactors[idx]);
    }
  }

  console.log(finalProduct);
}

computeProduct(require('fs').readFileSync('/dev/stdin', 'utf8'));