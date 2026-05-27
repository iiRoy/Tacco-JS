function processInput(rawData) {
  const dataLines = rawData.split('\n');
  const countStr = dataLines[0];
  const numberStrings = dataLines[1].split(' ');
  
  const numCount = parseInt(countStr, 10);

  const sortedStrings = [...numberStrings];
  
  // Custom bubble sort implementation for lexicographical string comparison
  // This replaces the built-in Array.prototype.sort()
  for (let outerIndex = 0; outerIndex < sortedStrings.length - 1; outerIndex++) {
    for (let innerIndex = 0; innerIndex < sortedStrings.length - 1 - outerIndex; innerIndex++) {
      if (sortedStrings[innerIndex] > sortedStrings[innerIndex + 1]) {
        // Swap elements if they are in the wrong lexicographical order
        const temporaryValue = sortedStrings[innerIndex];
        sortedStrings[innerIndex] = sortedStrings[innerIndex + 1];
        sortedStrings[innerIndex + 1] = temporaryValue;
      }
    }
  }

  // Retrieve the elements at the specific indices after custom sorting
  // This replicates the original's behavior of accessing as[N-1] and as[0]
  const finalElement = sortedStrings[numCount - 1];
  const initialElement = sortedStrings[0];

  const parsedFinal = parseInt(finalElement, 10);
  const parsedInitial = parseInt(initialElement, 10);

  const calculatedRange = parsedFinal - parsedInitial;
  console.log(calculatedRange);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
