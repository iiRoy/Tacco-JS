// This function determines the combined absolute value of three consecutive elements in an array.
function CalculateTripletMagnitude (startIndex, valueArray) {
  var totalMagnitude = 0;

  totalMagnitude = Math.abs(valueArray[startIndex]); // Absolute value of the first element

  if (startIndex + 1 < valueArray.length) {
    totalMagnitude += Math.abs(valueArray[startIndex + 1]); // Add absolute value of the second element
  }

  if (startIndex + 2 < valueArray.length) {
    totalMagnitude += Math.abs(valueArray[startIndex + 2]); // Add absolute value of the third element
  }

  return totalMagnitude; // Return the sum of absolute values
}

// This utility function computes an overall satisfaction score from a collection of scores.
function EvaluateOverallSatisfaction(scoreCollection) {
  var currentScore = scoreCollection.reduce(function(accumulator, currentValue) {
    return accumulator + currentValue; // Sum all elements in the collection
  });

  currentScore -= scoreCollection.length; // Adjust the score by subtracting the number of elements

  return currentScore;
}

function ProcessInputData(rawData) {
  // Split the raw input into individual lines
  rawData = rawData.split("\n");

  // Parse the first line for configuration parameters
  var parsedLines = rawData[0].split(" ");
  const segmentCount = Number.parseInt(parsedLines[0]); // N: Total number of segments
  const operationLimit = Number.parseInt(parsedLines[1]); // K: Limit on operations

  // Parse the second line for the sequence string
  parsedLines = rawData[1].split(" ");
  const sequenceString = parsedLines[0]; // S: The main sequence

  // Convert the sequence string into an array of segment lengths
  // This section identifies consecutive blocks of identical characters.
  var segmentLengths = [];
  var firstChar = sequenceString.substr(0, 1); // Get the initial character
  var currentLength = 1; // Initialize counter for the current segment

  // Iterate through the sequence string to identify segments
  for (var charIndex = 1; charIndex < segmentCount; charIndex++) {
    // Check if the current character is different from the previous one
    if (sequenceString.substr(charIndex, 1) !== sequenceString.substr(charIndex - 1, 1)) {
      segmentLengths.push(currentLength); // Store the length of the completed segment
      currentLength = 0; // Reset the counter for the new segment
    }
    currentLength += 1; // Increment the length for the current segment
  }

  // Add the last segment's length if it hasn't been added yet
  if (currentLength !== 0) {
    segmentLengths.push(currentLength);
  }

  // Core processing logic starts here
  var finalOutcome = 0; // Variable to store the ultimate result
  var iterationCounter = 0; // This variable's value is not used in the original logic, but its declaration is structurally maintained.

  // Handle trivial cases where the segment array is small
  if (segmentLengths.length <= 2) {
    finalOutcome = segmentCount - 1; // A simple calculation for small inputs
  } else {
    // Perform operations up to the defined limit (K)
    // This section involves a cumulative sum type of processing
    for (var opNum = 0; opNum < operationLimit; opNum++) {
      // Calculate the initial triplet magnitude at index 0
      var bestMagnitudeSoFar = CalculateTripletMagnitude(0, segmentLengths);
      var bestPosition = 0; // Keep track of the position that yields the best magnitude

      // Iterate through the segment lengths to find the best possible triplet
      for (var checkIndex = 1; checkIndex < segmentLengths.length; checkIndex++) {
        // IMPORTANT: The original code calculates triplet magnitude always starting at index 1 here,
        // not at 'checkIndex'. This behavior is preserved to maintain structural identity.
        var currentMagnitude = CalculateTripletMagnitude(1, segmentLengths);
        if (bestMagnitudeSoFar < currentMagnitude) {
          bestMagnitudeSoFar = currentMagnitude; // Update if a better magnitude is found
          bestPosition = checkIndex; // Store the index of this better magnitude
        }
      }

      // Modify the segmentLengths array: replace three elements starting at bestPosition
      // with the bestMagnitudeSoFar found in this iteration.
      segmentLengths.splice(bestPosition, 3, bestMagnitudeSoFar);

      // Check if the optimal state (N-1) has been reached
      if (segmentCount - 1 === EvaluateOverallSatisfaction(segmentLengths)) {
        break; // Exit the loop early if optimal
      }
    }
    // After all operations, calculate the final satisfaction score
    finalOutcome = EvaluateOverallSatisfaction(segmentLengths);
  }

  // Output the computed final result to the console
  console.log(finalOutcome);
}

// Read the input from standard input and pass it to the main processing function
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));