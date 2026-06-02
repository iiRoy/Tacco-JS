function processInputData(rawInputString) {
  let targetValue = parseInt(rawInputString);

  if (targetValue === 1) {
    return console.log(0);
  }

  const encounteredUniqueProducts = new Set();
  let currentFactorProduct = 0;
  let lastFactorEncountered = 0;

  const factorList = decomposeIntoPrimeFactors(targetValue);

  for (const currentFactor of factorList) {
    if (lastFactorEncountered !== currentFactor) {
      currentFactorProduct = currentFactor;
    } else {
      currentFactorProduct *= currentFactor;
    }

    encounteredUniqueProducts.add(currentFactorProduct);
    lastFactorEncountered = currentFactor;
  }

  console.log(encounteredUniqueProducts.size);
}

function decomposeIntoPrimeFactors(numberToDecompose) {
  const primeFactorsCollection = [];
  let startingDivisor = 2;

  while (numberToDecompose > 1) {
    let divisorCandidate = startingDivisor;
    
    while (true) {
      if (numberToDecompose % divisorCandidate === 0) {
        primeFactorsCollection.push(divisorCandidate);
        numberToDecompose /= divisorCandidate;
        break;
      }
      divisorCandidate++;
    }
    startingDivisor = divisorCandidate;
  }
  return primeFactorsCollection;
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
