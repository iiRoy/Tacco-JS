'use strict';

// Function to generate a parser for a fixed string literal.
// This parser returns a success result if the input string matches the literal.
function obtainLiteralParser(targetLiteralString) {
  // Input validation: Ensure the literal is a non-empty string.
  if (typeof targetLiteralString !== 'string' || targetLiteralString.length === 0) {
    console.warn("Attempted to create a literal parser with an invalid or empty string. This parser will always fail.");
    return function (sourceInput, currentOffset) {
      return [false, null, currentOffset]; // Always fail for invalid literal.
    };
  }

  const literalStrLength = targetLiteralString.length;

  // The actual parsing function returned by obtainLiteralParser.
  return function (inputSequence, processingPosition) {
    // Robustness check for input parameters.
    if (typeof inputSequence !== 'string' || processingPosition < 0 || processingPosition > inputSequence.length) {
      console.error("Invalid input or position provided to literal parser.");
      return [false, null, processingPosition];
    }

    // Extract a segment from the input sequence starting at processingPosition.
    const segmentToExamine = inputSequence.substring(processingPosition, processingPosition + literalStrLength);

    // Check for an exact match with the predefined literal.
    const isMatchSuccessful = (segmentToExamine === targetLiteralString);

    if (isMatchSuccessful) {
      // On success, return a tuple: [success_flag, matched_value, new_position].
      return [true, targetLiteralString, processingPosition + literalStrLength];
    } else {
      // On failure, return: [failure_flag, null_value, original_position].
      return [false, null, processingPosition];
    }
  };
}

// Function to create a parser that tries a list of parsers in order
// and returns the result of the first one that succeeds.
function createSequentialChoiceParser() {
  // Convert arguments object into a real array of parsers.
  const candidateParserList = Array.from(arguments);

  // Guard clause: if no parsers are provided, this choice parser will always fail.
  if (candidateParserList.length === 0) {
    console.warn("Sequential choice parser created with no candidate parsers. It will always return failure.");
    return function (sourceData, currentPointer) {
      return [false, null, currentPointer];
    };
  }

  return function (inputData, currentScanPosition) {
    // Iterate through each parser in the list.
    for (let parserIndex = 0; parserIndex < candidateParserList.length; parserIndex++) {
      const currentParserCandidate = candidateParserList[parserIndex];

      // Basic validation: ensure the candidate is a function (a parser).
      if (typeof currentParserCandidate !== 'function') {
        console.warn(`Non-function element found at index ${parserIndex} in choice parser list. Skipping it.`);
        continue; // Skip invalid entry and try the next one.
      }

      // Attempt to parse using the current candidate parser.
      const parseAttemptResult = currentParserCandidate(inputData, currentScanPosition);

      // If the parse attempt was successful, return its result immediately.
      if (parseAttemptResult[0]) {
        return parseAttemptResult;
      }
    }
    // If no candidate parser succeeded after trying all of them, return a failure result.
    return [false, null, currentScanPosition];
  };
}

// Function to construct a parser that applies a series of parsers in strict order.
// All parsers in the sequence must succeed for the overall sequence parser to succeed.
function composeSequenceParser() {
  // Collect all provided parsers into an array.
  const orderedParserSteps = Array.from(arguments);

  // Edge case: an empty sequence of parsers always succeeds with an empty result.
  if (orderedParserSteps.length === 0) {
    console.warn("Sequence parser composed with no steps. It will always succeed with an empty array result.");
    return function (sourceInfo, initialPoint) {
      return [true, [], initialPoint];
    };
  }

  return function (sourceContent, initialCursorPosition) {
    const accumulatedResults = []; // Stores the parsed values from each successful step.
    let currentCursor = initialCursorPosition; // Tracks the current position in the input string.

    // Loop through each parser in the defined sequence.
    for (let currentStepIdx = 0; currentStepIdx < orderedParserSteps.length; currentStepIdx++) {
      const stepParser = orderedParserSteps[currentStepIdx];

      // Validate that the current step is indeed a callable parser function.
      if (typeof stepParser !== 'function') {
        console.error(`Invalid parser (not a function) detected at sequence step ${currentStepIdx}. Aborting sequence parsing.`);
        // Return failure, reverting to the initial position to indicate no progress.
        return [false, null, initialCursorPosition];
      }

      // Execute the current step's parser.
      const stepExecutionOutcome = stepParser(sourceContent, currentCursor);

      // If any parser in the sequence fails, the entire sequence fails.
      if (!stepExecutionOutcome[0]) {
        // Return failure, indicating the original starting position of the sequence.
        return [false, null, initialCursorPosition];
      }

      // If successful, store the parsed value and update the cursor for the next parser.
      accumulatedResults.push(stepExecutionOutcome[1]);
      currentCursor = stepExecutionOutcome[2];
    }

    // If all parsers in the sequence succeeded, return the combined results and the final cursor position.
    return [true, accumulatedResults, currentCursor];
  };
}

