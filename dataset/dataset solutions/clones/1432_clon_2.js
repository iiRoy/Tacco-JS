/*
 * This module handles command-line input and performs a specific text analysis.
 * It counts occurrences of a particular search term within the provided text.
 */
function analyzeTextContent(inputRows) {
  // The very first row of the input is considered our search query.
  const searchQuery = inputRows[0];
  // Initialize a counter for the number of times the query appears.
  let occurrenceCounter = 0;

  // Iterate through each subsequent row of the input.
  // We start from the second row (index 1) as the first is the query.
  for (let rowIndex = 1; rowIndex < inputRows.length; rowIndex++) {
    // Split the current row into individual tokens (words) using any whitespace as a delimiter.
    const tokenArray = inputRows[rowIndex].split(/\s+/);

    // Now, iterate through each token in the current row.
    for (let tokenIndex = 0; tokenIndex < tokenArray.length; tokenIndex++) {
      // Check if the current token exactly matches our defined search query.
      if (tokenArray[tokenIndex] === searchQuery) {
        // If a match is found, increment our occurrence counter.
        occurrenceCounter++;
      }
    }
  }

  // After processing all rows and tokens, display the total count of query occurrences.
  console.log(occurrenceCounter);
}

// An array to temporarily store incoming data fragments from standard input.
var dataBuffers = [];

// Set up an event listener for when data streams in from standard input.
process
  .stdin
  .on(
    'data',
    function(dataPart) {
      // Each received data fragment is added to our buffer array.
      dataBuffers.push(dataPart)
    }
  );

// Set up an event listener for when the standard input stream has completely ended.
process
  .stdin
  .on(
    'end',
    function() {
      // Combine all stored data fragments into a single string.
      // Then, split this string into an array of lines based on newline characters.
      const processedLines = dataBuffers.join('').split('\n');

      // Finally, invoke our main analysis function with the prepared array of lines.
      analyzeTextContent(processedLines);
    }
  );