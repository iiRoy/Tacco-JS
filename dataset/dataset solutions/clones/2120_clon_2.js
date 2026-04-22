// This routine processes the complete dataset provided as a string.
function ProcessData(incomingText) {

  let finalOutcome = -1; // Initialize the computed result

  // The input string is first trimmed and then split into individual lines.
  incomingText = incomingText.trim().split("\n");

  // Extract the first number from the first line, which indicates the count of elements.
  const elementCount = incomingText[0].split(' ').map((valString) => (Number.parseInt(valString)))[0];

  // Retrieve all subsequent lines of data, excluding the first line.
  const itemRows = incomingText.slice(1);

  // Initialize an array with a default placeholder character, 'a', for the specified count.
  let targetArray = new Array(elementCount).fill('a');

  // Iterate through each of the data rows to populate the target array.
  for (let recordIndex = 0; recordIndex < itemRows.length; recordIndex++) {
    // Parse the current row into an array of two integers.
    const currentEntryPair = itemRows[recordIndex].split(' ').map((numStr) => (Number.parseInt(numStr)));

    // Assign the second integer to the position indicated by the first integer (adjusted for zero-based indexing).
    targetArray[currentEntryPair[0] - 1] = currentEntryPair[1];
  }

  // Combine the array elements into a single string,
  // then remove any leading 'a' characters, and replace all remaining 'a's with '0'.
  const processedSequence = targetArray.join("").replace(/^a*/, '').replace(/a/g, '0');

  // Convert the processed string to an integer and then back to a string for comparison.
  const numericalRepresentation = Number.parseInt(processedSequence).toString();

  // Evaluate the processed string to determine the final outcome.
  if (processedSequence === '00') {
    finalOutcome = 100; // Special case for '00'
  } else if (processedSequence === '0') {
    finalOutcome = 10; // Special case for '0'
  } else if (processedSequence === numericalRepresentation) {
    finalOutcome = Number.parseInt(numericalRepresentation); // If string matches its numeric form, use the numeric value.
  }

  // Output the calculated final outcome.
  console.log(finalOutcome);
}

// The following lines manage standard input/output and should not be altered.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
// ProcessData(require('fs').readFileSync('./sample_data.txt', 'utf-8'));