'use strict';

/**
 * Processes raw input data to perform a specific calculation.
 * @param {string} rawData - The entire input string, typically read from a source.
 */
function ProcessInput(rawData) {
  // Divide the incoming data into an array of individual lines.
  const parsedLines = rawData.split("\n");

  // Extract the first line and split it by spaces to get its components.
  const firstLineComponents = parsedLines[0].split(' ');

  // Convert the extracted string components into numerical values.
  const firstVal = Number(firstLineComponents[0]);
  const secondVal = Number(firstLineComponents[1]);
  const limitVal = Number(firstLineComponents[2]);

  // Perform a conditional calculation and output the results.
  // The first output value is 'firstVal - limitVal' if 'firstVal' exceeds 'limitVal', otherwise it's 0.
  // The second output value is 'secondVal' if 'firstVal' exceeds 'limitVal'.
  // Otherwise, if the sum of 'firstVal' and 'secondVal' exceeds 'limitVal', it's 'firstVal + secondVal - limitVal'.
  // In all other cases for the second value, it's 0.
  console.log(
    (firstVal > limitVal ? firstVal - limitVal : 0),
    (firstVal > limitVal ? secondVal : (firstVal + secondVal > limitVal ? firstVal + secondVal - limitVal : 0))
  );
}

// Read the content of standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
