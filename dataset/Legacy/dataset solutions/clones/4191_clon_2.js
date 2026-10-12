ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * This function processes the given input string.
 * It calculates the sum of digits of a number and checks for divisibility.
 */
function ProcessInput(inputData) {
  // Parse the input string into an integer, using base 10.
  let initialNumber = parseInt(inputData, 10);

  // Create a temporary variable to manipulate for digit sum calculation.
  let temporaryValue = initialNumber;

  // Initialize a variable to store the sum of digits.
  let digitSum = 0;

  // Loop while the temporary value is greater than zero.
  while (temporaryValue) {
    // Add the last digit to the sum.
    digitSum += temporaryValue % 10;

    // Remove the last digit by integer division.
    temporaryValue = Math.floor(temporaryValue / 10);
  }

  // Check if the original number is perfectly divisible by its sum of digits.
  // Output 'Yes' if it is, otherwise 'No'.
  console.log(initialNumber % digitSum === 0 ? "Yes" : "No");
}
