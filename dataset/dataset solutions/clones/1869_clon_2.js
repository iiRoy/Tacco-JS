/* This script processes numerical input from standard input. */
const PrimaryHandler = ( sourceText ) => {
  // Split the entire input string by spaces to get individual numeric parts.
  const numericStrings = sourceText.split(" ");

  // Parse the first number from the obtained segments.
  const firstNumber = parseInt( numericStrings[0], 10 ); // Base 10 integer conversion.
  /* Convert the second part into an integer. */
  const secondNumber = parseInt(numericStrings[1], 10);
  // The third segment is also converted, though its value isn't used in subsequent logic.
  const thirdNumber = parseInt(numericStrings[2], 10);
  // Finally, parse the fourth segment which represents the required total.
  const targetSum = parseInt(numericStrings[3], 10);

  // Evaluate if the sum of the first two numbers meets or exceeds the target.
  if ( (firstNumber + secondNumber) >= targetSum ) {
    // If the condition is met, output the value of the first number.
    console.log(firstNumber);
  }
  else {
    /* If the sum is less than the target, calculate the difference
       between the target and the current sum, and subtract this
       difference from the first number. This effectively finds
       how much the first number needs to be reduced if the second number
       is fully utilized to reach the target, and then some.
    */
    console.log(firstNumber - (targetSum - firstNumber - secondNumber));
  }
}; // End of the main processing function.


// Invoke the primary processing function with data read from standard input.
PrimaryHandler(require("fs").readFileSync("/dev/stdin", "utf8"));