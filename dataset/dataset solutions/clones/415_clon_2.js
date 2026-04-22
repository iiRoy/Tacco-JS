// This routine executes a Breadth-First Search (BFS) to determine the minimum number of operations
// required to transform an initial character sequence into a state where all characters are identical.
function exploreStates (initialPattern) {

  // A hash map to store all unique character sequences encountered during the search.
  // This helps in avoiding redundant computations and detecting cycles.
  var seenConfigurations = {};

  // The primary queue for the BFS algorithm. Each element is an array containing:
  // [0] - The current character sequence string.
  // [1] - The number of operations performed to reach this sequence.
  var processingQueue = [ [initialPattern, 0] ];

  // Mark the starting pattern as visited to prevent re-processing.
  seenConfigurations[initialPattern] = true;

  // The main loop for the Breadth-First Search. It continues until a solution is found
  // or the queue becomes empty.
  while (true) {

    // If the processing queue is empty, it means all reachable states have been explored
    // and no solution was found.
    if (processingQueue.length === 0) {
      computationResult = "NA"; // Assigns 'Not Available' to a global result variable.
      break; // Exit the BFS loop.
    }

    // Dequeue the next state (character sequence and operation count) from the front of the queue.
    var currentElement = processingQueue.shift();

    // Extract the actual sequence string and its accumulated operation count.
    var currentSequence = currentElement[0];
    var operationCount = currentElement[1];

    // Check if the current sequence is a target state. A target state is one
    // where all characters are the same (e.g., "000", "111", "222").
    // The regular expression ensures the entire string consists solely of '0's, '1's, or '2's.
    if ( /^(0+|1+|2+)$/.test(currentSequence) ) {
      computationResult = operationCount; // A solution is found; store the operation count.
      break; // Exit the BFS loop as the shortest path is found.
    }

    // Iterate through the current sequence, considering each pair of adjacent characters.
    for (var idx = 0; idx < currentSequence.length - 1; idx++) {
      // If two adjacent characters are identical, no operation can be performed on them
      // to change their state according to the problem rules, so skip this pair.
      if (currentSequence[idx] === currentSequence[idx + 1]) {
        continue;
      }

      // Convert the string sequence into a mutable array of characters to allow modification.
      var sequenceChars = currentSequence.split("");

      // Calculate the new value for the adjacent differing characters.
      // The rule is to replace two different colors (0,1 or 0,2 or 1,2) with the third color.
      // Example: 0 and 1 become 2 (3 - 0 - 1 = 2).
      var replacementValue = 3 - ( +sequenceChars[idx] ) - ( +sequenceChars[idx + 1] );

      // Apply the calculated replacement value to both adjacent characters in the array.
      sequenceChars[idx] = replacementValue;
      sequenceChars[idx + 1] = replacementValue;

      // Join the modified character array back into a string to form the new sequence state.
      var nextSequence = sequenceChars.join("");

      // Check if this newly generated sequence has been visited before.
      // If it's a new configuration, add it to the queue for future processing.
      if (seenConfigurations.hasOwnProperty(nextSequence) === false) {
        // Enqueue the new sequence along with its incremented operation count.
        processingQueue.push([nextSequence, operationCount + 1]);

        // Mark this new sequence as visited in the map.
        seenConfigurations[nextSequence] = true;
      }
    }
  }
}

// A global variable to hold the final result of the BFS computation.
// This mirrors the original code's implicit global assignment.
var computationResult;

// Read the entire raw input data from standard input (e.g., '/dev/stdin').
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split it into an array of individual lines.
var inputLines = (rawData.trim()).split("\n");

// Begin the main loop for processing each line of input.
while (true) {
  // Retrieve the next sequence string from the beginning of the input lines array.
  var sequenceToProcess = inputLines.shift();

  // If the extracted sequence is "0", it signals the end of input, so terminate the loop.
  if (sequenceToProcess === "0") {
    break;
  }

  // Transform the input sequence by replacing 'r', 'g', 'b' characters with '0', '1', '2' respectively.
  // This standardizes the input for the `exploreStates` function.
  sequenceToProcess = sequenceToProcess.replace(/r/g, "0").replace(/g/g, "1").replace(/b/g, "2");

  // Invoke the BFS algorithm with the transformed sequence.
  // The outcome (number of operations or "NA") will be stored in `computationResult`.
  exploreStates(sequenceToProcess);

  // Print the final result for the current input sequence to the console.
  console.log(computationResult);
}