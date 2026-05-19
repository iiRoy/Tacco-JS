const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input.

let lineSegments = rawData.trim().split("\n"); // Process raw data into an array of distinct lines.

while (true) { // Begin an indefinite processing loop.

  let mainValue = lineSegments.shift() - 0; // Extract the next numerical value from the line segments.

  if (mainValue === 0) { // Check for the termination condition.
    break; // Exit the loop if the main value is zero.
  }

  const mainValueCubed = mainValue * mainValue * mainValue; // Compute the cube of the primary value.

  let resultCollection = []; // Initialize an array to store computed differences.

  for (let outerIterator = mainValue - 1; outerIterator > 0; outerIterator--) { // Outer loop for iteration.
    for (let innerIterator = outerIterator; innerIterator > 0; innerIterator--) { // Inner loop, dependent on outer iterator.

      const calculatedDifference = mainValueCubed - (outerIterator * outerIterator * outerIterator) - (innerIterator * innerIterator * innerIterator); // Calculate the difference of cubes.

      if (calculatedDifference > 0) { // Only consider positive differences.
        resultCollection.push(calculatedDifference); // Add the valid difference to the collection.
      }
    }
  }

  resultCollection.sort(function(valA, valB) { // Sort the collected differences in ascending order.
    return valA - valB;
  });

  console.log(resultCollection[0]); // Output the smallest positive difference found.
}
