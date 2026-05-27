const fs = require('fs'); // Import the file system module for I/O operations

/**
 * Processes the raw input string to calculate a specific difference.
 * @param {string} rawData The entire input content read from stdin.
 */
function processInput(rawData) {
  // Split the input string into an array of lines
  let lineArray = rawData.split('\n');

  // Parse the first line to get the count of items (N)
  const itemCount = parseInt(lineArray[0], 10);

  // Split the second line by spaces to get string representations of numbers
  let numericValues = lineArray[1].split(' ');

  // Convert string numbers to integers and store them in an array
  numericValues = numericValues.map(numStr => parseInt(numStr, 10));

  // Sort the array in descending order
  numericValues.sort().reverse();

  // Initialize two accumulators for sums
  let sumA = 0;
  let sumB = 0;

  // Iterate through the sorted numbers, distributing them based on index parity
  numericValues.forEach((currentVal, idx) => {
    // If the index is odd, add to sumB; otherwise, add to sumA
    if (idx % 2 !== 0) { // Equivalent to (idx & 1)
      sumB += currentVal;
    } else {
      sumA += currentVal;
    }
  });

  // Calculate the final result as the difference between the two sums
  const finalResult = sumA - sumB;

  // Output the computed result to the console
  console.log(finalResult);
}

// Read the entire content of standard input as a UTF-8 string
const fileContent = fs.readFileSync('/dev/stdin', 'utf8');

// Call the main processing function with the obtained file content
processInput(fileContent);
