// Routine for converting decimal to a base negative two number representation
"use strict"; /* Ensures strict parsing and error handling, good practice */

const DBG_FLAG = false; /* A boolean indicating if the development-specific input should be utilized */
const initialDataString = DBG_FLAG /* The raw textual input obtained from either a predefined debug value or standard input */
  ? "-15" /* Debugging input: a negative integer string */
  : require("fs") /* Module for interacting with the file system */
    .readFileSync("/dev/stdin", "utf8") /* Reads the entire content of standard input synchronously */
    .trim(); /* Removes leading/trailing whitespace from the string */

const transformToNegTwoBase = (sourceString) => { /* Function to perform the base conversion */
  let currentDecimalValue = parseInt(sourceString, 10); /* Converts the input string to an integer, base 10 */
  let outputString = ""; /* Accumulator for the resulting base -2 string */

  while (currentDecimalValue !== 0) { /* Loop continues until the decimal value becomes zero */
    let digitValue = currentDecimalValue % -2; /* Calculates the remainder when divided by -2 */
    currentDecimalValue = Math.trunc(currentDecimalValue / -2); /* Updates the decimal value by integer division with -2, truncating towards zero */

    if (digitValue < 0) { /* If the calculated remainder is negative */
      digitValue = digitValue * -1; /* Convert the negative remainder to its positive equivalent */
      currentDecimalValue += 1; /* Adjust the current decimal value by adding one */
    }

    outputString = String(digitValue) + outputString; /* Prepend the current digit (as a string) to the result */
  }

  console.log(outputString); /* Output the final base -2 string to the console */
};

transformToNegTwoBase(initialDataString); /* Initiate the conversion process with the obtained input data */