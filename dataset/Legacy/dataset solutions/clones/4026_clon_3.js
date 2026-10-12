const fileSystem = require('fs');

function processInputData(rawData) {
  const RADIX_DECIMAL = 10;

  const lines = rawData.split('\n');

  const firstLineContent = lines[0];
  const itemCount = parseInt(firstLineContent, RADIX_DECIMAL);

  const numberStringsLine = lines[1];
  let parsedNumbers = numberStringsLine.split(' ').map(numStr => parseInt(numStr, RADIX_DECIMAL));

  parsedNumbers.sort((a, b) => b - a);

  let scoreA = 0;
  let scoreB = 0;

  for (let currentIndex = 0; currentIndex < parsedNumbers.length; currentIndex++) {
    const currentValue = parsedNumbers[currentIndex];
    if (currentIndex % 2 === 0) {
      scoreA += currentValue;
    } else {
      scoreB += currentValue;
    }
  }

  const finalDifference = scoreA - scoreB;
  console.log(finalDifference);
}

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
processInputData(rawData);
