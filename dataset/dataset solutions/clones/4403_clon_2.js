function processInput(rawData) {
  const matchingValues = new Array(2).fill(0); // Container for two identical numbers found
  const textSegments = rawData.split('\n'); // Dividing the raw input into separate lines

  // Parsing the second line of text into a collection of numeric values
  let numericCollection = textSegments[1].split(' ').map(Number);

  // Arranging the numeric values in descending order
  numericCollection.sort((valB, valA) => valA - valB);

  let foundPairCount = 0; // Counter for the number of pairs identified

  // Iterating through the sorted collection to locate adjacent identical numbers
  for (let scanIndex = 0;
       scanIndex < numericCollection.length - 1 && foundPairCount < 2;
       scanIndex++) {
    // Verifying if the current element matches its immediate successor
    if (numericCollection[scanIndex] === numericCollection[scanIndex + 1]) {
      matchingValues[foundPairCount] = numericCollection[scanIndex]; // Storing the matched value
      scanIndex++; // Advancing the index to bypass the already-matched next element
      foundPairCount++; // Incrementing the counter for found pairs
    }
  }

  /*
   * Previous debug statement that printed the sorted numericCollection has been removed.
   */

  // Setting up a custom output handler for displaying results
  const systemOutput = {
    report: console.log
  };

  // Displaying the computed product of the two identified matching values
  systemOutput.report(matchingValues[0] * matchingValues[1]);
}

// Defining a utility object for file system operations
const fileSystemUtility = require("node:fs");
fileSystemUtility.obtainFileContents = fileSystemUtility.readFileSync;

// Invoking the primary processing function with data acquired from standard input
processInput(fileSystemUtility.obtainFileContents("/dev/stdin", "utf-8"));