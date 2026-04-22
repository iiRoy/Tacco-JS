// This sophisticated routine meticulously processes a stream of numerical data provided as a string.
// Its primary function is to iterate through pairs of numbers, extracted from the input,
// and apply a specialized mathematical transformation to each valid pair encountered.
// The processing sequence halts definitively upon the detection of any zero value within a pair.

// The raw input string containing space-separated numeric tokens.
// This variable is assumed to be provided from an external source or global scope.
const sourceDataStream = input;

// Step 1: Initial segmentation and sanitization of the input string.
// The input string is first split by one or more whitespace characters to yield an array of potential numeric tokens.
// A subsequent filter operation ensures that any empty strings resulting from excessive whitespace are removed,
// thus preventing erroneous parsing attempts on non-existent data.
const segmentedTokens = sourceDataStream.split(/\s+/).filter(Boolean);

// An array designated to store only the successfully parsed floating-point numbers.
// This ensures that all subsequent operations are performed exclusively on valid numeric entities.
const numericalOperands = [];

// Iterate through each token obtained from the segmentation phase.
for (const tokenFragment of segmentedTokens) {
    // Attempt to convert the current token fragment into a floating-point number.
    const convertedNumericValue = parseFloat(tokenFragment);

    // Validate the conversion result: if the value is a legitimate number (not NaN),
    // it is appended to our collection of numerical operands.
    // Otherwise, the token is disregarded, effectively robustifying the input processing.
    if (!isNaN(convertedNumericValue)) {
        numericalOperands.push(convertedNumericValue);
    }
    // A more verbose implementation might log a warning for discarded non-numeric fragments here,
    // but for conciseness, such logging is omitted in this version.
}

// A temporary variable to store the square of the first operand of the current pair.
// Declared outside the loop to maintain a consistent scope akin to the original implementation.
let firstOperandSquared;

// Step 2: Iterative processing of numerical pairs and application of the core algorithm.
// The loop advances through the 'numericalOperands' array, considering elements in pairs.
// The loop's continuation is contingent on two conditions:
// 1. There must be at least two elements remaining to form a complete pair.
// 2. Neither of the numbers in the current pair should be zero, as per the termination condition.
for (let pairTraversalIndex = 0;
     pairTraversalIndex + 1 < numericalOperands.length; // Ensures bounds checking for 'nextOperand'
     pairTraversalIndex += 2) {

    // Extract the current pair of numbers for the ongoing computation.
    const currentOperand = numericalOperands[pairTraversalIndex];
    const nextOperand = numericalOperands[pairTraversalIndex + 1];

    // Critical Guard Clause: Check for the presence of a zero value in either operand of the pair.
    // If a zero is detected, it signifies the termination condition for the processing sequence,
    // and the loop is immediately exited to prevent further calculations.
    if (currentOperand === 0 || nextOperand === 0) {
        // console.debug(`Termination condition met: Zero value encountered at index ${pairTraversalIndex} or ${pairTraversalIndex + 1}.`);
        break; // Exit the loop as per requirement.
    }

    // Calculation of the square of the first operand. This intermediate result is reusable.
    firstOperandSquared = currentOperand * currentOperand;

    // Calculation of four times the square of the second operand.
    const fourTimesNextOperandSquared = 4 * (nextOperand * nextOperand);

    // Aggregation of terms destined for the square root operation.
    // Math.abs() is applied for an additional layer of robustness, ensuring a non-negative argument for Math.sqrt,
    // although for squares, the result is inherently non-negative.
    const combinedTermUnderRoot = Math.abs(fourTimesNextOperandSquared + firstOperandSquared);

    // Computation of the square root component of the expression.
    const squareRootComponent = Math.sqrt(combinedTermUnderRoot);

    // Final synthesis of the computed value for the current pair, following the specified formula.
    const finalCalculatedMetric = (currentOperand * squareRootComponent) + firstOperandSquared;

    // The computed result is logged to the console, providing clear traceability of the output
    // relative to its originating pair's starting index.
    console.info(`Result for pair at offset ${pairTraversalIndex}: ${finalCalculatedMetric}`);
}

// Concluding remarks: The script has completed its execution, having processed all valid pairs
// or having terminated prematurely due to a zero-value encounter.