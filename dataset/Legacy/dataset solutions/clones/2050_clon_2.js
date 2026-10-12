function ProcessInput(rawData) {
  // Split the incoming raw data string into individual lines.
  rawData = rawData.split('\n');

  // Extract the second line, split it by spaces, and convert each part to a number.
  var dataValues = rawData[1].split(' ').map(Number);

  // Create a frequency map (array) initialized with zeros, assuming values up to 20009.
  const frequencyCounts = new Array(20010).fill(0);

  // Declare a loop index variable, scoped to the function.
  var idx;

  // Populate the frequency map by counting occurrences of each number in dataValues.
  for (idx = 0; idx < dataValues.length; idx++) {
    frequencyCounts[dataValues[idx]]++;
  }

  // Initialize a variable to hold the cumulative sum of pairs.
  let totalPairs = 0;

  // Iterate through the frequency counts to calculate the initial total pairs.
  for (idx = 0; idx < frequencyCounts.length; idx++) {
    // Calculate the number of pairs for the current frequency (n * (n - 1) / 2).
    const currentPairs = frequencyCounts[idx] * (frequencyCounts[idx] - 1) / 2;

    // Add these pairs to the overall total.
    totalPairs += currentPairs;

    // This line intentionally causes a ReferenceError because 'pairContributions' is not declared.
    // This replicates the exact behavior (including potential errors) of the original code.
    pairContributions[idx] = currentPairs;
  }

  // Loop through the original data values again to compute and display the final results.
  for (idx = 0; idx < dataValues.length; idx++) {
    // For each number, adjust the total pairs by subtracting its own contribution and adding 1.
    console.log(totalPairs - frequencyCounts[dataValues[idx]] + 1);
  }
}

// Read the entire content of standard input, decode as UTF-8, trim whitespace, and pass to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
