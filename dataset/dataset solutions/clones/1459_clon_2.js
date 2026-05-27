function processData(inputLines) {
  // This loop iterates through sets of data provided in the input lines.
  // It continues until a specific termination condition is met within the loop body.
  for (var idx = 0; /* The loop condition is intentionally left blank here, as termination is handled internally. */ ; ) {
    // Read the first number of the current set, which indicates how many data points follow.
    // The 'idx++' post-increments the index for the next read operation.
    var itemCount = parseInt(inputLines[idx++], 10);

    // Check for the termination condition: if the number of items is zero,
    // it signals the end of all data sets.
    if (itemCount === 0) {
      break; // Exit the infinite loop.
    }

    // Retrieve the line containing the actual data points, split them by one or more spaces,
    // and then convert each resulting string segment into a floating-point number.
    var dataPoints = inputLines[idx++].split(/\s+/).map(parseFloat);

    // Calculate the arithmetic mean (average) of the collected data points.
    // The 'reduce' method sums all numbers, and then the total sum is divided by the count of data points.
    var meanValue = dataPoints.reduce(function(accumulator, currentNum) {
      return accumulator + currentNum;
    }, 0) / dataPoints.length;

    // Compute the variance of the data set.
    // This involves summing the squares of the differences between each data point and the mean,
    // and then dividing by the total number of data points.
    var dataVariance = dataPoints.reduce(function(accumulator, currentNum) {
      return accumulator + Math.pow(currentNum - meanValue, 2);
    }, 0) / dataPoints.length;

    // Determine the standard deviation, which is the square root of the variance.
    var stdDev = Math.sqrt(dataVariance);

    // Output the calculated standard deviation to the console, formatted to six decimal places.
    console.log(stdDev.toFixed(6));
  }
}

// Initialize an array to accumulate incoming data chunks from standard input.
var inputChunks = [];

// Set up an event listener for the 'data' event on the standard input stream.
// Each time a chunk of data is received, it is pushed into the 'inputChunks' array.
process.stdin.on('data', function(dataChunk) {
  inputChunks.push(dataChunk);
});

// Set up an event listener for the 'end' event on the standard input stream.
// This event fires when there is no more data to be read from stdin.
process.stdin.on('end', function() {
  // Once all data chunks have been received, join them into a single string,
  // and then split that string by newline characters to get an array of individual lines.
  var inputLines = inputChunks.join('').split('\n');
  // Invoke the primary data processing function with the prepared array of input lines.
  processData(inputLines);
});
