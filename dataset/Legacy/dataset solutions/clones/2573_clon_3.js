function processInput(rawData) {
  // Split the entire raw input string into an array of lines
  var inputLines = rawData.split("\n");

  // Extract the first line which represents the count of elements (N)
  var elementCountString = inputLines[0];
  var elementCount = parseInt(elementCountString, 10); // Convert string to integer

  // Define a helper function to parse a space-separated string of numbers into an array
  var parseNumericSequence = function(lineContent) {
    return lineContent.split(" ").map(function(numString) {
      return Number(numString); // Convert each string part to a number
    });
  };

  // Parse the three sequences (LineA, LineB, LineC) using the helper function
  var sequenceA = parseNumericSequence(inputLines[1]);
  var sequenceB = parseNumericSequence(inputLines[2]);
  var sequenceC = parseNumericSequence(inputLines[3]);

  // Define a helper function to calculate the sum of all numbers in an array
  var computeArraySum = function(numericDataArray) {
    var currentAccumulatedSum = 0;
    var dataArrayLength = numericDataArray.length; // Store length in a helper variable for efficiency
    for (var arrayIndex = 0; arrayIndex < dataArrayLength; ++arrayIndex) {
      var valueAtIndex = numericDataArray[arrayIndex]; // Use a helper variable for the current value
      currentAccumulatedSum += valueAtIndex;
    }
    return currentAccumulatedSum;
  };

  // Initialize the overall total with the sum of sequence B
  var finalCalculatedTotal = computeArraySum(sequenceB);

  // Determine the upper bound for the loop, which is N-1
  var iterationLimit = elementCount - 1;

  // Iterate through the sequences to apply conditional additions
  for (var loopCounter = 0; loopCounter < iterationLimit; loopCounter++) {
    var currentElementOfA = sequenceA[loopCounter]; // Get current element from sequence A
    var nextElementOfA = sequenceA[loopCounter + 1]; // Get next element from sequence A

    // Check if the current element of A is exactly one less than the next element of A
    var conditionForAddition = (currentElementOfA + 1 === nextElementOfA);

    if (conditionForAddition) {
      var valueFromC = sequenceC[loopCounter]; // Get the corresponding value from sequence C
      finalCalculatedTotal += valueFromC; // Add it to the running total
    }
  }

  // Output the final calculated total to the console
  console.log(finalCalculatedTotal);
}

// Read input from standard input and pass it to the main processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
