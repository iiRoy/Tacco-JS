function processInput(inputRows) {
  // This variable stores the count of words, though it's not used later in the logic.
  let numEntries = parseInt(inputRows[0], 10);

  // Extract words from the second line onwards and sort them alphabetically.
  let sortedTerms = inputRows.slice(1).sort();

  // Output the first word after sorting.
  console.log(sortedTerms[0]);
}

// Array to accumulate incoming data chunks from standard input.
let dataParts = [];

// Set up an event listener for incoming data.
process.stdin.on('data', function(currentPart) {
  dataParts.push(currentPart);
});

// Set up an event listener for the end of input stream.
process.stdin.on('end', function() {
  // Combine all data parts, then split into individual lines using the newline character.
  let parsedLines = dataParts.join('').split('\n');

  // Call the main processing function with the parsed lines.
  processInput(parsedLines);
});
