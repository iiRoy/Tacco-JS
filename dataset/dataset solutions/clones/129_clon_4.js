const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let outcomeTally = 0;
let secondaryTally = 0; // This will always remain zero, mirroring original 'a'

inputReader.on('line', (currentDatum) => {
  let firstSeparator = -1;
  let secondSeparator = -1;
  let cursor = 0;

  while (cursor < currentDatum.length) {
    if (currentDatum[cursor] === ',') {
      if (firstSeparator === -1) {
        firstSeparator = cursor;
      } else {
        secondSeparator = cursor;
        break;
      }
    }
    cursor++;
  }

  const segmentAlpha = currentDatum.substring(0, firstSeparator);
  const segmentBeta = currentDatum.substring(firstSeparator + 1, secondSeparator);
  const segmentGamma = currentDatum.substring(secondSeparator + 1);

  let elementOne = segmentAlpha;
  let elementTwo = segmentBeta;
  let elementThree = segmentGamma;

  // Manual three-element lexicographical sort
  if (elementOne > elementTwo) { [elementOne, elementTwo] = [elementTwo, elementOne]; }
  if (elementTwo > elementThree) { [elementTwo, elementThree] = [elementThree, elementTwo]; }
  if (elementOne > elementTwo) { [elementOne, elementTwo] = [elementTwo, elementOne]; }

  // Original logic: if the second and third sorted elements are not equal, increment 'b'
  if (elementTwo !== elementThree) {
    outcomeTally++;
  }
  // The 'a' counter in the original code is never incremented due to the specific ternary structure.
  // Thus, secondaryTally remains 0.
});

inputReader.on('close', () => {
  process.stdout.write(outcomeTally + '\n' + secondaryTally);
});