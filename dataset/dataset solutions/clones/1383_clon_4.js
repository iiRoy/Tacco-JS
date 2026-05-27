const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let firstLineSkipped = false;
let lexicographicalMinimum = null;

inputProcessor.on('line', (currentInputRow) => {
  if (!firstLineSkipped) {
    // The initial row specifies a count, which is not utilized in the final output determination.
    // It must be consumed to proceed to the relevant data rows.
    // Number.parseInt(currentInputRow, 10); // Original code parsed this but did not use the value.
    firstLineSkipped = true;
  } else {
    // For all subsequent rows, compare the current row with the smallest string found so far.
    // Update the minimum if the current row is lexicographically smaller or if it's the first data row.
    if (lexicographicalMinimum === null || currentInputRow < lexicographicalMinimum) {
      lexicographicalMinimum = currentInputRow;
    }
  }
});

inputProcessor.on('close', () => {
  // Once all input rows have been processed, output the determined lexicographical minimum.
  // Special handling for cases where only the count line was provided, or the data lines were empty.
  if (firstLineSkipped && lexicographicalMinimum === null) {
    // This condition implies that the first line (count) was processed, but no subsequent data lines
    // were present or they were all empty strings.
    // The original code would output 'undefined' if the array of words was empty after slicing.
    console.log(undefined);
  } else {
    // Otherwise, output the smallest string found (which could be an empty string if that was the minimum).
    console.log(lexicographicalMinimum);
  }
});
