const sourceData = require('fs')
  .readFileSync('/dev/stdin', 'utf8') // Obtain raw data from standard input
  .split(/\n/); // Divide the input into an array of lines

// Process each entry in the collected data
for (let idx = 0; idx < sourceData.length; idx++) {
  // Check for a specific termination condition
  if (sourceData[idx] === '0') {
    break; // Halt further processing if '0' is encountered
  }

  // Initialize a variable to accumulate the digit sum
  let totalSum = 0;

  // Convert the current line string into an array of numeric digits
  const digitArray = sourceData[idx].split('').map(Number);

  // Iterate through the array of digits to calculate their sum
  for (let k = 0; k < digitArray.length; k++) {
    totalSum += digitArray[k]; // Add the current digit to the running total
  }

  // Display the computed sum for the current line
  console.log(totalSum);
}
