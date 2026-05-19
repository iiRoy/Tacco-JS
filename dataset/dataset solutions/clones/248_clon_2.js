const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let textRows = rawData.split('\n'); // Separate the input string into an array of lines

let rowIndex = 0; // Initialize an index for iterating through the lines

// Loop through each line of input, excluding the potential empty last line
while (rowIndex < textRows.length - 1) {
  let currentLine = textRows[rowIndex]; // Get the current line string

  // Convert the current line's characters into an array of numbers
  let digitArray = currentLine.split('').map(Number);

  let nextIterationDigits; // Declare a variable to hold the results of each reduction step

  // Continue the reduction process until only a single digit remains
  while (digitArray.length > 1) {
    nextIterationDigits = []; // Initialize an empty array for the next set of digits

    // Iterate through the current digit array to calculate the sums of adjacent pairs
    for (let idx = 0; idx < digitArray.length - 1; idx++) {
      // Sum two adjacent digits and take the result modulo 10
      nextIterationDigits[idx] = (digitArray[idx] + digitArray[idx + 1]) % 10;
    }

    // Replace the current digit array with the newly calculated array for the next iteration
    digitArray = nextIterationDigits;
  }

  // Print the final single digit result for the current input line
  console.log(digitArray[0]);

  rowIndex++; // Move to the next input line
}
