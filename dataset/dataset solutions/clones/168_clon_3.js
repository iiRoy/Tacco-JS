let incomingDataBuffer = ''; // Global storage for raw data chunks from standard input.

// Collection of fundamental arithmetic operations.
const fundamentalOperators = ['+', '-', '*'];

// Array of expression blueprints with placeholders.
// '@' denotes a number, '%' denotes an operator.
const formulaTemplates = [
  '(@%@)%(@%@)',  // (A op B) op (C op D)
  '@%(@%@)%@',    // A op (B op C) op D
  '@%@%@%@',      // A op B op C op D
  '(@%(@%@))%@',  // (A op (B op C)) op D
  '((@%@)%@)%@'   // New template: ((A op B) op C) op D
];

/**
 * Dynamically constructs an arithmetic expression string from a template,
 * an array of numerical operands, and an array of operator symbols.
 *
 * @param {string} patternTxt The template string (e.g., '(@%@)%(@%@)').
 * @param {number[]} operandValues An ordered array of numbers.
 * @param {string[]} operatorSymbols An ordered array of operator strings.
 * @returns {string} The fully assembled expression string, or a string with error indicators if placeholders couldn't be filled.
 */
function assembleFormula(patternTxt, operandValues, operatorSymbols) {
  let numberIndex = 0;
  let operatorIndex = 0;
  let constructedString = '';

  // Basic validation for input arrays (Type III addition).
  if (!Array.isArray(operandValues) || !Array.isArray(operatorSymbols)) {
    console.error("Critical: Invalid input types provided to assembleFormula.");
    return '';
  }

  // Iterate over each character of the template string.
  for (let character of patternTxt) {
    if (character === '@') {
      // Replace number placeholder.
      if (numberIndex < operandValues.length) {
        constructedString += operandValues[numberIndex++];
      } else {
        // Handle case where not enough numbers are provided (Type III: more robust error handling).
        console.warn("Warning: Insufficient operand values for pattern. Inserting 'NUM_MISSING'.");
        constructedString += 'NUM_MISSING';
      }
    } else if (character === '%') {
      // Replace operator placeholder.
      if (operatorIndex < operatorSymbols.length) {
        constructedString += operatorSymbols[operatorIndex++];
      } else {
        // Handle case where not enough operators are provided.
        console.warn("Warning: Insufficient operator symbols for pattern. Inserting 'OP_MISSING'.");
        constructedString += 'OP_MISSING';
      }
    } else {
      // Append any other characters (parentheses, etc.) directly.
      constructedString += character;
    }
  }
  return constructedString;
}

/**
 * Generates all unique permutations of elements within an array using a recursive,
 * destructive-then-restorative approach.
 *
 * @param {Array<any>} sourceElements The array whose permutations are to be generated.
 * @returns {Array<Array<any>>} A list of arrays, where each inner array is a distinct permutation.
 */
function generatePermutations(sourceElements) {
  const currentLength = sourceElements.length;
  const allCollectedPermutations = []; // Renamed from `ret`

  // Base case: an empty array has one permutation (the empty array itself).
  if (currentLength === 0) {
    return [[]];
  }

  // Iterate through the array to pick each element as the first in a permutation.
  for (let iterationCounter = 0; iterationCounter < currentLength; iterationCounter++) {
    // Remove the current element from the front of the array (in-place modification).
    const prefixElement = sourceElements.shift(); // Renamed from `x`

    // Recursively obtain permutations of the remaining elements.
    const subPermutations = generatePermutations(sourceElements);

    // For each sub-permutation, prepend the `prefixElement`.
    const newPermutationSet = subPermutations.map(function(partialArrangement) { // Renamed from `ys`
      partialArrangement.unshift(prefixElement); // Modify the partial arrangement in-place.
      return partialArrangement;
    });

    // Add all newly formed permutations to the main result list.
    allCollectedPermutations.push(...newPermutationSet); // Using spread syntax instead of `concat` for Type III change.

    // Restore the element to the end of the array for the next iteration.
    sourceElements.push(prefixElement);
  }
  return allCollectedPermutations;
}

/**
 * Attempts to discover an arithmetic expression using four given numbers that
 * precisely evaluates to 10. It systematically explores all number permutations,
 * operator combinations, and predefined expression templates.
 *
 * @param {number[]} initialNumbers An array containing exactly four numbers.
 * @returns {string|null} The expression string that results in 10, or `null` if no such expression is found.
 */
