// This module is designed to parse and evaluate simple arithmetic expressions
// provided via standard input. It supports addition, subtraction, multiplication,
// division (integer only), and parenthetical grouping. The order of operations
// (PEMDAS/BODMAS) is strictly followed.

(function() {
  // A dynamic array to accumulate all incoming lines from the standard input stream.
  // This buffer will hold the expression count and the expressions themselves.
  let inputExpressionLines = [];

  // Establish a connection to the standard input stream.
  const consoleInput = process.openStdin();

  // Set the character encoding for the input stream to UTF-8 for proper text handling.
  consoleInput.setEncoding('utf8');

  /**
   * Attempts to parse a string into an integer. If the string cannot be converted
   * to a valid integer (e.g., it's not a number or is NaN), it defaults to 0.
   * This helps prevent `NaN` values from propagating through calculations.
   * @param {string} numericString - The string suspected to contain an integer.
   * @returns {number} The parsed integer value, or 0 if parsing fails.
   */
  const getValidatedInteger = (numericString) => {
    const parsedValue = parseInt(numericString, 10);
    // Explicitly check for NaN. If it's not a number, return a neutral 0.
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  };

  /**
   * Core function to evaluate a mathematical expression string.
   * It processes the expression in a specific order:
   * 1. Parentheses are resolved recursively.
   * 2. Multiplication and division operations are performed from left to right.
   * 3. Addition and subtraction operations are performed from left to right.
   * Division is always integer division (truncating any fractional part).
   * @param {string} currentExpressionString - The arithmetic expression to be evaluated.
   * @returns {string} The computed numerical result as a string, or an error message.
   */
  const resolveMathematicalExpression = (currentExpressionString) => {
    let workingExpression = currentExpressionString; // Mutable copy of the expression.

    // --- Phase 1: Recursive Resolution of Parentheses ---
    let firstOpeningParenthesis = workingExpression.indexOf('(');

    // Continue processing as long as there are opening parentheses.
    while (firstOpeningParenthesis !== -1) {
      let parenthesisDepth = 1; // Tracks the nesting level of parentheses.
      let matchingClosingParenthesis = firstOpeningParenthesis + 1; // Start search after the opening paren.

      // Traverse the string to find the closing parenthesis that matches the current opening one.
      while (parenthesisDepth > 0 && matchingClosingParenthesis < workingExpression.length) {
        if (workingExpression[matchingClosingParenthesis] === '(') {
          parenthesisDepth++; // Increment depth for nested opening parentheses.
        } else if (workingExpression[matchingClosingParenthesis] === ')') {
          parenthesisDepth--; // Decrement depth for closing parentheses.
        }
        // Advance the pointer to the next character only if the balance isn't yet zero,
        // or if it's the character that just closed the last parenthesis.
        if (parenthesisDepth > 0) {
          matchingClosingParenthesis++;
        }
      }

      // Type III addition: Guard against unbalanced parentheses.
      // If we've reached the end of the string but `parenthesisDepth` is not zero,
      // it indicates a syntax error (missing closing parenthesis).
      if (parenthesisDepth !== 0) {
        console.error("Syntax Error: Unbalanced parentheses detected in:", currentExpressionString);
        return "ERROR: UNBALANCED PARENTHESES";
      }

      // Extract the sub-expression enclosed within the found parentheses.
      const innerSegment = workingExpression.slice(firstOpeningParenthesis + 1, matchingClosingParenthesis);
      // Recursively call this function to evaluate the inner segment.
      const evaluatedInnerResult = resolveMathematicalExpression(innerSegment);

      // If the inner evaluation resulted in an error, propagate it immediately.
      if (evaluatedInnerResult.startsWith("ERROR:")) {
          return evaluatedInnerResult;
      }

      // Reconstruct the `workingExpression` by replacing the parenthesized part
      // with its evaluated result.
      workingExpression =
        workingExpression.slice(0, firstOpeningParenthesis) +
        evaluatedInnerResult +
        workingExpression.slice(matchingClosingParenthesis + 1);

      // Look for the next opening parenthesis in the modified string.
      firstOpeningParenthesis = workingExpression.indexOf('(');
    }

    // --- Phase 2: Processing Multiplication and Division Operations ---
    // Regular expression to identify multiplication (*) or division (/) operations.
    // It captures: (prefix) (first number) (operator) (second number) (suffix).
    const multDivRegex = /^(.*?)(-?\d+)([*/])(-?\d+)(.*)$/;
    let currentMatch;

    // Loop until no more multiplication or division operations are found.
    while ((currentMatch = multDivRegex.exec(workingExpression)) !== null) {
      const operand1 = getValidatedInteger(currentMatch[2]);
      const operatorSymbol = currentMatch[3];
      const operand2 = getValidatedInteger(currentMatch[4]);
      let calculationResult;

      if (operatorSymbol === '*') {
        calculationResult = operand1 * operand2;
      } else { // Must be '/' for division
        // Type III addition: Guard against division by zero.
        if (operand2 === 0) {
          console.error("Runtime Error: Division by zero encountered in:", currentExpressionString);
          return "ERROR: DIVISION BY ZERO";
        }
        // Integer division: `Math.trunc` removes any fractional part.
        calculationResult = Math.trunc(operand1 / operand2);
      }

      // Reconstruct the `workingExpression` with the result of the current operation.
      workingExpression =
        currentMatch[1] + calculationResult.toString() + currentMatch[5];
    }

    // --- Phase 3: Processing Addition and Subtraction Operations ---
    // Regular expression to identify addition (+) or the placeholder 'SUB_OP' for subtraction.
    // The 'SUB_OP' (originally 'Z') is used to avoid conflict with negative number parsing.
    const addSubRegex = /^(.*?)(-?\d+)([+S])(-?\d+)(.*)$/;

    // Loop until no more addition or subtraction operations are found.
    while ((currentMatch = addSubRegex.exec(workingExpression)) !== null) {
      const operand1 = getValidatedInteger(currentMatch[2]);
      const operatorSymbol = currentMatch[3];
      const operand2 = getValidatedInteger(currentMatch[4]);
      let calculationResult;

      if (operatorSymbol === '+') {
        calculationResult = operand1 + operand2;
      } else { // Must be 'S' for subtraction
        calculationResult = operand1 - operand2;
      }

      // Reconstruct the `workingExpression` with the result of the current operation.
      workingExpression =
        currentMatch[1] + calculationResult.toString() + currentMatch[5];
    }

    // At this point, the `workingExpression` should contain only the final numerical result.
    return workingExpression;
  };

  // Event listener for incoming data chunks from standard input.
  consoleInput.on('data', (incomingRawData) => {
    // Split the raw data by newline characters.
    const receivedLines = incomingRawData.split('\n');
    // Iterate through each line and add non-empty, trimmed lines to our buffer.
    for (const lineSegment of receivedLines) {
      const processedLine = lineSegment.trim();
      if (processedLine.length > 0) {
        inputExpressionLines.push(processedLine);
      }
    }
  });

  // Event listener for the end of the standard input stream.
  consoleInput.on('end', () => {
    // Type III addition: Guard for no input received at all.
    if (inputExpressionLines.length === 0) {
      console.error("No input provided. Execution terminated.");
      return;
    }

    // The very first line of input is expected to be the total count of expressions.
    const totalExpressionsToEvaluate = getValidatedInteger(inputExpressionLines[0]);

    // Type III addition: Validate the parsed count of expressions.
    if (totalExpressionsToEvaluate <= 0) {
      console.error("Invalid or non-positive count of expressions specified. Exiting.");
      return;
    }

    // Iterate through the buffered expressions, starting from the second line (index 1),
    // up to the number specified by `totalExpressionsToEvaluate`.
    for (let currentStatementIndex = 1; currentStatementIndex <= totalExpressionsToEvaluate; currentStatementIndex++) {
      // Type III addition: Ensure we don't try to access lines beyond what was actually provided.
      if (currentStatementIndex >= inputExpressionLines.length) {
        console.warn(`Warning: Expected ${totalExpressionsToEvaluate} expressions, but only ${inputExpressionLines.length - 1} were available. Stopping further processing.`);
        break; // Exit the loop if we run out of input lines.
      }

      let originalStatement = inputExpressionLines[currentStatementIndex];

      // Expressions might contain an '=' sign (e.g., "5+3=result").
      // We only want the part before the '=' for evaluation.
      const separatorPosition = originalStatement.indexOf('=');
      let expressionForProcessing = separatorPosition !== -1
        ? originalStatement.slice(0, separatorPosition)
        : originalStatement;

      // Crucial step: Replace all standard subtraction operators '-' with a unique
      // placeholder 'S' (for 'Subtract Operator'). This prevents the regex for
      // addition/subtraction from misinterpreting a negative number (e.g., `-5`)
      // as a subtraction operation.
      const preparedExpression = expressionForProcessing.replace(/-/g, 'S');

      // Execute the evaluation logic on the prepared expression string.
      const finalCalculationOutput = resolveMathematicalExpression(preparedExpression);

      // Display the final result of the expression evaluation.
      console.log(finalCalculationOutput);
    }
  });

}).call(this);