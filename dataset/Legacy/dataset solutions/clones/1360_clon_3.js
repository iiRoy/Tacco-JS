function processInput(inputLines) {
  const parseNumericValues = (lineContent) => {
    const stringParts = lineContent.split(/\s+/);
    const RADIX_BASE = 10;
    const valueA = parseInt(stringParts[0], RADIX_BASE);
    const valueB = parseInt(stringParts[1], RADIX_BASE);
    return { valueA, valueB };
  };

  const firstInputLine = inputLines[0];
  const { valueA, valueB } = parseNumericValues(firstInputLine);

  const determineComparisonMessage = (num1, num2) => {
    let comparisonOutcome;
    if (num1 === num2) {
      comparisonOutcome = 'a == b';
    } else if (num1 < num2) {
      comparisonOutcome = 'a < b';
    } else { // This covers the case where num1 > num2
      comparisonOutcome = 'a > b';
    }
    return comparisonOutcome;
  };

  const finalMessage = determineComparisonMessage(valueA, valueB);
  console.log(finalMessage);
}

const receivedDataChunks = [];
process.stdin.on('data', function(incomingChunk) {
  receivedDataChunks.push(incomingChunk);
});

process.stdin.on('end', function() {
  const completeInputString = receivedDataChunks.join('');
  const parsedInputLines = completeInputString.split('\n');
  processInput(parsedInputLines);
});
