let ProcessInput = function(rawData) {
  // Divide the incoming text into individual lines for processing.
  let lines = rawData.split('\n');

  // Extract the primary configuration parameters from the first line.
  let firstLineElements = lines[0].split(' ');
  let numRows = parseInt(firstLineElements[0], 10); // Corresponds to N
  let numCols = parseInt(firstLineElements[1], 10); // Corresponds to M
  let thresholdOffset = parseInt(firstLineElements[2], 10); // Corresponds to C

  // Parse the second line to obtain the array of weight coefficients.
  let weightsArray = lines[1].split(' ').map(valueString => ~~valueString); // Corresponds to B

  // Initialize an empty array to store the two-dimensional data matrix.
  let dataMatrix = []; // Corresponds to A
  // Populate the data matrix by parsing subsequent lines.
  for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
    dataMatrix[rowIndex] = lines[rowIndex + 2].split(' ').map(valueString => ~~valueString);
  }

  // Define a constructor for our data processing utility.
  let SolutionProcessor = function() {};

  // Assign the core calculation method to the prototype of the utility.
  SolutionProcessor.prototype = {
    calculatePositiveResults: function() {
      let positiveCount = 0; // A counter for results exceeding zero.

      // Iterate through each row of the input data matrix.
      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        let currentSum = 0; // Accumulator for the current row's calculation.
        currentSum = currentSum + thresholdOffset; // Start with the constant offset.

        // Perform a weighted sum for the current row using the weights array.
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
          debugger; // Debugger statement, retained as per Type II rules.
          currentSum = currentSum + dataMatrix[rowIndex][colIndex] * weightsArray[colIndex];
        }

        // If the calculated sum for the row is positive, increment the counter.
        if (currentSum > 0) {
          positiveCount++;
        }
      }
      return positiveCount; // Return the final tally of positive outcomes.
    }
  };

  // Create an instance of our processing utility.
  let processorInstance = new SolutionProcessor();
  // Execute the calculation and output the result to the console.
  console.log(processorInstance.calculatePositiveResults());
};

// Read the entire content from standard input and pass it to the main processing function.
let stdInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
ProcessInput(stdInputContent);

/*
// Example of how to use the function with a hardcoded input string,
// similar to the original's commented-out section.
let sampleInputData = `5 2 -4
-2 5
100 41
100 40
-3 0
-6 -2
18 -13`;
ProcessInput(sampleInputData);
*/