// Function to create a parser that is initialized lazily.
// This is crucial for handling recursive grammar definitions without infinite loops.
function establishLazyParser(parserFactoryFunction) {
  // Pre-condition check: ensure a valid factory function is provided.
  if (typeof parserFactoryFunction !== 'function') {
    throw new Error("establishLazyParser requires a function that will create the actual parser.");
  }

  let actualParserInstance; // This variable will store the parser once it's created.

  return function (inputStringData, scanningOffset) {
    // If the actual parser hasn't been generated yet, do it now.
    if (!actualParserInstance) {
      actualParserInstance = parserFactoryFunction();
      // Post-condition check: ensure the factory function returned a valid parser.
      if (typeof actualParserInstance !== 'function') {
        throw new Error("The parser factory function did not return a valid parser function.");
      }
    }
    // Once generated (or if already generated), execute the actual parser.
    return actualParserInstance(inputStringData, scanningOffset);
  };
}

// Function to transform the successful output of a parser using a provided mapping function.
function applyOutputTransformation(baseParserFunction, mappingOperation) {
  // Validate inputs: both arguments must be functions.
  if (typeof baseParserFunction !== 'function' || typeof mappingOperation !== 'function') {
    throw new Error("applyOutputTransformation requires both a parser function and a transformation function.");
  }

  return function (dataStream, currentReadPosition) {
    // First, attempt to parse using the underlying base parser.
    const baseParserOutcome = baseParserFunction(dataStream, currentReadPosition);

    // If the base parser failed, propagate the failure result directly.
    if (!baseParserOutcome[0]) {
      return baseParserOutcome;
    }

    // If successful, destructure the result and apply the transformation.
    const [successStatus, parsedPayload, nextReadPosition] = baseParserOutcome;
    const transformedPayload = mappingOperation(parsedPayload);

    // Return the successful status with the newly transformed value.
    return [successStatus, transformedPayload, nextReadPosition];
  };
}

// Function to create a parser that matches a single character
// if that character is present within a specified set of allowed characters.
function matchSingleCharFromSet(allowedCharacterSetString) {
  // Input validation: The set of characters must be a non-empty string.
  if (typeof allowedCharacterSetString !== 'string' || allowedCharacterSetString.length === 0) {
    console.warn("Character set parser initialized with an empty or invalid string. It will always fail.");
    return function (data, offset) { return [false, null, offset]; };
  }

  // Utilize a Set for efficient O(1) average-time character lookup.
  const validCharsLookup = new Set(allowedCharacterSetString);

  return function (sourceContentString, startScanPosition) {
    // Check if the current position is beyond the end of the input string.
    if (startScanPosition >= sourceContentString.length) {
      return [false, null, startScanPosition]; // No character to read.
    }

    // Extract the single character at the current position.
    const characterToTest = sourceContentString.charAt(startScanPosition);

    // Check if this character is part of our allowed set.
    if (validCharsLookup.has(characterToTest)) {
      // Success: return the matched character and advance the position by one.
      return [true, characterToTest, startScanPosition + 1];
    } else {
      // Failure: return null and the original starting position.
      return [false, null, startScanPosition];
    }
  };
}

