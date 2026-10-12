function processInputData(inputLines) {
  const [totalItems, maxCapacity, thresholdValue] = convertLineToNumbers(inputLines[0]);
  const itemValues = convertLineToNumbers(inputLines[1]);

  const itemsAboveThreshold = itemValues.reduce((count, currentItem) => {
    return count + (currentItem > thresholdValue ? 1 : 0);
  }, 0);

  console.log(Math.min(itemsAboveThreshold, maxCapacity - itemsAboveThreshold));
}

function convertLineToNumbers(textLine) {
  return textLine.split(' ').map(Number);
}

let accumulatedInputString = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
  accumulatedInputString += dataSegment;
});
process.stdin.on('end', function() {
  const parsedInputLines = accumulatedInputString.split('\n');
  processInputData(parsedInputLines);
});
