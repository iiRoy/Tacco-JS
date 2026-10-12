console.log((inputData => {
  // Parse the input string into BigInt arrays
  const [[countElements], valueArray] = inputData.trim().split('\n').map(
    rowString => rowString.split(' ').map(BigInt)
  );

  // Iterate through a range determined by the first element of valueArray
  for (let currentIteration = 1n; currentIteration <= valueArray[0]; currentIteration++) {
    // Perform the initial XOR calculation
    let xorResult = (valueArray[0] - currentIteration) ^ (valueArray[1] + currentIteration);

    // Loop through the remaining elements of valueArray, starting from the third
    for (let innerIndex = 2; innerIndex < countElements; innerIndex++) {
      xorResult ^= valueArray[innerIndex]; // Accumulate XOR
    }

    // If the final XOR result is zero, return the current iteration value as a string
    if (!xorResult) {
      return `${currentIteration}`;
    }
  }

  // If no such iteration is found, return '-1'
  return '-1';
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
