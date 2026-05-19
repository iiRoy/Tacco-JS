console.log((inputData => {
  // This function processes a string containing two space-separated numbers.
  // It calculates a specific value and returns it as a string.
  const [firstNumber, secondNumber] = inputData
    .trim()
    .split(' ')
    .map(currentSegment => currentSegment | 0); // Convert string parts to integers using bitwise OR.

  // Perform the calculation: sum of halves, then ceiling, then format to 0 decimal places.
  return Math.ceil(firstNumber / 2 + secondNumber / 2).toFixed(0);
})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read all data from standard input as a UTF-8 string.
