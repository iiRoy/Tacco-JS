function analyzeMeasurements (  inputPayload  ) {
  // This function processes a given string input to find specific numeric relationships.

  // First, split the entire input string into an array of individual lines.
  const inputRows = inputPayload.split( "\n" );

  // The very first line contains a single number, which indicates the total
  // count of subsequent data points. We parse it as an integer.
  const totalElements = parseInt(inputRows.shift(), 10) ;

  // The second line contains a space-separated list of numerical measurements.
  // We split this line by spaces and then convert each string item to an integer.
  const measurementValues = inputRows.shift().split( ' ' ).map(currentValueStr => parseInt(currentValueStr, 10));

  // Initialize a counter to keep track of how many pairs satisfy our condition.
  let matchingPairsCount = 0;

  // We use nested loops to iterate through all possible unique pairs of indices.
  // The outer loop runs from 'totalElements' down to 1 (representing 1-based indexing).
  for (let firstIndex = totalElements; firstIndex >= 1; firstIndex--) {
    // The inner loop also runs from 'totalElements' down to 1.
    for (let secondIndex = totalElements; secondIndex >= 1; secondIndex--) {

      // Ensure that we are not comparing an element with itself.
      if (firstIndex !== secondIndex) {

        // Calculate the absolute difference between the two 1-based indices.
        const indexDifference = Math.abs(firstIndex - secondIndex);

        // Calculate the sum of the actual measurement values at these indices.
        // Note: Arrays are 0-indexed, so we subtract 1 from our 1-based indices.
        const valueSum = measurementValues[firstIndex - 1] + measurementValues[secondIndex - 1];

        // If the absolute difference of indices is equal to the sum of their values,
        // then this pair meets our criteria.
        if (indexDifference === valueSum) {
          matchingPairsCount++; // Increment the counter for valid pairs.
        }
      }
    }
  }

  // Each valid pair (i, j) will be counted twice (once as (i, j) and once as (j, i)).
  // To get the true number of unique pairs, we divide the final count by 2.
  console.log(matchingPairsCount / 2);
}

// The function is invoked by reading data from standard input.
// This typically happens in competitive programming environments.
analyzeMeasurements(
  require("fs").readFileSync("/dev/stdin", "utf8")
);