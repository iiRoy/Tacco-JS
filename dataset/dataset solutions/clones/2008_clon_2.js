/*
 * This module processes raw string input to perform a specific numerical calculation.
 * It identifies a converging difference value based on an iterative squaring and square root operation.
 */
function ProcessInputData(rawData)
{
  // Split the raw input string into an array of string tokens using space as delimiter.
  let tokenArray = rawData.split(' ');

  // Extract the first numeric string from the token array.
  let primaryNum = tokenArray[0];

  // Extract the second numeric string, which serves as a constant divisor/subtractor.
  let divisorNum = tokenArray[1];

  // Calculate the initial absolute difference between primaryNum and divisorNum,
  // effectively using Math.sqrt(Math.pow(a - b, 2)) to get absolute value.
  let previousGap = Math.sqrt(Math.pow(primaryNum - divisorNum, 2));

  // Calculate the next difference based on the previous gap and the divisorNum.
  let currentGap = Math.sqrt(Math.pow(previousGap - divisorNum, 2));

  // Iterate while the current calculated gap is greater than the previous one.
  // This loop converges when the gap starts increasing or stabilizes.
  while (currentGap > previousGap)
  {
    // Update the previous gap to the current one for the next iteration.
    previousGap = currentGap;

    // Recalculate the current gap using the newly updated previous gap.
    currentGap = Math.sqrt(Math.pow(previousGap - divisorNum, 2));
  }

  // Output the final converged or stabilized difference to the console.
  console.log(currentGap);
}

// Invoke the main processing function with data read from standard input.
// The file system module is used to synchronously read content from '/dev/stdin' as UTF-8 text.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));