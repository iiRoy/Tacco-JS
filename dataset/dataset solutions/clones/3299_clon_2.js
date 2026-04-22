// Function responsible for processing the input collection and computing the final result.
function processInputData(rawData) {
  // Extract the total count of data points from the first element of the raw input.
  var numEntries = parseInt(rawData[0]);

  // Initialize a collection to store intermediate and final computation results.
  var calculatedValues = new Array(numEntries);

  // Iterate through each data entry, starting from the first.
  for (var entryIndex = 0; entryIndex < numEntries; entryIndex++) {
    // Parse the current line of input, skipping the first line which contains numEntries.
    var currentLineValues = rawData[entryIndex + 1].split(' ');

    // Handle the base case for the very first entry.
    if (entryIndex === 0) {
      // Directly store the parsed integer values for the first entry.
      calculatedValues[0] = [
        parseInt(currentLineValues[0]),
        parseInt(currentLineValues[1]),
        parseInt(currentLineValues[2])
      ];
    }
    // Process subsequent entries by performing dynamic programming calculations.
    else {
      // Iterate through the three possible choices for the current entry (e.g., colors).
      for (var colorIndex = 0; colorIndex < 3; colorIndex++) {
        // Initialize a variable to track the highest cumulative sum found for the current choice.
        var highestPrevSum = undefined;

        // Iterate through alternative choices from the previous entry to find the optimal path.
        for (var offset = 1; offset < 3; offset++) {
          // Determine the index of the alternative choice (e.g., a different color).
          var alternativeColorIndex = (colorIndex + offset) % 3;
          // Calculate a potential new sum by adding the current choice's value to a previous optimal sum.
          var potentialSum = calculatedValues[entryIndex - 1][alternativeColorIndex] + parseInt(currentLineValues[colorIndex]);

          // Update the highest previous sum if the current potential sum is greater or if it's the first comparison.
          if (highestPrevSum === undefined || highestPrevSum < potentialSum) {
            highestPrevSum = potentialSum;
          }
        }
        // Ensure the current entry's array is initialized before assigning a value.
        if (!calculatedValues[entryIndex]) calculatedValues[entryIndex] = [];
        // Store the maximum calculated sum for the current entry and choice.
        calculatedValues[entryIndex][colorIndex] = highestPrevSum;
      }
    }
  }

  // After all computations, print the maximum value from the last set of calculated results.
  console.log(Math.max(...calculatedValues[numEntries - 1]));
}

// Variable to accumulate incoming standard input data.
var incomingData = '';

// Begin listening for standard input.
process.stdin.resume();
// Set the character encoding for the incoming data.
process.stdin.setEncoding('utf8');
// Event listener for when data chunks are received.
process.stdin.on('data', function(dataSegment) {
  incomingData += dataSegment; // Append the new data chunk to the accumulator.
});
// Event listener for when all standard input has been received.
process.stdin.on('end', function() {
  // Split the accumulated data into an array of lines.
  incomingData = incomingData.split('\n');
  // Invoke the main processing function with the prepared input array.
  processInputData(incomingData);
});