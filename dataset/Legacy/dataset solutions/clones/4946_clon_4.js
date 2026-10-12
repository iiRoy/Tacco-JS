'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';
process.stdin.on('data', function(dataChunk) {
  inputBuffer += dataChunk;
});

process.stdin.on('end', function() {
  const parsedNumericStrings = inputBuffer.split(/\s+/);
  const initialNumericSequence = parsedNumericStrings.slice(1, parsedNumericStrings.length - 1).map(numericString => parseInt(numericString));
  console.log(calculateNestedMinSum(initialNumericSequence));
  process.exit(0);
});

function calculateNestedMinSum(currentSequence) {
  if (currentSequence.length === 0) {
    return 0;
  }

  const currentSequenceTotal = currentSequence.reduce((accumulator, value) => accumulator + value, 0);

  let derivedSequence = [];
  if (currentSequence.length > 1) {
    derivedSequence = currentSequence.slice(0, -1).map((_, elementIndex) =>
      Math.min(currentSequence[elementIndex], currentSequence[elementIndex + 1])
    );
  }

  return currentSequenceTotal + calculateNestedMinSum(derivedSequence);
}
