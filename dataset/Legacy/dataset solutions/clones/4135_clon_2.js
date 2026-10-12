function processInput(dataLines) {
  // Extract and parse the numerical parameters from the first line of input.
  // The first value sets the upper bound for our iteration.
  let upperBound = Number(dataLines[0].split(" ")[0]);
  // The second value defines the minimum acceptable sum of digits.
  let lowerLimit = Number(dataLines[0].split(" ")[1]);
  // The third value specifies the maximum acceptable sum of digits.
  let upperLimitSum = Number(dataLines[0].split(" ")[2]);

  // Initialize a variable to store the cumulative total of qualifying numbers.
  let finalSum = 0;

  // Loop through each integer starting from one up to the determined upper bound.
  for (let currentNumber = 1; currentNumber <= upperBound; currentNumber++) {
    // Convert the current number to its string representation,
    // then split it into an array of individual digit characters.
    // Finally, sum these digits by converting each character back to a number.
    let digitSum = currentNumber.toString().split("").reduce((accumulator, currentDigitChar) => {
      return Number(accumulator) + Number(currentDigitChar);
    }, 0); // The initial value for the accumulator is zero.

    // Check if the calculated sum of digits falls within the specified range (inclusive).
    if (lowerLimit <= digitSum && upperLimitSum >= digitSum) {
      // If the condition is met, add the current number to our running total.
      finalSum += currentNumber;
    }
  }

  // Display the computed final sum to the standard output.
  console.log(finalSum);
}

// Read the entire content from standard input, decode it as UTF-8,
// remove any leading/trailing whitespace, and then split it into an array of lines.
// This array is then passed to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
