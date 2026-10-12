function ProcessInput(rawData) {
  "use strict";
  // Split the entire input string by newline characters to get individual data rows.
  const dataRows = rawData.split("\n");

  // Parse the first line to determine the total count of numerical items.
  const itemCount = parseInt(dataRows[0], 10);

  // Process the second line: split by space, then convert each string segment to an integer.
  const numericValues = dataRows[1].split(" ").map(strNum => parseInt(strNum, 10));

  // Initialize the variable that will accumulate the final calculated sum.
  let finalResult = 0;

  // Set up the initial 'current' and 'next' values for the iterative process.
  let currentVal = 0;
  let nextVal = numericValues[0]; // The first element of the array starts as 'next'.

  // Iterate through the numeric values, stopping one element before the end,
  // as 'nextVal' will always look one step ahead.
  for (let idx = 0; idx < itemCount - 1; idx++) {
    // Update the 'current' value to what 'next' was in the previous step.
    currentVal = nextVal;
    // Update 'next' value to the subsequent element in the array.
    nextVal = numericValues[idx + 1];

    // Condition 1: Both current and next values have the same sign (both non-negative or both negative).
    if ((currentVal >= 0 && nextVal >= 0) || (currentVal < 0 && nextVal < 0)) {
      finalResult += Math.abs(currentVal); // Add the absolute value of the current number.
      nextVal = Math.abs(nextVal);         // Transform the next number to its absolute value.
      continue; // Proceed to the next iteration of the loop.
    }
    // Condition 2: Current value is non-negative, and next value is negative.
    else if (currentVal >= 0 && nextVal < 0) {
      // Sub-condition 2a: If the current value is numerically larger than the absolute next value.
      if (currentVal > Math.abs(nextVal)) {
        finalResult += currentVal; // Add the current value directly to the result.
      }
      // Sub-condition 2b: Otherwise (current value is less than or equal to absolute next value).
      else {
        // Look two steps ahead in the original array to decide the operation.
        if (numericValues[idx + 2] >= 0) {
          finalResult += currentVal; // Add the current value.
        } else {
          finalResult -= currentVal; // Subtract the current value.
          nextVal = -nextVal;        // Invert the sign of the next value.
        }
      }
      continue; // Proceed to the next iteration.
    }
    // Condition 3: Current value is negative, and next value is non-negative.
    else { // This implicitly covers the case where currentVal < 0 and nextVal >= 0.
      // Sub-condition 3a: If the absolute current value is numerically larger than the next value.
      if (Math.abs(currentVal) > nextVal) {
        finalResult -= currentVal; // Subtract the current value.
        nextVal = -nextVal;        // Invert the sign of the next value.
      }
      // Sub-condition 3b: Otherwise (absolute current value is less than or equal to next value).
      else {
        // Look two steps ahead in the original array to decide the operation.
        if (numericValues[idx + 2] < 0) {
          finalResult -= currentVal; // Subtract the current value.
          nextVal = -nextVal;        // Invert the sign of the next value.
        } else {
          finalResult += currentVal; // Add the current value.
        }
      }
      continue; // Proceed to the next iteration.
    }
  }

  // After the loop completes, add the final 'nextVal' (which holds the last processed value)
  // to the accumulated result and print the total to the console.
  console.log(finalResult + nextVal);
}

// Read the entire content of standard input synchronously using Node.js 'fs' module,
// then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
