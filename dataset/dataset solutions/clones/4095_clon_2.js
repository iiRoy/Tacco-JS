console.log((inputString => {
  // This function processes input data to determine a specific numerical range.
  // The input string is expected to have two lines:
  // - The first line contains a single integer, which we'll call 'numItems'.
  // - The second line contains a series of space-separated integers, forming 'dataArray'.
  const [[numItems], dataArray] = inputString
    .trim() // Remove any leading or trailing whitespace from the input.
    .split('\n') // Divide the input string into an array of lines.
    .map(lineStr => lineStr.split(' ').map(numStr => parseInt(numStr, 10))); // For each line, split by space and convert parts to integers.

  // Initialize the current lower and upper bounds for our calculation.
  let currentMin = 2;
  let currentMax = 2;

  // Iterate backwards through a specific segment of the 'dataArray'.
  // The loop starts from 'numItems - 2' and goes down to '0'.
  for (let loopIndex = numItems - 2; loopIndex >= 0; loopIndex--) {
    // Check for a condition that indicates an impossible scenario.
    // If this condition is met, the function immediately returns the string '-1'.
    if (currentMax + dataArray[loopIndex + 1] - 1 < dataArray[loopIndex]) {
      return '-1';
    }

    // Update the lower bound ('currentMin') based on the current element of 'dataArray'.
    // This calculation ensures 'currentMin' is a multiple of 'dataArray[loopIndex]'
    // and is greater than or equal to the previous 'currentMin'.
    currentMin = Math.ceil(currentMin / dataArray[loopIndex]) * dataArray[loopIndex];

    // Update the upper bound ('currentMax') in two steps.
    // First, calculate a preliminary 'currentMax' based on the next element in 'dataArray'.
    currentMax = Math.ceil(currentMax / dataArray[loopIndex + 1]) * dataArray[loopIndex + 1] + dataArray[loopIndex + 1] - 1;
    // Second, adjust 'currentMax' to ensure it aligns with 'dataArray[loopIndex]'
    // by subtracting its remainder when divided by 'dataArray[loopIndex]'.
    currentMax -= currentMax % dataArray[loopIndex];
  }

  // After the loop completes, format the final 'currentMin' and adjusted 'currentMax' into a string.
  // The adjustment for 'currentMax' involves adding 'dataArray[0] - 1'.
  return `${currentMin} ${currentMax + dataArray[0] - 1}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Execute the function immediately with content read from standard input.
