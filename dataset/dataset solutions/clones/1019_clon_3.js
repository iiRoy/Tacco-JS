const acquireRawInputData = () => {
  // Leverage the Node.js 'fs' module for synchronous file system access.
  // Reads content from standard input, assuming UTF-8 encoding.
  // Performs a trim operation to remove leading/trailing whitespace from the entire string.
  return require('fs').readFileSync('/dev/stdin', 'utf8').trim();
};

const parseElementToNumberOrPreserveString = (itemStringValue) => {
  // Attempts to convert a string element into a numerical value.
  // Using the global `Number` constructor for type coercion.
  const numericalResult = Number(itemStringValue);
  // Verifies if the conversion yielded a finite number (not NaN, Infinity, or -Infinity).
  if (Number.isFinite(numericalResult)) {
    return numericalResult;
  }
  // If conversion fails or results in a non-finite number, the original string is returned.
  return itemStringValue;
};

// --- Main Program Flow Initialization ---

// Step 1: Obtain the raw input string from the system.
const rawSourceExpression = acquireRawInputData();

// Type III: Added a guard clause for handling empty input scenarios.
if (rawSourceExpression.length === 0) {
  // Output an informative error message to the standard error stream.
  console.error("Evaluation Error: No input expression detected. Please provide data.");
  // Terminate the process with a non-zero exit code to indicate failure.
  process.exit(1);
}

// Step 2: Tokenize the raw input string into an array of individual components.
// Splits the string by spaces and filters out any empty strings that might result
// from multiple consecutive spaces, ensuring a clean token list.
const expressionTokens = rawSourceExpression.split(' ').filter(token => token !== '');

// Step 3: Transform each token, converting numerical strings to actual numbers
// while retaining non-numerical strings (operators, variables, etc.).
const transformedExpressionSequence = expressionTokens.map(parseElementToNumberOrPreserveString);

/**
 * Determines if a triplet of components (operand1, operand2, operator) constitutes a valid arithmetic operation.
 * Type II: Renamed function and parameters for clarity.
 * Type III: Added explicit null/undefined checks and refined numeric validation.
 *
 * @param {any} valueOne - The first potential operand.
 * @param {any} valueTwo - The second potential operand.
 * @param {string} operationIndicator - The symbol representing the arithmetic operation.
 * @returns {boolean} - True if the operation is valid, false otherwise.
 */
const validateArithmeticOperation = (valueOne, valueTwo, operationIndicator) => {
  // Type III: Enhanced robustness with explicit checks for missing components.
  if (valueOne === null || valueTwo === null || operationIndicator === null ||
      valueOne === undefined || valueTwo === undefined || operationIndicator === undefined) {
    return false;
  }

  // Validate that both operands are finite numbers.
  const isValueOneNumeric = typeof valueOne === 'number' && Number.isFinite(valueOne);
  const isValueTwoNumeric = typeof valueTwo === 'number' && Number.isFinite(valueTwo);

  // Validate that the operation indicator is a string.
  const isIndicatorString = typeof operationIndicator === 'string';

  // Type III: Explicitly check if the operator is one of the supported symbols.
  const supportedOperators = ['+', '-', '*'];
  const isIndicatorSupported = supportedOperators.includes(operationIndicator);

  // All conditions must be met for a valid arithmetic calculation.
  return isValueOneNumeric && isValueTwoNumeric && isIndicatorString && isIndicatorSupported;
};

/**
 * Performs a specified arithmetic calculation on two numerical operands.
 * Type II: Renamed function and parameters.
 * Type III: Switched from `switch` statement to `if-else if` and added error handling for unknown operators.
 *
 * @param {number} termA - The first numerical term.
 * @param {number} termB - The second numerical term.
 * @param {string} symbolOperator - The arithmetic operator ('+', '-', '*').
 * @returns {number} - The result of the arithmetic operation.
 * @throws {Error} - If an unsupported or unrecognized operator symbol is provided.
 */
