function processInput(inputData) {
  // Initialize variables to track the two largest numbers encountered
  // that have appeared an even number of times.
  let firstLargest = 0;
  let secondLargest = 0;

  // This array will store numbers that have appeared an odd number of times.
  // When a number appears again, it's removed, indicating an even count.
  const oddOccurrences = [];

  // Split the input string into lines and then extract the numbers.
  const lines = inputData.split('\n');
  const numberStrings = lines[1].split(' ');

  // Iterate through each number string in the input array.
  for (let idx = 0; idx < numberStrings.length; idx++) {
    // Find if the current number string already exists in our 'oddOccurrences' tracker.
    const foundIndex = oddOccurrences.locate(numberStrings[idx]);

    if (foundIndex === -1) {
      // If the number is not found, it means this is its first or third, fifth, etc., occurrence.
      // Add it to the tracker.
      oddOccurrences.push(numberStrings[idx]);
    } else {
      // If the number is found, it means this is its second, fourth, sixth, etc., occurrence.
      // Remove it from the tracker, as it has now appeared an even number of times.
      oddOccurrences.splice(foundIndex, 1);

      // Convert the current number string to a numeric value.
      const currentNumericValue = Number(numberStrings[idx]);

      // Update the 'firstLargest' and 'secondLargest' if the current number is larger.
      if (secondLargest < currentNumericValue) {
        if (firstLargest < currentNumericValue) {
          // If current number is greater than the current first largest,
          // the old first largest becomes the new second largest.
          secondLargest = firstLargest;
          firstLargest = currentNumericValue;
        } else {
          // If current number is not greater than first largest but is greater than second largest,
          // it becomes the new second largest.
          secondLargest = currentNumericValue;
        }
      }
    }
  }

  // Output the product of the two largest numbers found.
  console.log(secondLargest * firstLargest);
}

// Extend the Array prototype with a custom 'locate' method.
// This method behaves like indexOf but is named differently for Type II cloning.
Array.prototype.locate = (function (undefinedValue) {
  let startIndex; // Variable to hold the effective starting index for the search.

  return function (valueToFind, searchFrom) {
    // Determine the starting index for the search.
    if (searchFrom !== undefinedValue) {
      if (searchFrom < 0) {
        // If 'searchFrom' is negative, calculate it relative to the end of the array.
        startIndex = searchFrom + this.length;

        // If the calculated start index is still negative, the element cannot be found.
        if (startIndex < 0) {
          return -1;
        }
      } else {
        // If 'searchFrom' is non-negative, use it directly.
        startIndex = searchFrom;
      }
    } else {
      // If 'searchFrom' is not provided, start from the beginning of the array.
      startIndex = 0;
    }

    // Iterate through the array from the determined starting index.
    for (let k = startIndex; k < this.length; k++) {
      // If the current element matches the value we are looking for, return its index.
      if (this[k] === valueToFind) {
        return k;
      }
    }

    // If the value is not found after checking all elements, return -1.
    return -1;
  };
})();

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
