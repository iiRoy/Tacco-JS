'use strict';

/**
 * Core Parsing Utilities for a simple combinator library.
 * These functions build parsers that consume an input string from a given offset
 * and return an object indicating success, parsed data, and the new read offset.
 */

/**
 * Creates a parser that attempts to match a specific literal string value.
 *
 * @param {string} literalValue The exact string sequence to look for in the input.
 * @returns {function(string, number): {isSuccessful: boolean, parsedData: any, newReadOffset: number}} A parser function.
 * @throws {Error} If the provided literalValue is not a non-empty string.
 */
function matchLiteral(literalValue) {
  const desiredLength = literalValue.length;

  // Pre-validation for the literal itself, ensuring it's usable.
  if (typeof literalValue !== 'string' || desiredLength === 0) {
    throw new Error("MatchLiteral: The literal value must be a non-empty string for matching.");
  }

  // The returned parser function performs the actual matching logic.
  return function (sourceInput, currentOffset) {
    // Input validation: ensure the source is a string and offset is within bounds.
    if (typeof sourceInput !== 'string' || currentOffset < 0 || currentOffset > sourceInput.length) {
      return { isSuccessful: false, parsedData: null, newReadOffset: currentOffset };
    }

    // Check if there are enough characters remaining in the input for a potential match.
    if (currentOffset + desiredLength > sourceInput.length) {
      return { isSuccessful: false, parsedData: null, newReadOffset: currentOffset };
    }

    const availableSubstring = sourceInput.slice(currentOffset, currentOffset + desiredLength);
    const potentialNextOffset = currentOffset + desiredLength;

    // Compare the extracted substring with the target literal.
    if (availableSubstring === literalValue) {
      return { isSuccessful: true, parsedData: literalValue, newReadOffset: potentialNextOffset };
    } else {
      return { isSuccessful: false, parsedData: null, newReadOffset: currentOffset };
    }
  };
}

/**
 * Constructs a parser that attempts to apply a series of parsers in order.
 * It returns the result of the first parser that successfully matches.
 *
 * @param {...function(string, number): {isSuccessful: boolean, parsedData: any, newReadOffset: number}} candidateParsers
 *   A variable number of parser functions to try.
 * @returns {function(string, number): {isSuccessful: boolean, parsedData: any, newReadOffset: number}} A parser function.
 */
function tryAnyOf(...candidateParsers) {
  // Warn if no parsers are provided, as this will always result in failure.
  if (candidateParsers.length === 0) {
    console.warn("TryAnyOf: No candidate parsers were supplied. This parser will inherently fail for any input.");
  }

  return function (sourceText, initialIndex) {
    // Iterate through each parser provided in the arguments.
    for (const currentParser of candidateParsers) {
      // Basic type validation for robustness: ensure it's actually a function.
      if (typeof currentParser !== 'function') {
        console.error("TryAnyOf: Discovered a non-function element in the list of candidate parsers. Skipping it.");
        continue;
      }

      // Execute the current parser with the given input and starting index.
      const attemptResult = currentParser(sourceText, initialIndex);
      if (attemptResult.isSuccessful) {
        // If successful, immediately return its result without trying further parsers.
        return attemptResult;
      }
    }
    // If all candidate parsers failed, return a generic failure object.
    return { isSuccessful: false, parsedData: null, newReadOffset: initialIndex };
  };
}

/**
 * Creates a parser that applies a list of sub-parsers consecutively.
 * All sub-parsers must succeed in order for the sequence parser to succeed.
 *
 * @param {...function(string, number): {isSuccessful: boolean, parsedData: any, newReadOffset: number}} parsingSteps
 *   A sequence of parser functions to apply.
 * @returns {function(string, number): {isSuccessful: boolean, parsedData: any, newReadOffset: number}} A parser function.
 */
