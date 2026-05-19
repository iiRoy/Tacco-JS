const fs = require('fs');

/**
 * Processes the raw input string to find the minimum number of times
 * each number in a sequence can be divided by 2 before becoming odd.
 *
 * @param {string} rawData The complete input string from stdin.
 */
function processInputData(rawData) {
  // The first line of input contains the count of elements.
  // We parse it to an integer.
  let countElements = parseInt(rawData[0]);

  // The second line contains space-separated numbers.
  // We split the input by newline, take the second part, and then split by space.
  let numericArray = rawData.split('\n')[1].split(' ');

  // Convert each string element in the array to an integer.
  numericArray = numericArray.map(elementStr => parseInt(elementStr));

  // Initialize a variable to store the minimum division count found.
  // Start with a sufficiently large number.
  let minimumDivisions = 100; // A reasonable upper bound given typical constraints

  // Iterate through each number in the processed array.
  for (let idx = 0; idx < countElements; ++idx) {
    let currentValue = numericArray[idx]; // Get the current number from the array.
    let divisionCount = 0; // Initialize a counter for divisions by 2 for the current number.

    // Continuously divide the number by 2 as long as it's even.
    while (currentValue % 2 === 0) {
      currentValue /= 2; // Perform the division.
      divisionCount++; // Increment the counter.
    }

    // Update the overall minimum division count if the current number's count is smaller.
    minimumDivisions = Math.min(minimumDivisions, divisionCount);
  }

  // Output the final minimum division count to the console.
  console.log(minimumDivisions);
}

// Read the entire content from standard input synchronously.
const fileContent = fs.readFileSync('/dev/stdin', 'utf8');

// Call the main processing function with the read content.
processInputData(fileContent);
