// This primary function handles the complete data processing workflow.
function ProcessData(sourceText) {

  // Utilize newline characters to segment the incoming raw text into distinct lines.
  const textLines = sourceText.split("\n");

  // Extract the second line, split it by spaces, and convert each segment into an integer.
  var initialNumbers = textLines[1]
                         .split(" ")
                         .map((strVal) => parseInt(strVal, 10));

  // Determine the highest numerical value present within the parsed number collection.
  const highestValue = initialNumbers.reduce(
    (currentMax, nextElement) => (currentMax > nextElement ? currentMax : nextElement)
  );


  // Initialize a mutable variable to accumulate the final calculated value.
  var finalTally = 0;

  // Iterate through a range of integer values, starting from zero up to the maximum found value.
  for (var idxPosition = 0; idxPosition <= highestValue; ++idxPosition) {
    // Filter the original array to identify all elements that precisely match the current iteration index.
    var matchingElements = initialNumbers.filter((itemVal) => itemVal === idxPosition);

    // Evaluate the length of the filtered array against the current index.
    if (matchingElements.length < idxPosition) {
      // If fewer matches than the index, add the total number of matches to the tally.
      finalTally += matchingElements.length;
    }
    else if (matchingElements.length > idxPosition) {
      // If more matches than the index, add the excess count to the tally.
      finalTally += matchingElements.length - idxPosition;
    }
    // If matchingElements.length equals idxPosition, no adjustment is required for the tally.
  }

  // Display the final computed tally to the standard output.
  console.log(finalTally);
}

// Execute the main processing routine by feeding it content read from standard input.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));