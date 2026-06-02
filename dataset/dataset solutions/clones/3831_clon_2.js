function deduplicateElements(inputCollection) {
  // This function identifies and collects unique items from a given array.
  const distinctItems = []; // Initialize an empty array to store unique elements.

  // Iterate over each element in the provided collection.
  for (var currentItem of inputCollection) {
    // Check if the current element is already present in our distinct items list.
    if (distinctItems.indexOf(currentItem) < 0) {
      // If not found, add it to the list of distinct items.
      distinctItems.push(currentItem);
    }
  }
  // Return the array containing only unique elements.
  return distinctItems;
}

function processInputData(rawDataString) {
  // Split the entire input string by newline characters to get individual lines.
  const inputLines = rawDataString.split('\n');

  // The first line contains the source string.
  const sourceString = inputLines[0];
  // The second line contains an integer value, parsed from string.
  const targetCount = parseInt(inputLines[1]);

  // An array to hold all possible substrings generated from the source string.
  var substringFragments = [];

  // Outer loop: iterates through all possible starting positions for substrings.
  for (var startIdx = 0; startIdx < sourceString.length; startIdx++) {
    // Inner loop: iterates through all possible lengths for substrings starting at startIdx.
    // The lengthOffset determines the end index of the slice.
    for (var lengthOffset = 0; lengthOffset < sourceString.length - startIdx; lengthOffset++) {
      // Extract a substring using slice(start, end).
      // The end index is startIdx + lengthOffset + 1 because slice's end is exclusive.
      substringFragments.push(sourceString.slice(startIdx, startIdx + lengthOffset + 1));
    }
  }

  // Remove duplicate substrings from the generated list.
  substringFragments = deduplicateElements(substringFragments);

  // An array to store the K smallest unique substrings in lexicographical order.
  var finalSortedSubstrings = [];

  // Loop K times to find the K-th smallest unique substring.
  for (var iterationCounter = 0; iterationCounter < targetCount; iterationCounter++) {
    // Initialize the smallest candidate string for the current iteration.
    // An empty string is used as a sentinel for the first comparison.
    var smallestCandidateString = '';

    // Iterate through all unique substring fragments.
    for (var fragmentIndex = 0; fragmentIndex < substringFragments.length; fragmentIndex++) {
      var evaluatedString = substringFragments[fragmentIndex];

      // If smallestCandidateString is empty (first valid candidate) AND
      // the current string has not been added to finalSortedSubstrings yet,
      // set it as the initial smallest candidate.
      if (smallestCandidateString === '' && (finalSortedSubstrings.indexOf(evaluatedString) < 0)) {
        smallestCandidateString = evaluatedString;
      }

      // If the current string is lexicographically smaller than the current smallest candidate AND
      // it has not been added to finalSortedSubstrings yet, update smallestCandidateString.
      if ((evaluatedString < smallestCandidateString) && (finalSortedSubstrings.indexOf(evaluatedString) < 0)) {
        smallestCandidateString = evaluatedString;
      }
    }
    // After checking all fragments, add the smallest unique string found in this iteration
    // to our result array.
    finalSortedSubstrings.push(smallestCandidateString);
  }

  // Output the K-th smallest unique substring (which is the last element added).
  console.log(finalSortedSubstrings[finalSortedSubstrings.length - 1]);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
