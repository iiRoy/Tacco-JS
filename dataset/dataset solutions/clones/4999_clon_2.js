/*
 * This utility function is designed to prepend zero characters to a given
 * numeric string until it achieves a specified total length.
 * It's particularly useful for formatting binary representations or other
 * fixed-width numeric outputs.
 */
function padWithLeadingZeros(inputNumericString, desiredOutputLength) {
  // Initialize an empty string to accumulate the zero characters.
  var zeroCharacters = '';

  // Loop 'desiredOutputLength' times to build the padding string.
  for (var index = 0; index < desiredOutputLength; index++) {
    zeroCharacters = zeroCharacters + '0';
  }

  // Concatenate the generated zero padding with the original input string.
  // Then, slice the combined string from the end, retaining only the
  // 'desiredOutputLength' characters. This ensures correct padding.
  return (zeroCharacters + inputNumericString).slice(-desiredOutputLength);
}

/*
 * The core application logic resides in this function. It processes
 * raw input data to identify and count specific subsets of numbers
 * that satisfy a given average criterion.
 */
function processInputData(sourceContent) {
  // Break down the raw input content into an array of individual lines.
  var contentLines = sourceContent.split('\n');

  // Split the first line into components based on space delimiters.
  contentLines[0] = contentLines[0].split(' ');
  // Split the second line into components based on space delimiters.
  contentLines[1] = contentLines[1].split(' ');

  // Extract the first problem parameter: the total count of items (N).
  var totalItemCount = parseInt(contentLines[0][0]);
  // Extract the second problem parameter: the target average (A) for subsets.
  var targetAverageValue = parseInt(contentLines[0][1]);

  // Store the array of numeric values (x) from the second line.
  var numericValues = contentLines[1];

  // Calculate the total number of possible non-empty subsets (2^N).
  // This represents all unique combinations of items.
  var totalPossibleSubsets = Math.pow(2, totalItemCount);

  // Initialize a counter to keep track of subsets that meet the criteria.
  var qualifyingSubsetCounter = 0;

  // Iterate through each possible subset combination, represented by a binary index.
  // The loop starts from 1 because an empty set is typically not considered.
  for (var subsetIndex = 1; subsetIndex < totalPossibleSubsets; subsetIndex++) {
    // Convert the current subset index to its binary string representation.
    // Ensure it's padded with leading zeros to match 'totalItemCount' length.
    var currentBinaryPattern = padWithLeadingZeros((subsetIndex.toString(2)), totalItemCount);

    // Initialize variables for the sum and count of elements in the current subset.
    var currentSubsetTotal = 0;
    var includedElementQuantity = 0;

    // Traverse the binary pattern, bit by bit.
    // Each '1' bit indicates an element is included in the current subset.
    for (var elementPosition = 0; elementPosition < totalItemCount; elementPosition++) {
      // If the bit at 'elementPosition' is '1', include the corresponding value.
      if (currentBinaryPattern[elementPosition] === '1') {
        currentSubsetTotal += parseInt(numericValues[elementPosition]);
        includedElementQuantity++; // Increment the count of elements in this subset.
      }
    }

    // Check if the average of the current subset's elements equals the 'targetAverageValue'.
    // Note: 'includedElementQuantity' will always be >= 1 due to the loop starting from 'subsetIndex = 1'.
    if (targetAverageValue === currentSubsetTotal / includedElementQuantity) {
      qualifyingSubsetCounter++; // Increment the counter if the average matches.
    }
  }

  // Print the final tally of subsets that met the specified average.
  console.log(qualifyingSubsetCounter);
}


// Read the entire file content from standard input synchronously,
// using UTF-8 encoding, and then pass it to the main processing function.
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));