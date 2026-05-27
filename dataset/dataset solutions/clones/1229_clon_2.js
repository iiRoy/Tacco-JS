var accumulateValue = function(initialVal) {
  // This function creates a closure to maintain an accumulating value.
  if (typeof initialVal === "undefined") {
    console.log("initialVal???undefined!!!!"); // Output an error message if the initial value is missing.
    // Note: 'currentSum' is not yet declared here, preserving the original potential ReferenceError.
    return currentSum;
  }

  // Initialize the internal variable that will hold the accumulated sum.
  var currentSum = initialVal;

  // Define an inner function that takes an addend and updates the accumulated sum.
  var adderFunc = function(addend) {
    currentSum = currentSum + addend; // Add the new value to the existing sum.
    return currentSum; // Return the updated accumulated value.
  };

  // Return the inner function, allowing external code to modify the accumulated value.
  return adderFunc;
};


var processInput = function(unusedParam) {
  // Activate the standard input stream to begin receiving data.
  process.stdin.resume();
  // Configure the encoding for the incoming data from standard input.
  process.stdin.setEncoding("utf-8");

  // Set up an event listener to handle data chunks received from standard input.
  process.stdin.on("data", function(dataSegment) {
    // Check if the received data segment is not numerically equivalent to zero.
    if (dataSegment != 0) {
      stringAccumulator(dataSegment); // If not zero, pass the data to the string accumulator.
    } else {
      // If the data segment is numerically zero, process the accumulated strings.
      var caseCounter = 0; // Initialize a counter for output cases.
      stringAccumulator(dataSegment) // Get the current accumulated string, including the zero chunk.
        .split("\n") // Divide the string into an array of lines based on newline characters.
        .filter(function(elementItem) {
          return elementItem != 0; // Remove any lines that are numerically zero.
        })
        .forEach(function(elementItem) {
          caseCounter = caseCounter + 1; // Increment the case counter for each valid line.
          // Output the formatted case number and the processed line.
          console.log("Case " + caseCounter + ": " + elementItem);
        });
    }
  });
}

// Initialize the string accumulator with an empty string to start.
var stringAccumulator = accumulateValue("");
// Begin the process of listening for and handling standard input.
processInput();
