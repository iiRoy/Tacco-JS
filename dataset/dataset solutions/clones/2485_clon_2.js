/*
 * This script processes two numerical inputs provided as a space-separated string.
 * It calculates a specific difference and ensures the result is non-negative.
 */
function ProcessInput(rawData) {
  // Split the incoming string by spaces to get individual components.
  let parsedData = rawData.split(' ');

  // Convert the first component to a numerical value.
  const firstVal = Number(parsedData[0]);

  // Convert the second component to a numerical value.
  const secondVal = Number(parsedData[1]);

  // Calculate the initial resultant value based on the formula.
  let resultantValue = firstVal - secondVal * 2;

  // If the calculated value is negative, reset it to zero.
  if (resultantValue < 0) {
    resultantValue = 0;
  }

  // Output the final calculated value to the console.
  console.log(resultantValue);
}

// Read the entire input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
