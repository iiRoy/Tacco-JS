// This function processes an array of input rows to identify and count occurrences of a specific string.
function processInputData(inputRows) {
  // The initial element of the input array holds the string we are searching for.
  let searchKey = inputRows[0];
  // A counter to keep track of how many times the search key appears.
  let occurrenceCounter = 0;

  // Begin iterating through the input rows, starting from the second row (index 1),
  // as the first row contains the search key itself.
  for (let rowIndex = 1; rowIndex < inputRows.length; rowIndex++) {
    // Each row is split into an array of individual words using any sequence of whitespace characters as a delimiter.
    let currentWords = inputRows[rowIndex].split(/\s+/);

    // Now, iterate over each word obtained from the current row.
    for (let wordIndex = 0; wordIndex < currentWords.length; wordIndex++) {
      // Compare the current word with our designated search key.
      if (currentWords[wordIndex] === searchKey) {
        // If a match is found, increment the occurrence counter.
        occurrenceCounter++;
      }
    }
  }
  // After processing all relevant rows and words, display the final count of the search key.
  console.log(occurrenceCounter);
}

// An array to accumulate incoming data segments from the standard input stream.
let dataFragments = [];

// Attach an event listener to the standard input stream for 'data' events.
process.stdin.on('data', function(dataPiece) {
  // As data arrives, each piece is appended to our collection of fragments.
  dataFragments.push(dataPiece);
});

// Attach an event listener for the 'end' event on the standard input stream.
process.stdin.on('end', function() {
  // Once the input stream has concluded, all data fragments are joined into a single string.
  // This string is then split by newline characters to form an array of distinct input rows.
  let inputRows = dataFragments.join('').split('\n');
  // Finally, invoke our primary data processing function with the prepared array of input rows.
  processInputData(inputRows);
});
