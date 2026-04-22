/*
 * This module is designed to process and evaluate mathematical expressions
 * written in Reverse Polish Notation (RPN). It reads the expression
 * from standard input, tokenizes it, and computes the final numerical result.
 *
 * This implementation is a Type III clone, demonstrating significant
 * structural alterations, extensive identifier renaming, and the inclusion
 * of additional logic for enhanced robustness and clarity, compared to its
 * original counterpart.
 */

'use strict'; // Enforcing strict parsing and error handling for cleaner code.

// Renaming the 'fs' module for better descriptive context within this program.
const fileSystemAccessor = require('fs');

/**
 * Fetches raw expression data from a specified file path and transforms it
 * into an array of distinct tokens suitable for RPN evaluation.
 *
 * @param {string} sourceFileLocation - The absolute path to the input file, e.g., '/dev/stdin'.
 * @returns {Array<string>} An ordered array of string tokens representing the RPN expression.
 * @throws {Error} If the file cannot be read, the data is not a string, or no valid tokens are found.
 */
const acquireAndSegmentExpression = (sourceFileLocation) => {
  let rawExpressionContent;
  try {
    // Attempt to synchronously read the entire content of the specified file.
    rawExpressionContent = fileSystemAccessor.readFileSync(sourceFileLocation, 'utf8');
  } catch (dataRetrievalError) {
    // Providing more detailed error information for input reading failures.
    console.error('ERROR: Could not read from the designated expression source.', dataRetrievalError.message);
    throw new Error('Input data acquisition failed.');
  }

  // A basic validation to ensure the retrieved content is of expected type.
  if (typeof rawExpressionContent !== 'string') {
    throw new Error('Data retrieved from source is not in a string format.');
  }

  // Pre-process the raw string: remove leading/trailing whitespace,
  // then split by one or more whitespace characters, and filter out any empty tokens.
  const segmentedTokens = rawExpressionContent
    .trim()
    .split(/\s+/)
    .filter(tokenSegment => tokenSegment.length > 0);

  // Ensure that the input actually yielded some tokens to process.
  if (segmentedTokens.length === 0) {
    throw new Error('No discernible expression tokens were found in the provided input.');
  }

  return segmentedTokens;
};

// Centralized definition of supported arithmetic operators.
// This allows for easier modification or expansion of supported operations.
const validOperationSymbols = {
  SUMMATION: '+',
  DIFFERENCE: '-',
  PRODUCT: '*'
};

// The primary data structure used for RPN computation, analogous to a stack.
const computationPile = []; // Renamed from 'stack' for semantic variation.

try {
  // First, obtain the tokenized RPN expression.
  const expressionElements = acquireAndSegmentExpression('/dev/stdin');

  // Iterate through each element of the RPN expression.
  // Using a 'for...of' loop for modern iteration syntax.
  for (const currentElement of expressionElements) {
    let numericalOperandCandidate; // Temporary variable for parsed numbers.

    // Employing an 'if-else if' ladder instead of a 'switch' statement.
    if (currentElement === validOperationSymbols.SUMMATION) {
      // Guard clause: Validate that there are enough operands on the pile for the operation.
      if (computationPile.length < 2) {
        throw new Error(`Evaluation Fault: Insufficient operands for '${validOperationSymbols.SUMMATION}' operation.`);
      }
      // Pop operands in the correct order for calculation.
      const operandTwo = computationPile.pop(); // The top-most element (second operand).
      const operandOne = computationPile.pop(); // The element below (first operand).
      const summationResult = operandOne + operandTwo; // Perform addition.
      computationPile.push(summationResult); // Push the result back.
    } else if (currentElement === validOperationSymbols.DIFFERENCE) {
      if (computationPile.length < 2) {
        throw new Error(`Evaluation Fault: Insufficient operands for '${validOperationSymbols.DIFFERENCE}' operation.`);
      }
      const operandTwo = computationPile.pop();
      const operandOne = computationPile.pop();
      const differenceResult = operandOne - operandTwo; // Perform subtraction (first - second).
      computationPile.push(differenceResult);
    } else if (currentElement === validOperationSymbols.PRODUCT) {
      if (computationPile.length < 2) {
        throw new Error(`Evaluation Fault: Insufficient operands for '${validOperationSymbols.PRODUCT}' operation.`);
      }
      const operandTwo = computationPile.pop();
      const operandOne = computationPile.pop();
      const productResult = operandOne * operandTwo; // Perform multiplication.
      computationPile.push(productResult);
    } else {
      // If not an operator, attempt to parse the element as a floating-point number.
      numericalOperandCandidate = parseFloat(currentElement);

      // Robustness check: Ensure the parsed value is indeed a valid number.
      if (isNaN(numericalOperandCandidate)) {
        throw new Error(`Input Error: Encountered an unrecognised token '${currentElement}'. Expected a number or a valid operator.`);
      }
      computationPile.push(numericalOperandCandidate); // Push the numerical value onto the pile.
    }
  }

  // Post-evaluation validation: A correctly formed RPN expression should leave exactly one result on the pile.
  if (computationPile.length !== 1) {
    throw new Error('RPN Format Error: The expression resulted in an invalid number of items on the pile.');
  }

  // Retrieve and output the singular final computed value.
  const finalEvaluationOutput = computationPile[0];
  console.log(finalEvaluationOutput);

} catch (computationFailure) {
  // Centralized error handling for any issues during the expression evaluation process.
  console.error('CRITICAL ERROR: RPN expression evaluation terminated due to:', computationFailure.message);
  process.exit(1); // Indicate an abnormal termination to the operating system.
}