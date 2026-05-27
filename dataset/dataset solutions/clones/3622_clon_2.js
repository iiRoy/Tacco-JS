function processInput(rawData) {
  // Trim any leading or trailing whitespace from the raw input string.
  rawData = rawData.trim();

  // Parse the first number from the input string as the target value.
  // The input is expected to be space-separated, and we take the first part.
  const targetValue = parseInt(rawData.split(" ")[0], 10);

  // Initialize an array to store all possible sums.
  let calculatedSums = [];

  // Iterate through possible values for the first coefficient (up to 25).
  for (let outerIndex = 0; outerIndex <= 25; outerIndex++) {
    // For each value of the first coefficient, iterate through possible values for the second (up to 15).
    for (let innerIndex = 0; innerIndex <= 15; innerIndex++) {
      // Calculate the sum using the formula 4*i + 7*j and add it to our list.
      calculatedSums.push(4 * outerIndex + 7 * innerIndex);
    }
  }

  // Check if the target value exists within the array of calculated sums.
  if (calculatedSums.indexOf(targetValue) >= 0) {
    // If found, print "Yes" to standard output.
    console.log("Yes");
  } else {
    // Otherwise, print "No".
    console.log("No");
  }
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
