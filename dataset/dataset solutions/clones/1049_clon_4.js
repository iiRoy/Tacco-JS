(function processInputAndSolve() {
  const sourceReader = require('fs');
  const rawInput = sourceReader.readFileSync('/dev/stdin', 'utf8');
  const inputSegments = rawInput.trim().split('\n');

  const elementCount = Number(inputSegments.shift());
  const availableElements = inputSegments.shift().split(' ').map(Number);
  const queryCount = Number(inputSegments.shift());
  const targetQueries = inputSegments.shift().split(' ').map(Number);

  const maxTarget = Math.max(...targetQueries);

  const possibleSums = new Array(maxTarget + 1).fill(false);
  possibleSums[0] = true;

  for (const currentElement of availableElements) {
    for (let currentSum = maxTarget; currentSum >= currentElement; currentSum--) {
      possibleSums[currentSum] = possibleSums[currentSum] || possibleSums[currentSum - currentElement];
    }
  }

  targetQueries.forEach(queryValue => {
    if (queryValue <= maxTarget && possibleSums[queryValue]) {
      console.log('yes');
    } else {
      console.log('no');
    }
  });
})();
