function checkOutcome(collection) {
  const orderedCollection = [...collection].sort((alpha, beta) => alpha - beta);

  if (orderedCollection.length === 0) {
    return false;
  }

  const cumulativeEffect = orderedCollection.reduce((tally, item, index, arr) => {
    const isOdd = item % 2 !== 0;
    const isLargest = (index === arr.length - 1);
    const isGreaterThanOne = item > 1;

    if (isOdd && (isLargest || isGreaterThanOne)) {
      return tally + 1;
    } else {
      return tally;
    }
  }, 0);

  return cumulativeEffect % 2 !== 0;
}

function orchestrateProcess(dataSource) {
  const allNumericTokens = dataSource.split(/\s+/).filter(Boolean).map(str => parseInt(str.trim(), 10));

  const quantity = allNumericTokens[0];

  const numericSequence = allNumericTokens.slice(1, quantity + 1);

  const ultimateVerdict = checkOutcome(numericSequence);

  console.log(ultimateVerdict ? 'first' : 'second');
}

orchestrateProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));