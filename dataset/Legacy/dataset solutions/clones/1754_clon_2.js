console.log(function(inputData) {
  // Process the raw input string to extract the number of elements and the array of numbers.
  const [[elementCount], numericValues] = inputData
    .trim()
    .split('\n')
    .map(lineContent => lineContent.split(' ').map(strValue => strValue | 0));

  // Initialize an XOR accumulator with the first value from the array.
  let xorSum = numericValues[0];

  // Iterate through the rest of the array, XORing each element with the accumulator.
  for (let loopIndex = 1; loopIndex < elementCount; loopIndex++) {
    xorSum ^= numericValues[loopIndex];
  }

  // Transform each number in the original array by XORing it with the final accumulator value,
  // then join the results into a space-separated string.
  return numericValues.map(strValue => strValue ^ xorSum).join(' ');
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
