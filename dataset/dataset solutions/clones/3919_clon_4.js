function determineOperations(dataString) {
  const sequencedFigures = dataString.split(' ').map(parseFloat).sort((first, second) => first - second);

  const lowest = sequencedFigures[0];
  const middle = sequencedFigures[1];
  const highest = sequencedFigures[2];

  const sumOfLowerTwoParity = (lowest + middle) % 2;
  const ultimateValue = highest + (sumOfLowerTwoParity === 0 ? 0 : 1);

  const totalDifferenceSum = (ultimateValue - lowest) + (ultimateValue - middle) + (ultimateValue - highest);
  return totalDifferenceSum / 2;
}

function processEntry(inputData) {
  console.log(determineOperations(inputData));
}

processEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));