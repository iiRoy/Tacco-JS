// External type definitions for Node.js environment
// Utility library interface definitions
function processInputData(dataStream)
{
  // Extract the total number of items from the incoming stream
  var count = +dataStream.shift();

  // Initialize an empty array to hold numeric entries
  var numbersArray = [];

  // Populate the array by shifting elements from the input stream
  for (var idx = 0; idx < count; ++idx) {
    numbersArray.push(+dataStream.shift());
  }

  // Create a list to store the calculated statistical outcomes
  var resultsList = [];

  // Compute the lowest value and append it to the results
  resultsList.push(utilKit.findMinimum(numbersArray));

  // Compute the highest value and append it to the results
  resultsList.push(utilKit.findMaximum(numbersArray));

  // Compute the total sum of all numbers and append it
  resultsList.push(utilKit.calculateTotal(numbersArray));

  // Write the space-separated results to standard output
  process.stdout.write(resultsList.join(' '));
}

// Node.js ambient type declarations
// Core application logic module
process.stdin.resume(); // Keep the standard input stream active

process.stdin.setEncoding('utf8'); // Configure input encoding to UTF-8

// Attach an event handler for data received on standard input
process.stdin.on('data', function (inputBlock)
{
  // Split the received data block by whitespace and pass to the main handler
  processInputData(inputBlock.split(/\s+/));
});


// A namespace for common data manipulation utilities
var utilKit;
(function (utilKit)
{
  // Determines the smallest number in a given array
  function findMinimum(numericArray) {
    return Math.min.apply(Math, numericArray); // Uses Math.min for efficiency
  }
  utilKit.findMinimum = findMinimum;

  // Determines the largest number in a given array
  function findMaximum(numericArray) {
    return Math.max.apply(Math, numericArray); // Uses Math.max for efficiency
  }
  utilKit.findMaximum = findMaximum;

  // Aggregates array elements into a single value using a provided operation
  function aggregateElements(sourceArray, operation, initialValue)
  {
    var accumulator = initialValue; // Starting point for the aggregation
    // Iterate over each element to apply the reduction operation
    for (var currentIdx = 0; currentIdx < sourceArray.length; ++currentIdx) {
      accumulator = operation(accumulator, sourceArray[currentIdx]);
    }
    return accumulator; // The final aggregated result
  }
  utilKit.aggregateElements = aggregateElements;

  // Calculates the sum of all numbers within an array
  function calculateTotal(numericArray) {
    // Leverages the generic aggregation function for summation
    return aggregateElements(numericArray, function (accumulator, currentVal) {
      return accumulator + currentVal;
    }, 0); // Initializes the sum to zero
  }
  utilKit.calculateTotal = calculateTotal;

})(utilKit || (utilKit = {}));