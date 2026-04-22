function ProcessInputData(rawData) {
  // Split the raw input string into an array of lines
  let linesArray = rawData.split("\n");

  // Parse the first line to get the count of numbers
  // Using parseInt for explicit type conversion
  const countOfNumbers = parseInt(linesArray[0], 10);

  // Split the second line to get an array of number strings
  const numericStrings = linesArray[1].split(" ");

  // Initialize a frequency map for prefix sums.
  // A sum of 0 appears once initially (before any numbers are added).
  const prefixSumFrequencies = { 0: 1 };

  // Initialize the current running total
  let currentPrefixSum = 0;

  // Iterate through the numeric strings to calculate prefix sums and their frequencies
  for (let idx = 0; idx < countOfNumbers; idx++) {
    // Add the current number (parsed as an integer) to the running total
    currentPrefixSum += parseInt(numericStrings[idx], 10);

    // Increment the frequency of the current prefix sum in the map
    // If it doesn't exist, initialize it to 1
    if (prefixSumFrequencies[currentPrefixSum]) {
      prefixSumFrequencies[currentPrefixSum]++;
    } else {
      prefixSumFrequencies[currentPrefixSum] = 1;
    }
  }

  // Initialize the final count of pairs that sum to zero
  let resultantPairs = 0;
  let frequencyValue; // Temporary variable to hold frequency

  // Iterate over the keys (prefix sums) in the frequency map
  for (const sumKey in prefixSumFrequencies) {
    // Check if the property belongs to the object itself (not prototype chain)
    if (Object.prototype.hasOwnProperty.call(prefixSumFrequencies, sumKey)) {
      // Get the frequency of the current prefix sum
      // This assignment also acts as a truthy check
      if ((frequencyValue = prefixSumFrequencies[sumKey])) {
        // Calculate the number of pairs that can be formed from this frequency
        // (n * (n - 1) / 2 combination formula)
        resultantPairs += (frequencyValue * (frequencyValue - 1)) / 2;
      }
    }
  }

  // Output the final calculated number of pairs
  console.log(resultantPairs);
}

// Read input from standard input and then process it
ProcessInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));