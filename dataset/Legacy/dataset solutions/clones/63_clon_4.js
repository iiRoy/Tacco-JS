const { createInterface } = require('readline');

const inputSource = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let collectedInputLines = [];

inputSource.on('line', (currentInputLine) => {
  collectedInputLines.push(currentInputLine);
});

inputSource.on('close', () => {
  const [initialCountString, ...numericalValueStrings] = collectedInputLines;
  const processingIterations = parseInt(initialCountString, 10);

  const valuePairs = Array.from({ length: processingIterations }, (_, pairIndex) => {
    const startPosition = pairIndex * 2;
    return [
      BigInt(numericalValueStrings[startPosition]),
      BigInt(numericalValueStrings[startPosition + 1])
    ];
  });

  const processedResults = valuePairs.map(([firstValue, secondValue]) => {
    const aggregatedValue = firstValue + secondValue;
    const stringRepresentation = aggregatedValue.toString();
    return stringRepresentation.length > 80 ? "overflow" : stringRepresentation;
  });

  processedResults.forEach(finalOutput => console.log(finalOutput));
});
