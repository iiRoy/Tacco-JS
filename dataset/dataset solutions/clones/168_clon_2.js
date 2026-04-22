// This program processes numerical inputs to find mathematical expressions that evaluate to 10.

// Main function to orchestrate the processing of all received input data.
function processInputData() {
  // Iterate through each individual line or segment of text from the input.
  incomingData
    .forEach(
      function(textSegment) {
        // Declare and initialize a variable to hold numeric values.
        // It splits the text segment by spaces and converts each part to a floating-point number.
        var numericValues = textSegment.split(' ').map(parseFloat);

        // Check for invalid input: if the number of values is not exactly four,
        // or if the line is the specific termination signal "0 0 0 0",
        // then skip this segment and proceed to the next.
        if (numericValues.length !== 4 || textSegment.indexOf('0 0 0 0') === 0) {
          return;
        }

        // If the input is valid, attempt to find an expression that evaluates to 10
        // for the given numbers and log the result to the console.
        console.log(findTargetEquation(numericValues));
      }
    );
}

// Global array containing the basic mathematical operators that can be used.
var mathematicalOperators = ['+', '-', '*'];

// Global array of string patterns representing different structural forms of expressions.
// The '@' acts as a placeholder for numbers, and '%' for operators.
var formulaPatterns = [
  '(@%@)%(@%@)',
  '@%(@%@)%@',
  '@%@%@%@',
  '(@%(@%@))%@'
];

// Utility function to construct a complete mathematical expression string
// by filling a pattern with specific numbers and operators.
function buildEquation(patternText, numParts, opParts) {
  var
    valueIndex = 0, // Iterator for the array of numeric parts.
    operatorIndex = 0; // Iterator for the array of operator parts.

  // First, replace all number placeholders ('@') in the pattern with actual numeric values.
  // Then, replace all operator placeholders ('%') with actual operator symbols.
  return patternText
    .replace(/@/g, function() {
      return numParts[valueIndex++];
    })
    .replace(/%/g, function() {
      return opParts[operatorIndex++];
    });
}

// Recursive function to generate all possible permutations (arrangements) of elements in an array.
function createArrangements(inputSequence) {
  var
    currentItem, // Holds the element currently being processed.
    iterator, // Loop counter.
    sequenceSize = inputSequence.length, // The total number of elements in the input array.
    outputPerms = []; // An array to accumulate all generated permutations.

  // Base case: If the input array is empty, there's only one permutation (an empty array).
  if (sequenceSize === 0) {
    return [
      []
    ];
  }

  // Iterate through each element of the input sequence.
  for (iterator = 0; iterator < sequenceSize; iterator++) {
    // Remove the current element from the beginning of the sequence.
    currentItem = inputSequence.shift();

    // Recursively find all permutations of the remaining elements.
    // For each sub-permutation, prepend the `currentItem` to form new permutations.
    outputPerms = outputPerms.concat(
      createArrangements(inputSequence)
      .map(function(partialArrangement) {
        return (partialArrangement.unshift(currentItem), partialArrangement);
      })
    );

    // After processing, add the `currentItem` back to the end of the sequence
    // to restore the original array for the next iteration's shift operation.
    inputSequence.push(currentItem);
  }
  return outputPerms; // Return the comprehensive list of all permutations.
}

// Main logic function to find an expression that evaluates to 10 using a given set of numbers.
function findTargetEquation(initialValues) {
  var
    outerLoopA, outerLoopB, outerLoopC, outerLoopD, outerLoopE, // Multiple loop counters for exhaustive search.
    constructedFormula; // Variable to store the dynamically generated expression string.

  // Generate all possible permutations of the four initial numeric values.
  initialValues = createArrangements(initialValues);

  // Loop through each permutation of the numbers (24 permutations for 4 numbers).
  for (outerLoopA = 0; outerLoopA < 24; outerLoopA++) {
    // Loop through each possible operator for the first position.
    for (outerLoopB = 0; outerLoopB < 3; outerLoopB++) {
      // Loop through each possible operator for the second position.
      for (outerLoopC = 0; outerLoopC < 3; outerLoopC++) {
        // Loop through each possible operator for the third position.
        for (outerLoopD = 0; outerLoopD < 3; outerLoopD++) {
          // Loop through each of the four predefined expression patterns.
          for (outerLoopE = 0; outerLoopE < 4; outerLoopE++) {
            // Construct the full expression string using the current pattern,
            // the current number permutation, and the selected operators.
            constructedFormula = buildEquation(
              formulaPatterns[outerLoopE],
              initialValues[outerLoopA],
              [mathematicalOperators[outerLoopB], mathematicalOperators[outerLoopC], mathematicalOperators[outerLoopD]]
            );

            // Evaluate the constructed mathematical expression.
            // If its result is exactly 10, we have found a solution.
            if (eval(constructedFormula) === 10) {
              return constructedFormula; // Return the successful expression string.
            }
          }
        }
      }
    }
  }
  return 0; // If no expression evaluates to 10 after checking all possibilities, return 0.
}

// Global variable to accumulate all chunks of raw data received from standard input.
var rawInputBuffer = '';
// Global variable to store the processed input as an array of lines.
var incomingData;

// Start listening for input stream events.
process.stdin.resume();

// Configure the encoding for the incoming data stream to UTF-8.
process.stdin.setEncoding('utf8');

// Event handler for when a new chunk of data is received from standard input.
process.stdin.on('data', function(chunkOfData) {
  rawInputBuffer += chunkOfData; // Append the new data chunk to the buffer.
});

// Event handler for when the end of the standard input stream is detected.
process.stdin.on('end', function() {
  // Once all data has been received, split the entire buffer into an array of lines.
  incomingData = rawInputBuffer.split('\n');
  // Initiate the main processing logic with the prepared input data.
  processInputData();
});