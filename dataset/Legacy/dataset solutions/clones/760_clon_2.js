// Obtain the necessary file system module to handle input operations.
const dataInputModule = require('fs');

// Read raw data from the standard input stream, specifying UTF-8 encoding.
const rawData = dataInputModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into individual lines.
const dataLines = rawData.trim().split('\n');


// Initialize a counter for processing iterations (this variable is not actively utilized in the current logic).
const loopCounter = 0;

// Iterate through each line of data until no more lines are available.
while (currentLine = dataLines.shift()) {

  // Parse the current line: split by space and convert each segment to a number.
  const parsedNumbers = currentLine.split(' ').map(Number);

  // Extract the first number, which represents the intended length of the subsequent data array.
  let dataLength = parsedNumbers[0];

  // Validate the extracted length: if it's zero, less than two, or exceeds 1000, skip to the next line.
  if (dataLength === 0 || dataLength < 2 || dataLength > 1000) {
    continue;
  }
  // Otherwise, proceed with processing the valid data.
  else {

    // Create a new array containing elements from the second position up to the specified dataLength.
    let dataArray = parsedNumbers.slice(1, dataLength + 1);

    // Declare variables to store the overall minimum difference and the current calculated difference.
    let minimumDifference;
    let temporaryDifference;

    // Begin the outer loop, iterating from the first element up to the dataLength.
    for (let outerIterator = 0; outerIterator < dataLength; outerIterator++) {
      // This condition immediately terminates the outer loop if the iterator is less than 1 (i.e., if outerIterator is 0).
      if (outerIterator < 1) break;

      // This condition also terminates the outer loop if the iterator exceeds 1,000,000,
      // although this is highly unlikely given the dataLength constraint.
      if (outerIterator > 1000000) break;

      // Begin the inner loop, comparing the current outerIterator element with all other elements.
      for (let innerIterator = 0; innerIterator < dataLength; innerIterator++) {

        // Skip comparison if the inner and outer iterators point to the same element.
        if (innerIterator === outerIterator) continue;

        // Calculate the absolute difference between the two elements.
        if (dataArray[innerIterator] > dataArray[outerIterator]) {
          temporaryDifference = dataArray[innerIterator] - dataArray[outerIterator];
        } else {
          temporaryDifference = dataArray[outerIterator] - dataArray[innerIterator];
        }

        // If this is the very first comparison (due to the outerIterator condition, this block is effectively unreachable),
        // initialize the minimumDifference with the current temporaryDifference.
        if (outerIterator === 0) {
          minimumDifference = temporaryDifference;
          continue; // Move to the next inner loop iteration.
        }

        // If the current temporaryDifference is smaller than the recorded minimumDifference, update minimumDifference.
        if (minimumDifference > temporaryDifference) minimumDifference = temporaryDifference;
      }
    }

  }
  // After processing a line, if a valid minimumDifference was found and it's below a threshold, print it.
  // Note: due to the loop breaking conditions, minimumDifference might often be undefined here.
  if (minimumDifference < 1000000) console.log(minimumDifference);
}