function solveForTen(initialNumbers) {
  // Create a defensive copy to prevent modification of the original array by permutation function.
  const numbersForPermutation = [...initialNumbers];

  // Generate all distinct orderings of the four input numbers.
  const allNumberArrangements = generatePermutations(numbersForPermutation); // Renamed `src` to `allNumberArrangements`

  // Loop through each permutation of the four numbers.
  for (let permIndex = 0; permIndex < allNumberArrangements.length; permIndex++) { // Renamed `i` to `permIndex`
    const currentOperandSet = allNumberArrangements[permIndex];

    // Loop through all combinations of three operators (e.g., op1, op2, op3).
    for (let op1Index = 0; op1Index < fundamentalOperators.length; op1Index++) { // Renamed `j` to `op1Index`
      for (let op2Index = 0; op2Index < fundamentalOperators.length; op2Index++) { // Renamed `k` to `op2Index`
        for (let op3Index = 0; op3Index < fundamentalOperators.length; op3Index++) { // Renamed `m` to `op3Index`
          const activeOperators = [
            fundamentalOperators[op1Index],
            fundamentalOperators[op2Index],
            fundamentalOperators[op3Index]
          ];

          // Loop through each available expression template.
          for (let templateIndex = 0; templateIndex < formulaTemplates.length; templateIndex++) { // Renamed `n` to `templateIndex`
            const currentTemplatePattern = formulaTemplates[templateIndex];

            // Construct the full potential expression string.
            const potentialExpression = assembleFormula(
              currentTemplatePattern,
              currentOperandSet,
              activeOperators
            ); // Renamed `r` to `potentialExpression`

            // Type III: Guard against evaluating malformed strings from `assembleFormula`.
            if (potentialExpression.includes('NUM_MISSING') || potentialExpression.includes('OP_MISSING')) {
              continue; // Skip this malformed expression.
            }

            try {
              // Evaluate the constructed expression string.
              // Note: `eval()` is used as per the original problem's approach.
              const evaluationOutcome = eval(potentialExpression);

              // If the expression evaluates to exactly 10, we've found a solution.
              if (evaluationOutcome === 10) {
                return potentialExpression; // Return the successful expression string.
              }
            } catch (runtimeError) {
              // Type III: Catch and suppress runtime errors during evaluation (e.g., division by zero, syntax issues).
              // console.error(`Evaluation failed for "${potentialExpression}": ${runtimeError.message}`);
              // Continue to the next expression if an error occurs.
            }
          }
        }
      }
    }
  }

  // If no expression evaluates to 10 after exhausting all possibilities.
  return null; // Type III: Changed return from `0` to `null` to explicitly signify "no solution found".
}

/**
 * Main orchestrator function that processes each line of input data.
 * It parses numbers, validates input, and then attempts to find a "10" expression.
 */
function executeChallengeProcessor() {
  // Type III: Use a more robust split to handle different newline characters (\n or \r\n).
  let allInputLines = incomingDataBuffer.split(/\r?\n/);

  // Type III: Filter out any empty lines that might result from splitting.
  allInputLines = allInputLines.filter(line => line.trim().length > 0);

  // Type III: Add an early exit if no valid input lines are present.
  if (allInputLines.length === 0) {
    console.log("No challenge input lines were provided. Exiting gracefully.");
    return;
  }

  // Process each individual line of the input.
  allInputLines.forEach(function(currentLineContent) { // Renamed `str` to `currentLineContent`
    const rawNumberStrings = currentLineContent.split(' ');
    // Type III: Use `Number()` constructor for parsing and filter out any `NaN` results explicitly.
    const parsedNumericValues = rawNumberStrings
      .map(val => Number(val.trim()))
      .filter(val => !isNaN(val));

    // Type III: Introduce a constant for the special "all zeros" sentinel value.
    const sentinelZeroSequence = [0, 0, 0, 0];
    const isSentinelLine = parsedNumericValues.length === 4 &&
                           parsedNumericValues.every((num, index) => num === sentinelZeroSequence[index]);

    // Validate the input line: It must contain exactly four numbers and not be the sentinel "0 0 0 0".
    if (parsedNumericValues.length !== 4 || isSentinelLine) {
      // Type III: Optionally log skipped lines for debugging.
      // console.log(`Skipping invalid or sentinel line: "${currentLineContent}"`);
      return; // Skip processing for this invalid line.
    }

    // Attempt to find an expression that equals 10 using the parsed numbers.
    const foundSolution = solveForTen(parsedNumericValues); // Renamed `expr(num)` to `solveForTen(parsedNumericValues)`

    // Output the result of the search.
    if (foundSolution !== null) { // Type III: Check against `null` for "not found".
      console.log(foundSolution);
    } else {
      // Type III: Provide a more descriptive message when no solution is found.
      console.log("No expression found for: " + parsedNumericValues.join(' '));
    }
  });
}

// --- Standard Input Initialization (Type III: Encapsulated) ---

/**
 * Sets up event listeners for `process.stdin` to accumulate all incoming data
 * and then initiates the main challenge processing once the input stream concludes.
 */
function initializeInputHandling() {
  process.stdin.resume(); // Ensures the standard input stream remains open.
  process.stdin.setEncoding('utf8'); // Specifies UTF-8 encoding for incoming text data.

  // Listener for 'data' event: Appends each incoming chunk to the global buffer.
  process.stdin.on('data', function(chunkOfData) {
    incomingDataBuffer += chunkOfData;
  });

  // Listener for 'end' event: Triggered when the input stream has finished.
  process.stdin.on('end', function() {
    executeChallengeProcessor(); // Begin processing all collected input data.
  });
}

// Start the input processing flow when the script is executed.
initializeInputHandling();