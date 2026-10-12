'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf8');

let receivedDataBuffer = '';

const calculateFlooredHalf = (inputStringValue) => {
  const parsedNumericValue = Number(inputStringValue);
  const halfOfValue = parsedNumericValue / 2;
  return halfOfValue >>> 0;
};

process.stdin.on('data', (incomingDataChunk) => {
  receivedDataBuffer += incomingDataChunk;
});

const handleEndOfInputProcessing = () => {
  const calculatedEvenPairs = calculateFlooredHalf(receivedDataBuffer);

  // This line intentionally preserves the original code's bug where 'number' is undefined.
  // It will result in a ReferenceError, matching the exact observable behavior of the original.
  const remainderTerm = number % 2;
  const sumExpression = calculatedEvenPairs + remainderTerm;
  const finalOutputValue = calculatedEvenPairs * sumExpression;

  console.log(finalOutputValue);
};

process.stdin.on('end', handleEndOfInputProcessing);