function parseSequence(...parsingSteps) {
  // Warn if no steps are provided; an empty sequence technically succeeds with an empty result.
  if (parsingSteps.length === 0) {
    console.warn("ParseSequence: No parsing steps defined. This parser will succeed with an empty result array.");
  }

  return (inputStr, initialPosition) => {
    const collectedResults = []; // Stores the parsed data from each successful step.
    let currentPosition = initialPosition; // Tracks the current position in the input string.

    // Process each parser in the defined sequence.
    for (const stepParser of parsingSteps) {
      if (typeof stepParser !== 'function') {
        console.error("ParseSequence: Detected a non-callable item in the sequence steps. Aborting sequence parsing.");
        return { isSuccessful: false, parsedData: null, newReadOffset: initialPosition }; // Fail if a step isn't a parser.
      }

      const stepOutcome = stepParser(inputStr, currentPosition);
      if (!stepOutcome.isSuccessful) {
        // If any step fails, the entire sequence fails, returning to the initial position.
        return { isSuccessful: false, parsedData: null, newReadOffset: initialPosition };
      }
      collectedResults.push(stepOutcome.parsedData); // Add the successful step's data.
      currentPosition = stepOutcome.newReadOffset; // Advance the position for the next parser.
    }
    // If all steps succeeded, return the combined results and the final position.
    return { isSuccessful: true, parsedData: collectedResults, newReadOffset: currentPosition };
  };
}

/**
 * Creates a parser that is instantiated only when it's first called.
 * This is crucial for handling recursive grammar definitions without infinite loops.
 *
 * @param {function(): function(string, number): {isSuccessful: boolean, parsedData: any, newReadOffset: number}} parserFactory
 *   A function that, when called, returns the actual parser function.
 * @returns {function(string, number): {isSuccessful: boolean, parsedData: any, newReadOffset: number}} A lazy parser function.
 * @throws {Error} If the parserFactory is not a function or does not return a function.
 */
function deferParser(parserFactory) {
  let cachedParser; // This variable will hold the parser once it's created.

  // Validate the factory function itself.
  if (typeof parserFactory !== 'function') {
    throw new Error("DeferParser: The provided parser factory must be a function.");
  }

  return function (textInput, startPoint) {
    // If the parser hasn't been created yet, call the factory to create it.
    if (!cachedParser) {
      cachedParser = parserFactory();
      // Validate that the factory actually returned a callable parser.
      if (typeof cachedParser !== 'function') {
        throw new Error("DeferParser: The factory function did not return a valid parser function.");
      }
    }
    // Once cachedParser is initialized, delegate the parsing to it.
    return cachedParser(textInput, startPoint);
  };
}

/**
 * Creates a new parser that applies a transformation function to the successful result
 * of an underlying parser.
 *
 * @param {function(string, number): {isSuccessful: boolean, parsedData: any, newReadOffset: number}} baseParser
 *   The parser whose successful output will be transformed.
 * @param {function(any): any} transformer A function that maps the base parser's result to a new value.
 * @returns {function(string, number): {isSuccessful: boolean, parsedData: any, newReadOffset: number}} A new parser.
 * @throws {Error} If either baseParser or transformer is not a function.
 */
function transformResult(baseParser, transformer) {
  // Validate both input functions.
  if (typeof baseParser !== 'function' || typeof transformer !== 'function') {
    throw new Error("TransformResult: Both the baseParser and the transformer must be callable functions.");
  }

  return (inputData, inputIndex) => {
    const parseOutcome = baseParser(inputData, inputIndex);
    if (parseOutcome.isSuccessful) {
      // If the base parser succeeded, apply the transformer to its parsed data.
      const transformedValue = transformer(parseOutcome.parsedData);
      // Return a new result object with the transformed data.
      return { isSuccessful: true, parsedData: transformedValue, newReadOffset: parseOutcome.newReadOffset };
    } else {
      // If the base parser failed, simply pass on its failure result.
      return parseOutcome;
    }
  };
}

/**
 * Generates a parser that attempts to match any single character from a predefined set.
 *
 * @param {string} allowedChars A string containing all characters that are considered valid.
 * @returns {function(string, number): {isSuccessful: boolean, parsedData: any, newReadOffset: number}} A parser function.
 * @throws {Error} If allowedChars is not a non-empty string.
 */
