// This file presents a solution to an online judge problem, implemented with contemporary JavaScript features.

// A utility function designed to locate a specific element within an ordered collection.
const findValueInSortedArray = function(targetElement, arraySize, sortedCollection) {
  // Initialize range boundaries for the search operation.
  // The 'lowerBound' begins at the first index, and 'upperBound' is set to one past the last valid index.
  let lowerBound = 0;
  let upperBound = arraySize;

  while (lowerBound < upperBound) {
    // Calculate the midpoint index, ensuring it's an integer.
    const middleIndex = Math.floor((lowerBound + upperBound) / 2);
    if (sortedCollection[middleIndex] === targetElement) {
      return true; // The desired element has been successfully located.
    } else if (targetElement < sortedCollection[middleIndex]) {
      // If the target is smaller, restrict the search to the left segment.
      upperBound = middleIndex;
    } else {
      // If the target is larger, shift the search to the right segment.
      lowerBound = middleIndex + 1;
    }
  }
  return false; // The element was not found within the collection.
};

( (inputDataStream) => {
  // Parse the incoming string data by trimming whitespace and splitting into individual lines.
  const inputLines = inputDataStream.trim().split('\n');

  // Extract and convert the main sequence of numbers and the query elements from specific lines.
  const mainSequence = inputLines[1].split(" ").map(Number);
  const queryElements = inputLines[3].split(" ").map(Number);

  let foundCount = 0; // Counter to tally how many query elements are present.
  for (let idx = 0; idx < queryElements.length; ++idx) {
    // For each query element, execute the search function and accumulate the results.
    foundCount += findValueInSortedArray(queryElements[idx], mainSequence.length, mainSequence);
  }
  // Display the final tally of found elements.
  console.log(foundCount);
})( require('node:fs').readFileSync('/dev/stdin', 'utf8') );