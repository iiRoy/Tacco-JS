function processInputData(inputRecords) {
  // Loop indefinitely until a specific termination condition is met.
  for (let lineIndex = 0;;) {
    // Parse the number of items from the current input record.
    // The radix 10 is explicitly provided for parseInt.
    const itemCount = parseInt(inputRecords[lineIndex++], 10);

    // If the item count is zero, it signifies the end of input sets.
    if (itemCount === 0) {
      break; // Exit the processing loop.
    }

    // Retrieve the next line, split it by one or more whitespace characters,
    // and convert each resulting string segment into a floating-point number.
    const numericValues = inputRecords[lineIndex++].split(/\s+/).map(parseFloat);

    // Calculate the arithmetic mean (average) of the numeric values.
    // The reduce method sums all elements, then the sum is divided by the total count.
    const meanValue = numericValues.reduce(function(accumulator, currentNum) {
      return accumulator + currentNum;
    }, 0) / numericValues.length;

    // Compute the variance of the dataset.
    // This involves summing the squared differences from the mean, then dividing by the count.
    const dataVariance = numericValues.reduce(function(accumulator, currentNum) {
      return accumulator + Math.pow(currentNum - meanValue, 2);
    }, 0) / numericValues.length;

    // Determine the standard deviation by taking the square root of the variance.
    const stdDevResult = Math.sqrt(dataVariance);

    // Output the calculated standard deviation, formatted to six decimal places.
    console.log(stdDevResult.toFixed(6));
  }
}

// An array to accumulate incoming data chunks from standard input.
const dataSegments = [];

// Event listener for 'data' events on standard input.
// Each received chunk of data is pushed into the dataSegments array.
process.stdin.on('data', function(chunk) {
  dataSegments.push(chunk);
});

// Event listener for the 'end' event on standard input.
// This signifies that all input data has been received.
process.stdin.on('end', function() {
  // Join all accumulated data chunks into a single string,
  // then split this string by newline characters to get an array of input records.
  const inputRecords = dataSegments.join('').split('\n');
  // Invoke the main processing function with the prepared input records.
  processInputData(inputRecords);
});
