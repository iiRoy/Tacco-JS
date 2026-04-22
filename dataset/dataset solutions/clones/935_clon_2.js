// This script provides a Type II clone of a JavaScript program.
// All user-defined identifier names, comments, and whitespace have been
// modified while preserving the original structural logic and functionality.

var printToConsole = console.log; // Alias for console output function

// Condition to detect if the script is running in a Node.js environment
if (typeof process !== 'undefined') {

  var accumulatedInput = ''; // Variable to buffer all incoming data from stdin

  // Configure standard input stream
  process.stdin.resume();              // Ensure the stdin stream is active
  process.stdin.setEncoding('utf8');   // Set the character encoding for input

  // Attach an event listener for 'data' events on stdin
  process.stdin.on('data', function (incomingChunk) {
    accumulatedInput += incomingChunk; // Append each data chunk to the buffer
  });

  // Attach an event listener for the 'end' event on stdin
  process.stdin.on('end', function () {
    var textLines = accumulatedInput.split('\n'); // Split the entire buffered input into an array of lines
    executePrimaryLogic(textLines);               // Call the main processing function with the collected lines
  });
}

// --- Core application logic functions ---

/**
 * Serves as the primary entry point for processing a collection of text lines.
 * It iterates through the lines, extracting and cleaning data pairs for further analysis.
 *
 * @param {Array<string>} textLines - An array of strings, where each string represents a line of input.
 */
function executePrimaryLogic(textLines) {

  textLines.shift(); // Remove the initial line, which often contains metadata (e.g., number of test cases)

  // Loop through the remaining lines, processing them in pairs
  while (textLines.length > 0) {
    try {
      var inputPair = textLines.slice(0, 2); // Extract the next two lines to form a data pair

      // Cleanse each string within the data pair
      // This involves removing all characters that are not lowercase English letters.
      inputPair = inputPair.map(function (currentString) {
        return currentString.split('').filter(function (charValue) {
          var asciiCode = charValue.charCodeAt(0); // Get the ASCII/Unicode value of the character
          return asciiCode >= 97 && asciiCode <= 122; // Filter for 'a' (97) through 'z' (122)
        }).join(''); // Reassemble the filtered characters into a new string
      });

      calculateSimilarityMatrix(inputPair); // Perform the main calculation on the cleaned data pair

      textLines = textLines.slice(2); // Remove the processed two lines from the array
    } catch (errorObject) {
      printToConsole(errorObject); // Catch and log any exceptions that occur during processing a block
    }
  }
}

/**
 * Computes a specific similarity or distance matrix between two input strings using dynamic programming.
 * The final value of the matrix's bottom-right cell is printed to the console.
 *
 * @param {Array<string>} inputDataPair - An array containing exactly two strings to be compared.
 */
function calculateSimilarityMatrix(inputDataPair) {

  var similarityGrid = [];    // Initialize the 2D array (matrix) for storing intermediate results
  var firstSequence = inputDataPair[0]; // The first string for comparison
  var secondSequence = inputDataPair[1]; // The second string for comparison

  // Iterate over the rows of the grid, corresponding to characters of the first string
  for (var rowIterator = 0; rowIterator < firstSequence.length; rowIterator++) {
    similarityGrid[rowIterator] = []; // Initialize the current row as an empty array

    // Iterate over the columns of the grid, corresponding to characters of the second string
    for (var colIterator = 0; colIterator < secondSequence.length; colIterator++) {

      // Determine the initial value for the current cell based on character equality
      if (firstSequence.charAt(rowIterator) === secondSequence.charAt(colIterator)) {
        similarityGrid[rowIterator][colIterator] = 1; // Characters match
      } else {
        similarityGrid[rowIterator][colIterator] = 0; // Characters do not match
      }

      // Apply dynamic programming rules to update the cell value based on its neighbors
      if (rowIterator === 0 && colIterator === 0) {
        // For the very first cell (top-left), no previous values exist to combine
        similarityGrid[rowIterator][colIterator] += 0; // Effectively no change
      } else if (rowIterator === 0) {
        // For cells in the first row (excluding the first), consider the value from the left
        similarityGrid[rowIterator][colIterator] = Math.max(
          similarityGrid[rowIterator][colIterator - 1],
          similarityGrid[rowIterator][colIterator]
        );
      } else if (colIterator === 0) {
        // For cells in the first column (excluding the first), consider the value from above
        similarityGrid[rowIterator][colIterator] = Math.max(
          similarityGrid[rowIterator - 1][colIterator],
          similarityGrid[rowIterator][colIterator]
        );
      } else {
        // For all other cells (general case), apply a more complex combination rule
        // This involves taking the maximum of the top and left neighbors, adding the current match/mismatch value,
        // and then taking the minimum of that result and (min(row, col) + 1).
        similarityGrid[rowIterator][colIterator] = Math.min(
          Math.max(
            similarityGrid[rowIterator - 1][colIterator],
            similarityGrid[rowIterator][colIterator - 1]
          ) + similarityGrid[rowIterator][colIterator],
          Math.min(rowIterator, colIterator) + 1
        );
      }
    }
  }
  // After filling the entire grid, print the value from the last computed cell (bottom-right)
  printToConsole(similarityGrid[rowIterator - 1][colIterator - 1]);
}