// --- Main application execution block ---
(function (rawInputBuffer) {
  // Define common literal parsers for structural elements of the grammar.
  const openParenthesis = obtainLiteralParser('(');
  const closeParenthesis = obtainLiteralParser(')');
  const logicalAndOperator = obtainLiteralParser('*');
  const logicalOrOperator = obtainLiteralParser('+');
  const implicationOperator = obtainLiteralParser('->');
  const negationOperator = obtainLiteralParser('-');
  const equalityOperator = obtainLiteralParser('=');

  // Define a lazy parser for boolean logic expressions.
  // This allows the grammar to be self-referential (recursive).
  const booleanLogicExpressionParser = establishLazyParser(function () {

    // Parser for conjunction (AND) operations: (expr * expr)
    const conjunctionParser = applyOutputTransformation(
      composeSequenceParser(openParenthesis, booleanLogicExpressionParser, logicalAndOperator, booleanLogicExpressionParser, closeParenthesis),
      function (parsedSegments) {
        // The sequence parser returns an array like ['(', formula1, '*', formula2, ')'].
        // We extract the actual formula nodes at indices 1 and 3.
        return { type: 'AND_OP', operands: [parsedSegments[1], parsedSegments[3]] };
      }
    );

    // Parser for disjunction (OR) operations: (expr + expr)
    const disjunctionParser = applyOutputTransformation(
      composeSequenceParser(openParenthesis, booleanLogicExpressionParser, logicalOrOperator, booleanLogicExpressionParser, closeParenthesis),
      function (parsedSegments) {
        return { type: 'OR_OP', operands: [parsedSegments[1], parsedSegments[3]] };
      }
    );

    // Parser for implication operations: (expr -> expr)
    const implicationParser = applyOutputTransformation(
      composeSequenceParser(openParenthesis, booleanLogicExpressionParser, implicationOperator, booleanLogicExpressionParser, closeParenthesis),
      function (parsedSegments) {
        return { type: 'IMPLIES_OP', operands: [parsedSegments[1], parsedSegments[3]] };
      }
    );

    // Parser for negation (NOT) operations: (-expr)
    const negationParser = applyOutputTransformation(
      composeSequenceParser(negationOperator, booleanLogicExpressionParser),
      function (parsedSegments) {
        // The sequence returns ['-', formula_node].
        return { type: 'NOT_OP', operands: [parsedSegments[1]] };
      }
    );

    // Parser for atomic boolean values: variables 'a'-'k' or constants 'T', 'F'.
    const atomicBooleanValueParser = applyOutputTransformation(
      matchSingleCharFromSet('abcdefghijkTF'),
      function (charValue) {
        return { type: 'ATOMIC_VALUE', identifier: charValue };
      }
    );

    // The comprehensive boolean expression parser is a choice among all defined sub-parsers.
    return createSequentialChoiceParser(
      conjunctionParser,
      disjunctionParser,
      implicationParser,
      negationParser,
      atomicBooleanValueParser
    );
  });

  // Parser for a full boolean equation: formula = formula
  const fullBooleanEquationParser = applyOutputTransformation(
    composeSequenceParser(booleanLogicExpressionParser, equalityOperator, booleanLogicExpressionParser),
    function (equationParts) {
      // The sequence returns [left_formula_node, '=', right_formula_node].
      return { leftExpression: equationParts[0], rightExpression: equationParts[2] };
    }
  );

  // --- Input processing and evaluation ---

  let sourceFileContent;
  try {
    sourceFileContent = rawInputBuffer.toString('utf8');
  } catch (readError) {
    console.error("Failed to read input data from source:", readError.message);
    process.exit(1); // Terminate on critical input error.
  }

  const linesOfInput = sourceFileContent.split('\n');

  linesOfInput.forEach(function (currentInputLine) {
    // Clean the input line by trimming leading/trailing whitespace.
    const trimmedLine = currentInputLine.trim();

    // Check for the termination signal.
    if (trimmedLine === '#') {
      process.exit(0);
    }

    // Skip any completely empty lines after trimming.
    if (trimmedLine.length === 0) {
      return;
    }

    // Attempt to parse the current line as a boolean equation.
    const equationParsingOutcome = fullBooleanEquationParser(trimmedLine, 0);

    // If parsing itself failed, report it and move to the next line.
    if (!equationParsingOutcome[0]) {
      console.log(`PARSING_FAILED_FOR: "${trimmedLine}"`);
      return;
    }

    const parsedEquationStructure = equationParsingOutcome[1];
    let isUniversallyTrue = true; // Flag to track if the equation holds for all truth assignments.

    // We'll consider variables 'a' through 'j' (10 variables).
    const maxVariableCount = 10;
    const totalTruthAssignments = (1 << maxVariableCount); // 2^10 = 1024 combinations.

    // Helper function to convert a character identifier into a boolean value
    // based on the current truth assignment index.
    const resolveCharToBoolean = function (charIdentifier) {
      if (charIdentifier === 'T') {
        return true;
      } else if (charIdentifier === 'F') {
        return false;
      } else if (charIdentifier >= 'a' && charIdentifier <= 'j') {
        // Calculate the bit position for the variable (e.g., 'a' is bit 0, 'b' is bit 1).
        const variableBitPosition = charIdentifier.charCodeAt(0) - 'a'.charCodeAt(0);
        // Check the corresponding bit in the current truth assignment index.
        return !!((truthAssignmentIterator >> variableBitPosition) & 1);
      } else {
        // This case indicates an unexpected token not handled by the parser's atomic values.
        console.warn(`Encountered unhandled atomic identifier during evaluation: '${charIdentifier}'`);
        return false; // Default to false for unknown identifiers.
      }
    };

    // Recursive function to evaluate the boolean expression tree.
    const evaluateBooleanTree = function (expressionNode) {
      if (!expressionNode) {
        console.error("Attempted to evaluate a null or undefined expression node.");
        return false;
      }

      // Handle atomic values (variables or constants).
      if (expressionNode.type === 'ATOMIC_VALUE') {
        return resolveCharToBoolean(expressionNode.identifier);
      }

      const childNodes = expressionNode.operands;

      if (!childNodes || !Array.isArray(childNodes)) {
        console.error("Invalid 'operands' array in expression node:", expressionNode);
        return false;
      }

      // Evaluate based on the operation type.
      switch (expressionNode.type) {
        case 'NOT_OP':
          if (childNodes.length !== 1) {
            console.warn(`NOT operation expects 1 operand, but found ${childNodes.length}.`);
            return false;
          }
          return !evaluateBooleanTree(childNodes[0]);
        case 'AND_OP':
          if (childNodes.length !== 2) {
            console.warn(`AND operation expects 2 operands, but found ${childNodes.length}.`);
            return false;
          }
          return evaluateBooleanTree(childNodes[0]) && evaluateBooleanTree(childNodes[1]);
        case 'OR_OP':
          if (childNodes.length !== 2) {
            console.warn(`OR operation expects 2 operands, but found ${childNodes.length}.`);
            return false;
          }
          return evaluateBooleanTree(childNodes[0]) || evaluateBooleanTree(childNodes[1]);
        case 'IMPLIES_OP':
          if (childNodes.length !== 2) {
            console.warn(`IMPLIES operation expects 2 operands, but found ${childNodes.length}.`);
            return false;
          }
          const antecedentValue = evaluateBooleanTree(childNodes[0]);
          const consequentValue = evaluateBooleanTree(childNodes[1]);
          // Implication (A -> B) is logically equivalent to (!A || B).
          return !antecedentValue || consequentValue;
        default:
          console.warn(`Unrecognized operation type in expression tree: ${expressionNode.type}`);
          return false;
      }
    };

    // Iterate through all possible truth assignments for the variables.
    for (let truthAssignmentIterator = 0; truthAssignmentIterator < totalTruthAssignments; truthAssignmentIterator++) {
      // Evaluate both the left and right sides of the equation for the current assignment.
      const leftSideTruthValue = evaluateBooleanTree(parsedEquationStructure.leftExpression);
      const rightSideTruthValue = evaluateBooleanTree(parsedEquationStructure.rightExpression);

      // If the truth values of both sides do not match for this assignment,
      // the equation is not a tautology (universally true).
      if (leftSideTruthValue !== rightSideTruthValue) {
        isUniversallyTrue = false;
        // Optimization: If we've found one case where it's false, no need to check further.
        break; // Exit the loop early.
      }
    }

    // Output the final verdict based on the full truth table evaluation.
    if (isUniversallyTrue) {
      console.log('EQUATION_IS_TAUTOLOGY');
    } else {
      console.log('EQUATION_IS_CONTINGENT_OR_CONTRADICTION');
    }
  });

// The input source is expected to be '/dev/stdin' as a UTF-8 encoded file.
})(require('fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' }));