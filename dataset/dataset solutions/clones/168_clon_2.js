function executeProgram() {
  // Process each line of input data
  rawInputData.forEach(function(lineOfText) {
    // Parse numbers from the current line
    var numericValues = lineOfText.split(' ').map(parseFloat);

    // Skip invalid input lines or the termination signal
    if (numericValues.length !== 4 || lineOfText.indexOf('0 0 0 0') === 0) {
      return;
    }

    // Find and display the expression that evaluates to 10
    console.log(findTenExpression(numericValues));
  });
}

// Available arithmetic operators
var arithmeticOps = ['+', '-', '*'];

// Templates for expression structures
var expressionTemplates = [
  '(@%@)%(@%@)',
  '@%(@%@)%@',
  '@%@%@%@',
  '(@%(@%@))%@'
];

/**
 * Constructs a mathematical formula string from a template, operands, and operators.
 * @param {string} templateString - The template with placeholders '@' for operands and '%' for operators.
 * @param {Array<number>} operandArray - An array of numbers to insert as operands.
 * @param {Array<string>} operatorArray - An array of operators to insert.
 * @returns {string} The formatted expression string.
 */
function constructFormula(templateString, operandArray, operatorArray) {
  var idxA = 0; // Index for operandArray
  var idxB = 0; // Index for operatorArray

  // Replace operand placeholders
  let intermediateString = templateString.replace(/@/g, function() {
    return operandArray[idxA++];
  });

  // Replace operator placeholders
  return intermediateString.replace(/%/g, function() {
    return operatorArray[idxB++];
  });
}

/**
 * Generates all possible permutations of an array's elements.
 * @param {Array<any>} sourceElements - The array for which to generate permutations.
 * @returns {Array<Array<any>>} An array containing all permutations.
 */
function generatePermutations(sourceElements) {
  var currentElement;
  var arrayLength = sourceElements.length;
  var resultPermutations = [];

  // Base case: an empty array has one permutation (an empty array)
  if (arrayLength === 0) {
    return [
      []
    ];
  }

  // Iterate through each element to make it the first in a permutation
  for (let i = 0; i < arrayLength; i++) {
    currentElement = sourceElements.shift(); // Remove the current element

    // Recursively get permutations of the remaining elements
    resultPermutations = resultPermutations.concat(
      generatePermutations(sourceElements).map(function(subPermutation) {
        // Add the current element back to the front of each sub-permutation
        subPermutation.unshift(currentElement);
        return subPermutation;
      })
    );

    sourceElements.push(currentElement); // Put the element back for the next iteration
  }
  return resultPermutations;
}

/**
 * Attempts to find an arithmetic expression using the given numbers that evaluates to 10.
 * @param {Array<number>} inputNumbers - An array of four numbers.
 * @returns {string|number} The expression string if found, otherwise 0.
 */
function findTenExpression(inputNumbers) {
  var numPermIdx, op1Idx, op2Idx, op3Idx, templateIdx; // Loop counters
  var evaluatedFormula; // Stores the generated formula string

  // Generate all permutations of the input numbers
  let numberPermutations = generatePermutations(inputNumbers);

  // Iterate through all permutations of numbers (4! = 24)
  for (numPermIdx = 0; numPermIdx < 24; numPermIdx++) {
    // Iterate through all possible operators for the first position (3 choices)
    for (op1Idx = 0; op1Idx < 3; op1Idx++) {
      // Iterate through all possible operators for the second position (3 choices)
      for (op2Idx = 0; op2Idx < 3; op2Idx++) {
        // Iterate through all possible operators for the third position (3 choices)
        for (op3Idx = 0; op3Idx < 3; op3Idx++) {
          // Iterate through all expression templates (4 choices)
          for (templateIdx = 0; templateIdx < 4; templateIdx++) {
            // Construct the formula string
            evaluatedFormula = constructFormula(
              expressionTemplates[templateIdx],
              numberPermutations[numPermIdx],
              [arithmeticOps[op1Idx], arithmeticOps[op2Idx], arithmeticOps[op3Idx]]
            );

            // Evaluate the formula and check if it equals 10
            if (eval(evaluatedFormula) === 10) {
              return evaluatedFormula; // Return the expression if found
            }
          }
        }
      }
    }
  }
  return 0; // Return 0 if no expression evaluates to 10
}

// Global variable to accumulate input from stdin
var rawInputData = '';

// Set up stdin processing
process.stdin.resume(); // Keep the process alive
process.stdin.setEncoding('utf8'); // Expect UTF-8 encoded text

// Event listener for incoming data chunks
process.stdin.on('data', function(dataChunk) {
  rawInputData += dataChunk; // Append chunk to the input string
});

// Event listener for end of input stream
process.stdin.on('end', function() {
  // Split the accumulated input into lines and remove any empty lines
  rawInputData = rawInputData.split('\n').filter(line => line.trim() !== '');
  executeProgram(); // Start the main program logic
});