function matchCharFromSet(allowedChars) {
  // Validate the set of allowed characters.
  if (typeof allowedChars !== 'string' || allowedChars.length === 0) {
    throw new Error("MatchCharFromSet: The 'allowedChars' parameter must be a non-empty string.");
  }

  return (sourceString, currentParseIndex) => {
    // Guard clause: Ensure the index is valid and there's a character to read.
    if (currentParseIndex < 0 || currentParseIndex >= sourceString.length) {
      return { isSuccessful: false, parsedData: null, newReadOffset: currentParseIndex };
    }

    const singleChar = sourceString.charAt(currentParseIndex); // Extract a single character.

    // Check if the extracted character is present in the set of allowed characters.
    if (allowedChars.includes(singleChar)) {
      const nextIndex = currentParseIndex + 1; // Advance the read position.
      return { isSuccessful: true, parsedData: singleChar, newReadOffset: nextIndex };
    } else {
      return { isSuccessful: false, parsedData: null, newReadOffset: currentParseIndex };
    }
  };
}


/**
 * Application Specific Logic: Parsing and Evaluation of Boolean Expressions for Tautology Checking.
 * This section defines the grammar for propositional logic and implements a truth-table evaluator.
 */
((inputReader) => {
  // Define the recursive grammar for boolean expressions using parser combinators.
  const expressionParser = deferParser(() => {

    // Parser for conjunction (AND) operations: e.g., (A * B)
    const andOpParser = transformResult(
      parseSequence(
        matchLiteral('('), expressionParser, matchLiteral('*'), expressionParser, matchLiteral(')')
      ),
      (capturedElements) => {
        // Construct an Abstract Syntax Tree (AST) node for the AND operation.
        return { operationType: 'AND', operands: [capturedElements[1], capturedElements[3]] };
      }
    );

    // Parser for disjunction (OR) operations: e.g., (A + B)
    const orOpParser = transformResult(
      parseSequence(
        matchLiteral('('), expressionParser, matchLiteral('+'), expressionParser, matchLiteral(')')
      ),
      (capturedElements) => {
        // AST node for OR.
        return { operationType: 'OR', operands: [capturedElements[1], capturedElements[3]] };
      }
    );

    // Parser for implication operations: e.g., (A -> B)
    const impliesOpParser = transformResult(
      parseSequence(
        matchLiteral('('), expressionParser, matchLiteral('->'), expressionParser, matchLiteral(')')
      ),
      (capturedElements) => {
        // AST node for IMPLIES.
        return { operationType: 'IMPLIES', operands: [capturedElements[1], capturedElements[3]] };
      }
    );

    // Parser for negation (NOT) operations: e.g., -A
    const notOpParser = transformResult(
      parseSequence(
        matchLiteral('-'), expressionParser
      ),
      (capturedElements) => {
        // AST node for NOT.
        return { operationType: 'NOT', operands: [capturedElements[1]] };
      }
    );

    // Parser for basic propositional variables ('a' through 'k') or constants ('T', 'F').
    const variableOrConstantParser = transformResult(
      matchCharFromSet('abcdefghijkTF'),
      (capturedElement) => {
        // AST node for a literal value or variable.
        return { valueIdentifier: capturedElement, operands: [] }; // No sub-operands for leaf nodes.
      }
    );

    // The main expression parser tries to match any of the defined operations or a variable/constant.
    return tryAnyOf(andOpParser, orOpParser, impliesOpParser, notOpParser, variableOrConstantParser);
  });

  // Parser for a complete boolean equation: Expression = Expression
  const equationMatcher = transformResult(
    parseSequence(expressionParser, matchLiteral('='), expressionParser),
    (capturedElements) => {
      // Structure the parsed equation into left and right sides.
      return { leftSideExpression: capturedElements[0], rightSideExpression: capturedElements[2] };
    }
  );

  // Read input line by line from the provided inputReader (e.g., stdin).
  const inputLines = inputReader.toString().split('\n');

  inputLines.forEach(currentLine => {
    const trimmedLine = currentLine.trim();

    // Skip empty lines or handle the exit command.
    if (!trimmedLine) {
      return; // Skip processing empty lines.
    }
    if (trimmedLine === '#') {
      process.exit(0); // Exit as per problem specification.
    }

    // Attempt to parse the current line as a boolean equation.
    const parseResult = equationMatcher(trimmedLine, 0);

    // If parsing fails, report an error and move to the next line.
    if (!parseResult.isSuccessful || parseResult.newReadOffset !== trimmedLine.length) {
        console.log('NO'); // Indicate failure for malformed input or incomplete parse.
        // Optionally, log the error for debugging: console.error(`Failed to parse line: "${trimmedLine}"`);
        return;
    }

    const parsedEquation = parseResult.parsedData;
    let isTautology = true; // Flag to track if the equation holds true for all assignments.

    // The maximum number of distinct propositional variables (a-k) is 11.
    // We need to iterate through all 2^11 (2048) possible truth assignments.
    const maxAssignments = 1 << 11;

    // Iterate through every possible truth assignment for variables 'a' through 'k'.
    for (let assignmentIndex = 0; assignmentIndex < maxAssignments; assignmentIndex++) {

      /**
       * Determines the boolean value for a given character symbol ('a'-'k', 'T', 'F').
       * 'T' is true, 'F' is false. Variables 'a'-'k' get their value from the current bit in `assignmentIndex`.
       *
       * @param {string} characterSymbol The character representing a variable or constant.
       * @returns {boolean} The resolved truth value.
       */
      const resolveVariableValue = (characterSymbol) => {
        if (characterSymbol === 'T') return true;
        if (characterSymbol === 'F') return false;

        // For variables 'a' through 'k', use bit manipulation.
        const charCodeOffset = characterSymbol.charCodeAt(0) - 'a'.charCodeAt(0);
        // Check if the corresponding bit in 'assignmentIndex' is set (1).
        return ((assignmentIndex >> charCodeOffset) & 1) === 1;
      };

      /**
       * Recursively evaluates the truth value of an expression tree under the current truth assignment.
       *
       * @param {object} expressionNode The current node of the Abstract Syntax Tree.
       * @returns {boolean} The truth value of the expression.
       */
      const evaluateExpressionTree = (expressionNode) => {
        const operandCount = expressionNode.operands.length;

        // Handle leaf nodes (variables or constants).
        if (operandCount === 0) {
            return resolveVariableValue(expressionNode.valueIdentifier);
        }
        // Handle unary operations (e.g., NOT).
        else if (operandCount === 1) {
            if (expressionNode.operationType === 'NOT') {
                return !evaluateExpressionTree(expressionNode.operands[0]);
            } else {
                console.error("Evaluation Error: Unknown unary operation type encountered:", expressionNode.operationType);
                return false; // Default to false for unknown operations.
            }
        }
        // Handle binary operations (e.g., AND, OR, IMPLIES).
        else if (operandCount === 2) {
            const leftOperandValue = evaluateExpressionTree(expressionNode.operands[0]);
            const rightOperandValue = evaluateExpressionTree(expressionNode.operands[1]);

            switch (expressionNode.operationType) {
              case 'AND': return leftOperandValue && rightOperandValue;
              case 'OR': return leftOperandValue || rightOperandValue;
              case 'IMPLIES': return !leftOperandValue || rightOperandValue; // Logical equivalence for A -> B
              default:
                console.error("Evaluation Error: Unknown binary operation type encountered:", expressionNode.operationType);
                return false;
            }
        }
        // Log an error for unexpected AST node structures.
        console.error("Evaluation Error: Expression node with an unexpected number of operands:", expressionNode);
        return false;
      };

      // Evaluate both sides of the parsed equation with the current truth assignment.
      const leftSideTruth = evaluateExpressionTree(parsedEquation.leftSideExpression);
      const rightSideTruth = evaluateExpressionTree(parsedEquation.rightSideExpression);

      // If the truth values of the left and right sides differ, the equation is not a tautology.
      if (leftSideTruth !== rightSideTruth) {
        isTautology = false;
        break; // No need to check further assignments; we've found a counter-example.
      }
    }

    // Output the final verdict for the current equation.
    if (isTautology) {
        console.log('YES');
    } else {
        console.log('NO');
    }
  });

// The input source is typically standard input.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));