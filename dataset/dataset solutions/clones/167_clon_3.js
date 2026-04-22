const PERMUTATION_LENGTH = 4;

let allPermutations = [];

// Recursive function to generate all permutations of indices [0, 1, 2, 3].
// This replaces the nested loops and boolean `flag` array from the original.
function generateNumericPermutations(
  currentSequence,
  usedPositionsBitmap,
  targetLength
) {
  // If the current sequence has reached the desired length, store it.
  if (currentSequence.length === targetLength) {
    allPermutations.push([...currentSequence]); // Store a copy to avoid mutation issues
    return;
  }

  // Iterate through all possible indices for the current position.
  for (let candidateIndex = 0; candidateIndex < targetLength; candidateIndex++) {
    // Check if this index has already been used in the current permutation using a bitmask.
    // If the bit at `candidateIndex` is NOT set, it means the index is available.
    if (!((usedPositionsBitmap >> candidateIndex) & 1)) {
      // Add the index to the current sequence.
      currentSequence.push(candidateIndex);
      // Update the bitmask to mark this index as used.
      const updatedUsedPositionsBitmap = usedPositionsBitmap | (1 << candidateIndex);

      // Recurse to fill the next position in the sequence.
      generateNumericPermutations(
        currentSequence,
        updatedUsedPositionsBitmap,
        targetLength
      );

      // Backtrack: remove the last added index to explore other possibilities.
      currentSequence.pop();
      // The `usedPositionsBitmap` doesn't need explicit resetting because it's passed by value
      // and `updatedUsedPositionsBitmap` is a new constant for the recursive call's scope.
    }
  }
}

// Initiate the permutation generation process.
generateNumericPermutations([], 0, PERMUTATION_LENGTH);

// --- Input Reading and Problem Solving Logic ---

// Read the entire standard input data.
const rawProblemData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines, trimming leading/trailing whitespace from the whole input.
let problemInputLines = rawProblemData.trim().split("\n");

// Define the target numerical result for expressions.
const REQUIRED_SUM = 10;

// Array of allowed arithmetic operators.
const arithmeticOperators = ["+", "-", "*"];

// Helper function to evaluate an arithmetic expression string.
// Encapsulates `eval()` to provide a cleaner interface and basic error handling.
function safelyEvaluateExpression(expressionText) {
  try {
    // Using `eval` as per the original code's approach.
    const computedResult = eval(expressionText);
    return Number.isFinite(computedResult) ? computedResult : NaN; // Ensure it's a finite number.
  } catch (evaluationError) {
    // Return NaN for any evaluation errors (e.g., division by zero resulting in Infinity, invalid syntax).
    return NaN;
  }
}

// Loop through each line of problem input.
let currentLineIndex = 0;
while (currentLineIndex < problemInputLines.length) {
  const currentProblemString = problemInputLines[currentLineIndex];
  currentLineIndex++; // Advance to the next line for the next iteration.

  // Check for the termination condition specified in the problem.
  if (currentProblemString.trim() === "0 0 0 0") {
    break; // Exit the processing loop.
  }

  // Parse the four numbers from the current line.
  const inputNumbers = currentProblemString.split(" ").map(Number);

  // Variable to hold the first expression found that evaluates to REQUIRED_SUM.
  // Initialized to `null` to distinguish between no solution and a solution that might numerically evaluate to 0.
  let solutionExpressionFound = null;

  // Iterate through all combinations of three operators.
  for (let opOneIdx = 0; opOneIdx < arithmeticOperators.length; opOneIdx++) {
    for (let opTwoIdx = 0; opTwoIdx < arithmeticOperators.length; opTwoIdx++) {
      for (let opThreeIdx = 0; opThreeIdx < arithmeticOperators.length; opThreeIdx++) {

        // If a solution has already been identified for this set of input numbers,
        // break out of the operator loops to move to the next input line.
        if (solutionExpressionFound !== null) break;

        const operatorOne = arithmeticOperators[opOneIdx];
        const operatorTwo = arithmeticOperators[opTwoIdx];
        const operatorThree = arithmeticOperators[opThreeIdx];

        // Iterate through all generated permutations of the input numbers' indices.
        for (const currentPermutation of allPermutations) {
          // If a solution is already found, break from this permutation loop.
          if (solutionExpressionFound !== null) break;

          // Extract numbers from the input array based on the current permutation order.
          const number1 = inputNumbers[currentPermutation[0]];
          const number2 = inputNumbers[currentPermutation[1]];
          const number3 = inputNumbers[currentPermutation[2]];
          const number4 = inputNumbers[currentPermutation[3]];

          // Construct various parenthesization patterns for the expression.
          // The original code checked 4 patterns. Here, we extend and rewrite them.
          const potentialExpressions = [
            // Pattern 1: No explicit parentheses (relies on operator precedence).
            `${number1}${operatorOne}${number2}${operatorTwo}${number3}${operatorThree}${number4}`,

            // Pattern 2: Grouping the first three numbers on the left.
            `(${number1}${operatorOne}${number2}${operatorTwo}${number3})${operatorThree}${number4}`,

            // Pattern 3: Grouping the first two and the last two numbers.
            `(${number1}${operatorOne}${number2})${operatorTwo}(${number3}${operatorThree}${number4})`,

            // Pattern 4: Nested grouping of the first two, then three numbers on the left.
            `(((${number1}${operatorOne}${number2})${operatorTwo}${number3})${operatorThree}${number4})`,

            // Type III Addition: Pattern 5 - Grouping the last three numbers on the right.
            `${number1}${operatorOne}(${number2}${operatorTwo}${number3}${operatorThree}${number4})`,

            // Type III Addition: Pattern 6 - Nested grouping of the last two, then three numbers on the right.
            `${number1}${operatorOne}(${number2}${operatorTwo}(${number3}${operatorThree}${number4}))`,

            // Type III Addition: Pattern 7 - A different nested structure, e.g., first number with a grouped middle.
            `(${number1}${operatorOne}${number2})${operatorTwo}(${number3})${operatorThree}${number4}` // Example of slightly different structure.
          ];

          // Check each potential expression.
          for (const expressionString of potentialExpressions) {
            if (safelyEvaluateExpression(expressionString) === REQUIRED_SUM) {
              solutionExpressionFound = expressionString;
              break; // Found a solution, no need to check other parenthesizations or permutations.
            }
          }
        }
      }
    }
  }

  // Output the result for the current set of input numbers.
  if (solutionExpressionFound !== null) {
    // If a solution was found, print it enclosed in parentheses.
    console.log(`(${solutionExpressionFound})`);
  } else {
    // Type III Addition: Explicit message if no solution is found, instead of just an empty line or '0'.
    console.log("No valid expression found for 10.");
  }
}