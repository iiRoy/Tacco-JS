let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input

const lineData = (rawData.trim()).split("\n"); // Process the raw data: remove leading/trailing whitespace and split into an array of lines

for (let mainIndex = 0; mainIndex < lineData.length; mainIndex++) { // Iterate through the processed lines
  let totalValue = lineData[mainIndex] - 0; // Convert the current line (first number in a block) to a numeric value

  if (totalValue === 0) { // Check if the current total value is zero, which acts as a termination signal
    break; // Exit the loop if the termination condition is met
  }

  let subtotal = 0; // Initialize a variable to accumulate the sum of the next ten values

  for (let subIndex = 0; subIndex < 10; subIndex++) { // Loop to sum the subsequent ten lines
    subtotal += (lineData[mainIndex + subIndex + 1] - 0); // Convert each subsequent line to a number and add it to the subtotal
  }

  console.log(totalValue - subtotal); // Output the difference between the initial total value and the accumulated subtotal

  mainIndex += 10; // Advance the main index by 10 to skip the lines that have just been processed as part of the subtotal
}
