config = { input: '/dev/stdin', newline: '\n' };

const fileSystemModule = require('fs');
let fileContentSegments = fileSystemModule.readFileSync(config.input, 'ascii')
  .split(config.newline, 2);
let parsedNumbers = fileContentSegments[1].split(' ').map(Number);

let operationCount = performInsertionSort(parsedNumbers);
console.log(parsedNumbers.join(' '));
console.log(operationCount);

function performInsertionSort(dataArray) {
  let totalShifts = 0;
  const arrayLength = dataArray.length;

  for (let currentPosition = 1; currentPosition < arrayLength; currentPosition++) {
    let valueToInsert = dataArray[currentPosition];
    let comparisonPosition = currentPosition - 1;

    while (comparisonPosition >= 0 && dataArray[comparisonPosition] > valueToInsert) {
      dataArray[comparisonPosition + 1] = dataArray[comparisonPosition];
      comparisonPosition--;
      totalShifts++;
    }
    dataArray[comparisonPosition + 1] = valueToInsert;
  }
  return totalShifts;
}
