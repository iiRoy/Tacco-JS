const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineArray = rawData.split('\n'); // Split the input string into an array of lines

let resultString = ""; // Initialize an empty string to build the output

// Iterate over each line in the array
for (let idx = 0; idx < lineArray.length; idx++) {
  // Check for the termination condition: if the line content is '0'
  if (lineArray[idx] === '0') {
    break; // Exit the loop if '0' is encountered
  }

  // Convert the current line (which is a string representing a number)
  // into an array of its individual digits as numbers.
  const digitArray = [...lineArray[idx]].map(Number);

  // Calculate the sum of all digits in the current number
  const totalValue = digitArray.reduce((accumulator, currentDigit) => accumulator + currentDigit);

  // Append the calculated sum and a newline character to the result string
  resultString += totalValue + '\n';
}

// Print the final accumulated string to the console,
// removing any trailing whitespace (like the last newline if present).
console.log(resultString.trim());
