'use strict'; // Enforce strict parsing and error handling for the entire script.

/**
 * Processes incoming raw textual information to determine the count of unique consecutive items.
 * This function identifies how many times a new, different item appears consecutively in a sequence.
 * @param {string} rawData The complete input string, typically read from a source.
 */
function sequenceAnalyzer(rawData)
{
  // Break down the initial data stream into individual lines.
  // The first line often contains metadata, and the second line the actual sequence.
  const lineSegments = rawData.split('\n');

  // Extract the total number of elements expected from the first line.
  const totalElements = lineSegments[0];

  // Parse the second line, splitting it into an array of individual tokens (items).
  const elementArray = lineSegments[1].split(' ');

  // Initialize a tally for distinct consecutive items found.
  let uniqueItemTally = 0;

  // Hold the value of the last item encountered to facilitate comparison.
  let previousValue = '';

  // Iterate through each element in the parsed array, from start to end.
  for (
    let positionMarker = 0; // Start at the beginning of the sequence.
    positionMarker < totalElements; // Continue until all expected elements are processed.
    ++positionMarker // Move to the next element in the sequence.
  )
  {
    // Check if the current element is different from the one seen immediately before it.
    if (previousValue !== elementArray[positionMarker]) {
      // If it's a new, different element, increment our count of unique consecutive items.
      ++uniqueItemTally;

      // Update the 'last seen' value to the current element for the next comparison.
      previousValue = elementArray[positionMarker];
    }
  }

  // Output the final computed count of distinct consecutive items to the standard console.
  console.log(uniqueItemTally);
}

// Invoke the main processing function.
// It reads the content from the standard input stream ('/dev/stdin')
// using the Node.js file system module and decodes it as UTF-8 text.
sequenceAnalyzer ( require('fs') . readFileSync ( '/dev/stdin' ,   'utf8' ) );