function processInputData(rawDataString) {
  // This function takes a string of space-separated numbers as input.
  // It then performs a series of conditional checks based on these numbers
  // to determine a specific numerical output.
  let [firstVal, secondVal, thirdVal, targetVal] = rawDataString.split(' ').map(Number);

  // Evaluate conditions to decide which value to log to the console.
  if (firstVal >= targetVal) {
    // If the initial value is greater than or equal to the target, output the target.
    console.log(targetVal);
  } else if ((firstVal + secondVal) >= targetVal) {
    // If the sum of the first two values meets or exceeds the target, output the first value.
    console.log(firstVal);
  } else {
    // Otherwise, calculate a specific difference involving the target and the sum of the first two values.
    console.log(firstVal - (targetVal - (firstVal + secondVal)));
  }
}

// The program execution starts here.
// It reads data from standard input, removes leading/trailing whitespace,
// and then passes this processed string to the main data processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
