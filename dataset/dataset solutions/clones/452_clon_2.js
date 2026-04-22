// This function orchestrates the primary processing sequence
function executeCoreLogic() {

  // Declare variables for card values, their presence map, a temporary holder, and iterators.
  var
    numerics,
    valuePresence,
    exchangeVal,
    currentPosition = 0,
    innerIndex;

  // Begin an indefinite loop to process input data segments.
  for (; /* This loop continues until an explicit break condition is met */ ;) {
    // Check if the current input segment indicates termination (value 0).
    if (incomingStream[currentPosition] == 0) {
      break; // Exit the processing loop.
    }

    // Initialize an array to store five numeric values.
    numerics = [];
    // Populate the 'numerics' array with five values from the incoming stream.
    for (innerIndex = 0; innerIndex < 5; innerIndex++) {
      numerics.push(Number(incomingStream[currentPosition++]));
    }

    // Create a map to track the presence of unique numeric values.
    valuePresence = numerics.reduce(function (valueTracker, currentNumeric) {
      return (valueTracker[currentNumeric] = true, valueTracker);
    }, {}); // Start with an empty object as the initial accumulator.

    // Extract unique numeric values, convert them to numbers, and sort them in ascending order.
    var distinctValues = Object.keys(valuePresence)
      .map(Number)
      .sort(function (firstNum, secondNum) {
        return firstNum - secondNum; /* Standard numeric sort */
      });

    // Check if exactly two distinct values were found.
    if (distinctValues.length === 2) {
      // Further check if these two distinct values are separated by 2 (e.g., 1 and 3).
      if (distinctValues[1] - distinctValues[0] == 2) {
        // If so, swap their positions.
        exchangeVal = distinctValues[0];
        distinctValues[0] = distinctValues[1];
        distinctValues[1] = exchangeVal;
      }
      // For each numeric value, print its index (plus one) within the distinct sorted values.
      numerics.forEach(function (val) {
        console.log(distinctValues.indexOf(val) + 1);
      });
    } else {
      // If not exactly two distinct values, print '3' for each numeric value.
      numerics.forEach(function () {
        console.log(3);
      });
    }
  }
}

// Global variable to accumulate incoming data.
var incomingStream = '';

// Resume standard input stream.
process.stdin.resume();
// Set encoding for the input stream.
process.stdin.setEncoding('utf8');

// Event listener for data chunks.
process.stdin.on('data', function (dataPortion) {
  incomingStream += dataPortion; // Append new data to the buffer.
});

// Event listener for end of input stream.
process.stdin.on('end', function () {
  // Split the accumulated data by newline characters.
  incomingStream = incomingStream.split('\n');
  // Execute the main processing logic.
  executeCoreLogic();
});