function ProcessInput(inputString) {
  // Split the entire input string into an array of individual lines.
  const inputLines = inputString.split('\n');

  // Parse the first line to extract the total number of elements.
  const numElements = parseInt(inputLines[0], 10);

  // Process the second line: split by space and convert each part to an integer.
  const dataArray = inputLines[1].split(' ').map(elementStr => parseInt(elementStr, 10));

  // Initialize a variable to keep track of the largest value encountered in the data array.
  let maxValue = 0;
  // Iterate through the data array to determine its maximum element.
  for (const currentElement of dataArray) {
    maxValue = currentElement > maxValue ? currentElement : maxValue;
  }

  // Create a frequency array (or "bins") to store counts of each number.
  // The size is `maxValue + 2` to accommodate indices up to `maxValue + 1` for calculations.
  const frequencyBins = new Array(maxValue + 2).fill(0);

  // An array to store the calculated sums based on adjacent frequency bins.
  const sumCounts = [];

  // Populate the frequency bins by counting occurrences of each number from the `dataArray`.
  for (let idx = 0; idx < numElements; idx++) {
    frequencyBins[dataArray[idx]]++;
  }

  // Iterate through possible bin indices to calculate sums of adjacent frequencies.
  for (let binIndex = 0; binIndex <= maxValue; binIndex++) {
    if (binIndex === 0) {
      // For the first bin, sum its frequency with the frequency of the next bin.
      sumCounts.push(frequencyBins[binIndex] + frequencyBins[binIndex + 1]);
    } else {
      // For other bins, sum the frequencies of the previous, current, and next bins.
      sumCounts.push(frequencyBins[binIndex - 1] + frequencyBins[binIndex] + frequencyBins[binIndex + 1]);
    }
  }

  // Re-initialize a variable to find the maximum value within the `sumCounts` array.
  let maxSum = 0;
  // Iterate through the `sumCounts` array to find the highest calculated sum.
  for (const currentSum of sumCounts) {
    maxSum = currentSum > maxSum ? currentSum : maxSum;
  }

  // Output the final maximum sum to the console.
  console.log(maxSum);
}

// Read the input from standard input using Node.js file system module,
// then invoke the main processing function with the obtained string.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