const executeCalculus = (termA, termB, symbolOperator) => {
  // Using an if-else if structure to perform the operation based on the operator symbol.
  if (symbolOperator === '+') {
    return termA + termB;
  } else if (symbolOperator === '-') {
    return termA - termB;
  } else if (symbolOperator === '*') {
    return termA * termB;
  }
  // Type III: Added an error throw for unsupported operators, improving error handling.
  throw new Error(`Unsupported operator encountered: '${symbolOperator}'. Valid operators are '+', '-', '*'.`);
};

/**
 * Recursively evaluates a sequence of tokens, applying arithmetic operations in a RPN-like fashion.
 * Type II: Renamed function and parameter.
 * Type III: Extensive structural changes including loop type, variable declarations,
 *           intermediate variables, and adjusted logic for unprocessable segments.
 *
 * @param {Array<number|string>} currentTokenCollection - The array of tokens to be processed in the current recursion step.
 */
const processExpressionTree = (currentTokenCollection) => {
  // Use 'const' for array length as it doesn't change within this scope.
  const currentCollectionSize = currentTokenCollection.length;

  // Base case for recursion: If only one element remains, it is the final result.
  if (currentCollectionSize === 1) {
    console.log(currentTokenCollection[0]); // Output the final computed value.
    return; // Exit the recursive call.
  }

  // Type III: Additional guard clause for unexpected empty collections during recursion.
  if (currentCollectionSize === 0) {
    console.warn("Warning: An empty token collection was passed for processing. Skipping.");
    return;
  }

  // Initialize a new array to accumulate results for the next iteration.
  let nextIterationCollection = [];
  let processingIndex = 0; // Manual index for the while loop, replacing 'for (var i = ...)'

  // Type III: Changed from a 'for' loop to a 'while' loop for different control flow.
  while (processingIndex < currentCollectionSize) {
    // Extract a segment of three potential components (operand, operand, operator).
    // Using slice creates a shallow copy, preserving the original array.
    const currentSegment = currentTokenCollection.slice(processingIndex, processingIndex + 3);

    // If the segment is empty, there are no more tokens to process.
    if (currentSegment.length === 0) {
        break;
    }

    // Assign components from the segment, handling cases where the segment might be shorter than 3.
    const firstTerm = currentSegment[0];      // Corresponds to 'a' in original
    const secondTerm = currentSegment[1];     // Corresponds to 'b' in original
    const operationSymbol = currentSegment[2]; // Corresponds to 'notation' in original

    // Check if the extracted components form a valid arithmetic operation.
    if (validateArithmeticOperation(firstTerm, secondTerm, operationSymbol)) {
      // If valid, perform the calculation and add the result to the next collection.
      const calculatedResult = executeCalculus(firstTerm, secondTerm, operationSymbol);
      nextIterationCollection.push(calculatedResult);
      // Advance the index by 3, as a triplet was successfully processed.
      processingIndex += 3;
    } else {
      // Type III: Replicated original's behavior of pushing back unprocessed components
      // in reverse order of their extraction (operator, then second operand, then first operand).
      // This is crucial for maintaining the RPN-like processing order in subsequent recursive calls.
      if (typeof operationSymbol !== 'undefined') {
        nextIterationCollection.push(operationSymbol);
      }
      if (typeof secondTerm !== 'undefined') {
        nextIterationCollection.push(secondTerm);
      }
      if (typeof firstTerm !== 'undefined') {
        nextIterationCollection.push(firstTerm);
      }
      // Type III: Crucially, the index is still advanced by 3, mimicking the original's loop structure
      // even when an operation cannot be performed. The "unprocessed" elements are simply moved
      // to the `nextIterationCollection` for the subsequent recursive call.
      processingIndex += 3;
    }
  }

  // Recursively call the function with the updated collection for the next pass.
  processExpressionTree(nextIterationCollection);
};

// Initiate the entire expression evaluation process with the initially transformed tokens.
processExpressionTree(transformedExpressionSequence);