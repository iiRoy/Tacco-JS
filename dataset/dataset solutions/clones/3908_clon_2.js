function ProcessInput(rawData) {
  // Split the entire input string by newline characters
  const textRows = rawData.split('\n');

  // Parse the first line to get the total number of elements
  let elementCount = parseInt(textRows[0]);

  // Process the second line: split by space, then convert each part to an integer
  let originalNumbers = textRows[1].split(' ').map(function(strNum) {
    return parseInt(strNum);
  });

  // Create a sorted copy of the numbers array
  let orderedValues = originalNumbers.slice().sort(function(val1, val2) {
    // Sort in ascending numerical order
    return val1 - val2;
  });

  // Calculate the first median value (lower median for even N)
  const firstMedian = orderedValues[elementCount / 2 - 1];

  // Calculate the second median value (upper median for even N)
  const secondMedian = orderedValues[elementCount / 2];

  // Iterate through the original numbers and print the appropriate median
  originalNumbers.forEach(function(currentNum) {
    // If the current number is less than or equal to the first median, print the second median
    // Otherwise, print the first median
    console.log(currentNum <= firstMedian ? secondMedian : firstMedian);
  });
}

// Invoke the main processing function with data read from standard input
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));