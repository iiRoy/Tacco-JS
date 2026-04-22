// This function is designed to process an array of input strings to calculate a specific numerical aggregate.
function calculateRangeSum(dataLines) {

  // Retrieve and parse numerical parameters from the initial line of input.
  // The first numerical component sets the upper boundary for the iteration loop.
  const maximumValue = Number(dataLines[0].split(" ")[0]);
  // The second numerical component establishes the minimum inclusive threshold for a digit sum.
  const minimumAcceptableSum = Number(dataLines[0].split(" ")[1]);
  // The third numerical component defines the maximum inclusive threshold for a digit sum.
  const maximumAcceptableSum = Number(dataLines[0].split(" ")[2]);

  // Initialize a mutable variable to accumulate the final sum of eligible numbers.
  let totalAccumulatedValue = 0;

  // Commence an iterative loop from 1 up to and including the determined maximum value.
  for (let currentNumber = 1; currentNumber <= maximumValue; currentNumber++) {
    // Determine the sum of the digits for the number currently being evaluated.
    // This involves converting the number to its string representation,
    // splitting it into an array of individual digit characters,
    // and then reducing this array by summing up the numerical values of these characters.
    const currentNumberDigitSum = currentNumber
      .toString()
      .split("")
      .reduce((accumulator, digitCharacter) => Number(accumulator) + Number(digitCharacter), 0);

    // Evaluate if the computed sum of digits falls within the predefined acceptable range.
    if (
      currentNumberDigitSum >= minimumAcceptableSum &&
      currentNumberDigitSum <= maximumAcceptableSum
    ) {
      // If the digit sum satisfies the criteria, append the current number to the running total.
      totalAccumulatedValue += currentNumber;
    }
  }

  // Display the final computed aggregated value to the standard output.
  console.log(totalAccumulatedValue);
}

// This is the primary execution block of the script.
// It handles reading input from the standard input stream,
// processes it by removing leading/trailing whitespace and splitting into lines,
// and subsequently invokes the main calculation function with this processed data.
calculateRangeSum(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
    .split("\n")
);