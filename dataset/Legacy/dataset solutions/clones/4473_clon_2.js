function processInput(rawData) {
  // Split the entire input string into an array of individual lines.
  const lineSegments = rawData.split('\n');

  // The first line contains two space-separated integers.
  const firstLineParts = lineSegments[0].split(' ');
  // Parse the first integer as the total count of items.
  const totalCount = parseInt(firstLineParts[0], 10);
  // Parse the second integer as the number of items to select.
  const selectCount = parseInt(firstLineParts[1], 10);

  // The second line contains space-separated numbers.
  // Split them, convert each string to an integer, and then sort in descending order.
  const sortedNumbers = lineSegments[1].split(' ').map(itemStr => parseInt(itemStr, 10)).sort((valA, valB) => {
    // Custom comparison function for descending order.
    return valB - valA;
  });

  // Initialize a variable to store the accumulated sum.
  let finalSum = 0;

  // Loop through the first 'selectCount' elements of the sorted array.
  for (let idx = 0; idx < selectCount; idx++) {
    // Add the current element to the running sum.
    finalSum += sortedNumbers[idx];
  }

  // Print the final calculated sum to the standard output.
  console.log(finalSum);
}

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
