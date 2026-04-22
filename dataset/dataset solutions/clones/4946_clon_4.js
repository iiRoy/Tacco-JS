const fileSystem = require('fs');

function aggregateValues(initialSet) {
  if (initialSet.length === 0) {
    return 0;
  }

  const currentSum = initialSet.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

  let subsequentSet = [];
  if (initialSet.length > 1) {
    for (let currentPos = 0; currentPos < initialSet.length - 1; currentPos++) {
      subsequentSet.push(Math.min(initialSet[currentPos], initialSet[currentPos + 1]));
    }
  }

  return currentSum + aggregateValues(subsequentSet);
}

const rawInputString = fileSystem.readFileSync('/dev/stdin', 'utf8');

const rawTokensWithEmpties = rawInputString.split(/\s+/);

const relevantTokens = rawTokensWithEmpties.slice(1, rawTokensWithEmpties.length - 1);

const numericSequence = relevantTokens.map(val => Number(val));

process.stdout.write(aggregateValues(numericSequence).toString() + '\n');