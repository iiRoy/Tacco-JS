function processInputData(sourceText) {
  // Split the entire input string into individual lines
  let inputLines = sourceText.split('\n');

  // Parse the first line to get the total count of elements
  let totalCount = parseInt(inputLines[0]);

  // Split the second line into an array of string tokens representing numbers
  let numberTokens = inputLines[1].split(' ');

  // Initialize two arrays to store numbers based on their original index parity
  let evenPositionNumbers = []; // For numbers at 0-indexed even positions (0, 2, 4, ...)
  let oddPositionNumbers = [];  // For numbers at 0-indexed odd positions (1, 3, 5, ...)

  // Iterate through the number tokens to populate the even and odd arrays
  for (let currentIdx = 0; currentIdx < totalCount; currentIdx++) {
    // Check if the current index is even
    if (currentIdx % 2 === 0) {
      evenPositionNumbers.push(parseInt(numberTokens[currentIdx]));
    } else {
      // If not even, it's an odd index
      oddPositionNumbers.push(parseInt(numberTokens[currentIdx]));
    }
  }

  // Sort both arrays in ascending order to facilitate frequency counting
  evenPositionNumbers.sort((valA, valB) => valA - valB);
  oddPositionNumbers.sort((valA, valB) => valA - valB);

  // Extend the Array prototype with a custom method to find the two most frequent elements
  // This method returns an array containing two [value, count] pairs:
  // [[most_frequent_value, its_count], [second_most_frequent_value, its_count]]
  Array.prototype.getTopTwoFrequencies = function () {
    let frequencyMap = []; // This array will store [value, count] pairs
    let previousItemValue; // Keeps track of the last processed item to count consecutive occurrences

    // Iterate over the sorted array to build the frequency map
    this.forEach(function (currentItem, itemIndex) {
      if (currentItem !== previousItemValue) {
        // If the current item is different from the previous one, it's a new unique element
        // Add it to the beginning of the frequencyMap with a count of 1
        frequencyMap.unshift([currentItem, 1]);
        previousItemValue = currentItem; // Update the previous item tracker
      } else {
        // If the current item is the same as the previous one, increment the count of the most recent entry
        frequencyMap[0][1]++;
      }
    });

    // Sort the frequency map in descending order based on the count (second element of the pair)
    frequencyMap.sort(function (pairA, pairB) {
      return pairB[1] - pairA[1]; // Sort by count in descending order
    });

    // Ensure that there are at least two entries in the frequency map for consistent return structure.
    // If there's only one unique element, the "second most frequent" will be represented as [null, 0].
    if (!frequencyMap[1]) {
      frequencyMap.push([null, 0]);
    }
    // Return the top two frequency pairs
    return [[frequencyMap[0][0], frequencyMap[0][1]], [frequencyMap[1][0], frequencyMap[1][1]]];
  };

  // Calculate the top two frequencies for numbers at even and odd positions
  let evenPositionStats = evenPositionNumbers.getTopTwoFrequencies();
  let oddPositionStats = oddPositionNumbers.getTopTwoFrequencies();

  let minimumReplacements = 0; // Variable to store the final calculated minimum replacements

  // Determine the minimum number of replacements required
  // Case 1: The most frequent elements in the even and odd position arrays are different.
  // In this scenario, we can use both most frequent elements without conflict.
  if (evenPositionStats[0][0] !== oddPositionStats[0][0]) {
    minimumReplacements = totalCount - (evenPositionStats[0][1] + oddPositionStats[0][1]);
  } else {
    // Case 2: The most frequent elements in the even and odd position arrays are the same.
    // We cannot use the same value for both even and odd positions simultaneously.
    // We must choose one of the following two options to maximize the count of unchanged elements:
    // Option A: Use the second most frequent element from the even positions and the most frequent from odd positions.
    // Option B: Use the most frequent element from the even positions and the second most frequent from odd positions.
    // We take the maximum of these two combinations and subtract it from the total count.
    minimumReplacements = totalCount - Math.max(
      evenPositionStats[1][1] + oddPositionStats[0][1], // Option A
      evenPositionStats[0][1] + oddPositionStats[1][1]  // Option B
    );
  }

  // Output the calculated minimum number of replacements to the console
  console.log(minimumReplacements);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
