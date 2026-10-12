function orderElements(dataCollection) {
  // Sorts the provided array in descending order.
  return dataCollection.sort((firstVal, secondVal) => secondVal < firstVal);
}

function processInputData(rawData) {
  // Split the raw input string into individual lines.
  const parsedLines = rawData.split('\n');

  // The first line contains the count of items.
  const itemCount = parsedLines[0];

  // Process and sort the elements for the upper layer.
  const upperLayer = orderElements(parsedLines[1].split(' ').map(numStr => Number(numStr)));

  // Process and sort the elements for the middle layer.
  const middleLayer = orderElements(parsedLines[2].split(' ').map(numStr => Number(numStr)));

  // Process and sort the elements for the lower layer.
  const lowerLayer = orderElements(parsedLines[3].split(' ').map(numStr => Number(numStr)));

  // Initialize a counter for valid combinations.
  var totalMatches = 0;
  var idxA, idxB, idxC;

  // Iterate through all possible combinations of elements from the three layers.
  for (idxA = 0; idxA < itemCount; idxA++) {
    for (idxB = 0; idxB < itemCount; idxB++) {
      for(idxC = 0; idxC < itemCount; idxC++) {
        // Check if the current combination satisfies the condition: upper < middle < lower.
        if (upperLayer[idxA] < middleLayer[idxB] && middleLayer[idxB] < lowerLayer[idxC]) {
          totalMatches += 1; // Increment the counter if the condition is met.
        }
      }
    }
  }

  // Output the final count of valid combinations.
  console.log(totalMatches);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
