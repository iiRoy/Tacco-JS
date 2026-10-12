function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  var lines = rawData.split('\n');

  // The first line often contains a count of elements, but it's not utilized in this specific algorithm.
  var elementCount = lines[0];

  // The second line is expected to contain space-separated numerical values.
  // Split this line into an array of string representations of numbers.
  var numericData = lines[1].split(' ');

  // Iterate through the array of string numbers and convert each to an integer.
  // Using `let` for block-scoped iteration variable.
  for (let idx = 0; idx < numericData.length; idx++) {
    numericData[idx] = parseInt(numericData[idx], 10); // Explicitly specify radix 10 for robust parsing.
  }

  // Apply a custom merge sort function to sort the array of numbers.
  numericData = mergeSorter(numericData);

  // Calculate and display the difference between two specific elements in the sorted array.
  // This typically targets the two middle elements for an array with an even length,
  // or the middle element and the one preceding it for an odd length array (due to integer division).
  console.log(numericData[numericData.length / 2] - numericData[numericData.length / 2 - 1]);
}

// Implements a merge sort algorithm for an array of numbers.
function mergeSorter(sourceArray) {
  // This nested function recursively divides the array into smaller segments.
  const divideAndConquer = function(currentSegment) {
    // Base case: if the segment has fewer than two elements, it's considered sorted.
    if (currentSegment.length < 2) {
      return currentSegment;
    }

    // Determine the midpoint to split the current segment.
    // The bitwise OR with 0 (`| 0`) effectively floors the result, ensuring an integer index.
    const middlePoint = currentSegment.length / 2 | 0;

    // Recursively sort the first half of the segment.
    let firstHalfSorted = divideAndConquer(currentSegment.slice(0, middlePoint));
    // Recursively sort the second half of the segment.
    let secondHalfSorted = divideAndConquer(currentSegment.slice(middlePoint, currentSegment.length));

    // Merge the two sorted halves back together.
    return mergeParts(currentSegment, firstHalfSorted, secondHalfSorted);
  };

  // This nested function merges two already sorted arrays into a single sorted array.
  const mergeParts = function(originalArrayRef, firstHalf, secondHalf) {
    // This condition might be a safeguard for an edge case, but typically 'secondHalf'
    // will always be an array returned by 'divideAndConquer'.
    if (secondHalf === undefined) {
      return originalArrayRef;
    }

    let mergedResult = []; // Initialize an empty array to store the merged elements.
    let elementA, elementB; // Variables to temporarily hold elements from each half.

    // While both halves still contain elements, compare their first elements.
    // Add the smaller element to 'mergedResult' and remove it from its source half.
    while (firstHalf.length > 0 && secondHalf.length > 0) {
      elementA = firstHalf[0];
      elementB = secondHalf[0];

      if (elementA < elementB) {
        mergedResult.push(firstHalf.shift()); // Remove from the beginning of 'firstHalf' and add to 'mergedResult'.
      } else {
        mergedResult.push(secondHalf.shift()); // Remove from the beginning of 'secondHalf' and add to 'mergedResult'.
      }
    }

    // If any elements remain in the 'firstHalf' (after 'secondHalf' is exhausted), append them.
    if (firstHalf.length > 0) {
      mergedResult = mergedResult.concat(firstHalf);
    }
    // If any elements remain in the 'secondHalf' (after 'firstHalf' is exhausted), append them.
    else if (secondHalf.length > 0) {
      mergedResult = mergedResult.concat(secondHalf);
    }

    return mergedResult; // Return the fully merged and sorted array.
  };

  // Initiate the merge sort process by calling the recursive division function with the original array.
  return divideAndConquer(sourceArray);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
