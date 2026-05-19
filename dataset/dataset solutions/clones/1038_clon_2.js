var findValueInSortedArray = (targetValue, arraySize, sortedCollection) => {
  // Initialize pointers for the search range
  let startIndex = 0;
  let endIndex = arraySize;

  // Perform binary search until the pointers cross
  while (startIndex < endIndex) {
    // Calculate the middle index
    let middlePoint = Math.floor((startIndex + endIndex) / 2);

    // Check if the element at the middle index is the target value
    if (sortedCollection[middlePoint] === targetValue) {
      return true; // Target found
    } else if (targetValue < sortedCollection[middlePoint]) {
      // If target is smaller, search in the left half
      endIndex = middlePoint;
    } else {
      // If target is larger, search in the right half
      startIndex = middlePoint + 1;
    }
  }

  // Target not found in the array
  return false;
};

// Main execution block, reads from standard input
(function(inputContent) {
  // Process the input string
  let inputLines = (inputContent.trim()).split('\n');

  // Parse the first array of numbers (source collection)
  let sourceNumbers = inputLines[1].split(" ").map(Number);

  // Parse the second array of numbers (targets to search for)
  let targetNumbers = inputLines[3].split(" ").map(Number);

  // Initialize a counter for found matches
  let matchCount = 0;

  // Iterate through the target numbers and search for each in the source collection
  for (let idx = 0; idx < targetNumbers.length; idx++) {
    // Add 1 to matchCount if the target number is found, otherwise add 0
    matchCount += findValueInSortedArray(targetNumbers[idx], sourceNumbers.length, sourceNumbers);
  }

  // Output the total count of found matches
  console.log(matchCount);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
