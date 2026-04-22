'use strict';

// --- Core Parser Combinator Utilities ---

// Define constant indices for the structure of parser result arrays.
const PARSE_RESULT_SUCCESS_FLAG = 0; // Boolean: true for successful parse, false otherwise.
const PARSE_RESULT_VALUE_DATA = 1;   // The value extracted by the parser, or null on failure.
const PARSE_RESULT_NEXT_POSITION = 2; // The updated index in the input string after parsing.

/**
 * Creates a parser that attempts to match a fixed string literal at the current position.
 * It includes robust validation and error handling for inputs.
 * @param {string} targetLiteral The exact string sequence to match.
 * @returns {function(string, number): [boolean, string|null, number]} A specialized parser function.
 */
function matchExactString(targetLiteral) {
  // Input validation for the target literal itself.
  if (typeof targetLiteral !== 'string' || targetLiteral.length === 0) {
    console.error('Error: matchExactString received an invalid or empty target literal. Returning a failing parser.');
    return (sourceInput, currentPoint) => [false, null, currentPoint]; // Always fails for invalid definition.
  }

  const literalLength = targetLiteral.length;

  // The actual parsing logic, returned as a closure.
  return (sourceInput, currentPoint) => {
    // Runtime validation of parser input.
    if (typeof sourceInput !== 'string' || currentPoint < 0 || currentPoint > sourceInput.length) {
      console.error('Error: Invalid source input string or position provided to matchExactString instance.');
      return [false, null, currentPoint];
    }

    // Check if there's enough string left to match the literal.
    if (currentPoint + literalLength > sourceInput.length) {
      return [false, null, currentPoint]; // Not enough characters remaining.
    }

    const extractedSubstring = sourceInput.substring(currentPoint, currentPoint + literalLength);

    if (extractedSubstring === targetLiteral) {
      // Successful match.
      const newScanPosition = currentPoint + literalLength;
      return [true, targetLiteral, newScanPosition];
    } else {
      // Failed to match the literal.
      return [false, null, currentPoint];
    }
  };
}

/**
 * Constructs a parser that tries multiple parsers sequentially, returning the result of the first one that succeeds.
 * If no parser succeeds, it returns a failure.
 * @param {...function(string, number): [boolean, any, number]} candidateParsers A spread of parser functions to attempt.
 * @returns {function(string, number): [boolean, any|null, number]} A parser that implements the choice logic.
 */
function selectFirstSuccessful(...candidateParsers) {
  // Defensive check: if no parsers are provided, it can never succeed.
  if (candidateParsers.length === 0) {
    console.warn('Warning: selectFirstSuccessful was invoked with no candidate parsers. It will always fail.');
    return (textBuffer, initialOffset) => [false, null, initialOffset];
  }

  return (textBuffer, initialOffset) => {
    // Validate the runtime inputs for the parser.
    if (typeof textBuffer !== 'string' || initialOffset < 0 || initialOffset > textBuffer.length) {
      console.error('Error: Invalid text buffer or offset supplied to selectFirstSuccessful parser.');
      return [false, null, initialOffset];
    }

    // Iterate through each parser until one succeeds.
    for (let currentParserFn of candidateParsers) {
      // Ensure the element is actually a function before calling.
      if (typeof currentParserFn !== 'function') {
        console.warn('Non-function element encountered in candidateParsers array. Skipping this entry.');
        continue;
      }

      const outcomeTuple = currentParserFn(textBuffer, initialOffset);
      if (outcomeTuple[PARSE_RESULT_SUCCESS_FLAG]) {
        return outcomeTuple; // Return the first successful result immediately.
      }
    }
    // If the loop completes without a success, all parsers failed.
    return [false, null, initialOffset];
  };
}

/**
 * Creates a parser that requires a sequence of other parsers to all succeed in order.
 * If any parser in the sequence fails, the entire sequence parser fails.
 * @param {...function(string, number): [boolean, any, number]} orderedParserSteps A series of parsers to apply sequentially.
 * @returns {function(string, number): [boolean, Array<any>|null, number]} A parser function for sequences.
 */
function parseInOrder(...orderedParserSteps) {
  // If no steps are provided, it's an empty sequence, which can be considered a success.
  if (orderedParserSteps.length === 0) {
    console.warn('Warning: parseInOrder called with no parser steps. It will succeed with an empty array.');
    return (inputSource, entryPoint) => [true, [], entryPoint];
  }

  return (inputSource, entryPoint) => {
    // Validate input to the generated parser.
    if (typeof inputSource !== 'string' || entryPoint < 0 || entryPoint > inputSource.length) {
      console.error('Error: Invalid input source or entry point given to parseInOrder parser.');
      return [false, null, entryPoint];
    }

    const collectedParsedItems = []; // Accumulates results from successful sub-parsers.
    let currentCursorPosition = entryPoint; // Tracks the position throughout the sequence.

    for (let stepParser of orderedParserSteps) {
      // Ensure each step in the sequence is a valid parser function.
      if (typeof stepParser !== 'function') {
        console.error('Error: A non-function element was found in the orderedParserSteps. Aborting sequence parsing.');
        return [false, null, entryPoint]; // Fail the entire sequence if an invalid step is found.
      }

      const stepOutcome = stepParser(inputSource, currentCursorPosition);

      if (!stepOutcome[PARSE_RESULT_SUCCESS_FLAG]) {
        // If any step fails, the entire sequence fails, resetting to initial position.
        return [false, null, entryPoint];
      }

      // On success, store the value and advance the cursor.
      collectedParsedItems.push(stepOutcome[PARSE_RESULT_VALUE_DATA]);
      currentCursorPosition = stepOutcome[PARSE_RESULT_NEXT_POSITION];
    }

    // If all steps completed successfully, return the aggregated results.
    return [true, collectedParsedItems, currentCursorPosition];
  };
}

/**
 * Provides a way to define mutually recursive parsers by delaying their initialization.
 * The parser is initialized only once, upon its first invocation.
 * @param {function(): function(string, number): [boolean, any, number]} parserBuilder A function that, when called, returns the actual parser.
 * @returns {function(string, number): [boolean, any, number]} The memoized, lazily initialized parser.
 */
function createLazyParser(parserBuilder) {
  // Pre-validation of the builder function.
  if (typeof parserBuilder !== 'function') {
    throw new Error('createLazyParser requires a function that builds the parser.');
  }

  let memoizedParserInstance = null; // Will store the parser after its first build.

  return function(textData, startingOffset) {
    // Build the parser only if it hasn't been built yet.
    if (memoizedParserInstance === null) {
      memoizedParserInstance = parserBuilder();
      // Post-validation: ensure the builder actually returned a function.
      if (typeof memoizedParserInstance !== 'function') {
        throw new Error('The parserBuilder function did not return a valid parser function.');
      }
    }
    // Delegate to the (now guaranteed to be initialized) parser.
    return memoizedParserInstance(textData, startingOffset);
  };
}

/**
 * Transforms the successful result of a base parser using a provided function.
 * If the base parser fails, the failure is propagated.
 * @param {function(string, number): [boolean, any, number]} baseParserFn The parser whose successful value will be transformed.
 * @param {function(any): any} transformerFn A function to apply to the parsed value.
 * @returns {function(string, number): [boolean, any|null, number]} A new parser returning the transformed value.
 */
function applyTransformToResult(baseParserFn, transformerFn) {
  // Ensure both arguments are valid functions.
  if (typeof baseParserFn !== 'function' || typeof transformerFn !== 'function') {
    throw new Error('applyTransformToResult requires both a base parser and a transformation function.');
  }

  return (sourceText, initialPosition) => {
    const parseAttempt = baseParserFn(sourceText, initialPosition);

    if (parseAttempt[PARSE_RESULT_SUCCESS_FLAG]) {
      const originalValue = parseAttempt[PARSE_RESULT_VALUE_DATA];
      const nextScanPoint = parseAttempt[PARSE_RESULT_NEXT_POSITION];

      try {
        const transformedValue = transformerFn(originalValue);
        return [true, transformedValue, nextScanPoint];
      } catch (transformError) {
        console.error('Error during result transformation:', transformError);
        // If transformation fails, it's treated as a parsing failure.
        return [false, null, initialPosition];
      }
    } else {
      // If the base parser failed, simply pass its failure result through.
      return parseAttempt;
    }
  };
}

/**
 * Creates a parser that matches a single character, provided that character is within a specified set.
 * @param {string} permittedCharacters A string containing all characters allowed to be matched.
 * @returns {function(string, number): [boolean, string|null, number]} A parser for a single character from the set.
 */
function matchSingleCharFromSet(permittedCharacters) {
  // Validate the set of permitted characters.
  if (typeof permittedCharacters !== 'string' || permittedCharacters.length === 0) {
    console.error('Error: matchSingleCharFromSet received an invalid or empty character set. Returning a failing parser.');
    return (inputLine, currentIdx) => [false, null, currentIdx];
  }

  // Use a Set for efficient `has()` lookups.
  const allowedCharactersSet = new Set(permittedCharacters);

  return (inputLine, currentIdx) => {
    // Validate runtime parser inputs.
    if (typeof inputLine !== 'string' || currentIdx < 0 || currentIdx >= inputLine.length) {
      // If index is out of bounds or input is invalid, no character can be matched.
      return [false, null, currentIdx];
    }

    const charToInspect = inputLine.charAt(currentIdx);

    if (allowedCharactersSet.has(charToInspect)) {
      // Character found in the allowed set.
      return [true, charToInspect, currentIdx + 1];
    } else {
      // Character not in the allowed set.
      return [false, null, currentIdx];
    }
  };
}

// --- Domain-Specific Logic: Boolean Formula Parsing and Tautology Checking ---

(function(inputSourceReader) {
  // Constants for boolean variable handling (a-k).
  const TOTAL_BOOLEAN_VARS = 11; // 'a' through 'k'
  const ASCII_CODE_FOR_VAR_A = 'a'.charCodeAt(0);

  /**
   * Interprets a character identifier (e.g., 'a', 'T', 'F') as a boolean value
   * based on the current truth assignment index for variables.
   * @param {string} identifierChar The character representing a boolean value or variable.
   * @param {number} currentTruthAssignmentIdx A bitmask representing truth values for 'a'-'k'.
   * @returns {boolean} The resolved boolean value.
   */
  const resolveBooleanValue = (identifierChar, currentTruthAssignmentIdx) => {
    if (identifierChar === 'T') {
      return true;
    }
    if (identifierChar === 'F') {
      return false;
    }

    // For variables 'a' through 'k'.
    const charAscii = identifierChar.charCodeAt(0);
    const variableOffset = charAscii - ASCII_CODE_FOR_VAR_A;

    // Check the corresponding bit in the truth assignment index.
    return !!((currentTruthAssignmentIdx >> variableOffset) & 1);
  };

  /**
   * Recursively evaluates a parsed logical formula tree for a given truth assignment.
   * @param {object} formulaParseTree A node in the abstract syntax tree of the formula.
   * @param {number} currentTruthAssignmentIdx A bitmask for variable truth assignments.
   * @returns {boolean} The truth value of the formula under the given assignment.
   */
  const evaluateLogicalExpression = (formulaParseTree, currentTruthAssignmentIdx) => {
    // Base case: If no operands, it's an atomic identifier (T, F, or variable).
    if (formulaParseTree.operands.length === 0) {
      return resolveBooleanValue(formulaParseTree.identifier, currentTruthAssignmentIdx);
    }

    // Unary operator: Negation
    if (formulaParseTree.operands.length === 1 && formulaParseTree.opType === 'NEGATION') {
      return !evaluateLogicalExpression(formulaParseTree.operands[0], currentTruthAssignmentIdx);
    }

    // Binary operators: AND, OR, IMPLIES
    if (formulaParseTree.operands.length === 2) {
      const leftSubExprValue = evaluateLogicalExpression(formulaParseTree.operands[0], currentTruthAssignmentIdx);
      const rightSubExprValue = evaluateLogicalExpression(formulaParseTree.operands[1], currentTruthAssignmentIdx);

      switch (formulaParseTree.opType) {
        case 'CONJUNCTION': return leftSubExprValue && rightSubExprValue;
        case 'DISJUNCTION': return leftSubExprValue || rightSubExprValue;
        case 'IMPLICATION': return !leftSubExprValue || rightSubExprValue; // P -> Q is equivalent to !P || Q
        default:
          console.error(`Error: Unrecognized binary operator type in AST: ${formulaParseTree.opType}`);
          return false; // Default to false for safety/error handling.
      }
    }

    // This point should ideally not be reached with a well-formed AST.
    console.error('Error: Encountered an unexpected formula tree structure:', formulaParseTree);
    return false;
  };

  // --- Grammar Definition for Boolean Formulas ---
  // Using `createLazyParser` to handle recursive definitions of `recursiveLogicalFormula`.

  const recursiveLogicalFormula = createLazyParser(() => {
    // Parser for conjunction: `(FORMULA * FORMULA)`
    const andOperatorParser = applyTransformToResult(
      parseInOrder(
        matchExactString('('),
        recursiveLogicalFormula,
        matchExactString('*'),
        recursiveLogicalFormula,
        matchExactString(')')
      ),
      // Transformation: extract operands and assign operator type.
      parsedItems => ({ opType: 'CONJUNCTION', operands: [parsedItems[1], parsedItems[3]] })
    );

    // Parser for disjunction: `(FORMULA + FORMULA)`
    const orOperatorParser = applyTransformToResult(
      parseInOrder(
        matchExactString('('),
        recursiveLogicalFormula,
        matchExactString('+'),
        recursiveLogicalFormula,
        matchExactString(')')
      ),
      parsedItems => ({ opType: 'DISJUNCTION', operands: [parsedItems[1], parsedItems[3]] })
    );

    // Parser for implication: `(FORMULA -> FORMULA)`
    const impliesOperatorParser = applyTransformToResult(
      parseInOrder(
        matchExactString('('),
        recursiveLogicalFormula,
        matchExactString('->'),
        recursiveLogicalFormula,
        matchExactString(')')
      ),
      parsedItems => ({ opType: 'IMPLICATION', operands: [parsedItems[1], parsedItems[3]] })
    );

    // Parser for negation: `-FORMULA`
    const notOperatorParser = applyTransformToResult(
      parseInOrder(
        matchExactString('-'),
        recursiveLogicalFormula
      ),
      parsedItems => ({ opType: 'NEGATION', operands: [parsedItems[1]] })
    );

    // Parser for atomic values: single characters from 'a'-'k', 'T', or 'F'.
    const atomicBooleanValueParser = applyTransformToResult(
      matchSingleCharFromSet('abcdefghijkTF'),
      matchedChar => ({ identifier: matchedChar, operands: [] }) // Atomic values have no operands.
    );

    // A logical formula can be any of these forms.
    return selectFirstSuccessful(
      andOperatorParser,
      orOperatorParser,
      impliesOperatorParser,
      notOperatorParser,
      atomicBooleanValueParser
    );
  });

  // Parser for the top-level equivalence statement: `FORMULA = FORMULA`
  const equivalenceStatementParser = applyTransformToResult(
    parseInOrder(
      recursiveLogicalFormula,
      matchExactString('='),
      recursiveLogicalFormula
    ),
    // Transformation: structure the result into left-hand side (LHS) and right-hand side (RHS).
    parsedParts => ({ lhsFormula: parsedParts[0], rhsFormula: parsedParts[2] })
  );

  // --- Main Input Processing Loop ---

  // Read the entire input stream, split it by newlines, and process each line.
  inputSourceReader.toString().split('\n').forEach(inputLineContent => {
    const cleanedLine = inputLineContent.trim();

    // Standard competitive programming exit condition.
    if (cleanedLine === '#') {
      process.exit(0);
    }

    // Skip any empty lines.
    if (cleanedLine.length === 0) {
      return;
    }

    // Attempt to parse the current line as a logical equivalence statement.
    const parsingOutcome = equivalenceStatementParser(cleanedLine, 0);

    // Check for parsing success and ensure the entire line was consumed.
    if (!parsingOutcome[PARSE_RESULT_SUCCESS_FLAG] || parsingOutcome[PARSE_RESULT_NEXT_POSITION] !== cleanedLine.length) {
      console.error(`Parsing failed or did not consume the full line: "${cleanedLine}"`);
      console.log('NO'); // Treat parsing errors as non-tautologies.
      return;
    }

    const parsedStatement = parsingOutcome[PARSE_RESULT_VALUE_DATA];
    let isTautology = true; // Assume it's a tautology until proven otherwise.

    // Iterate through all possible truth assignments for the boolean variables ('a' through 'k').
    // There are 2^TOTAL_BOOLEAN_VARS combinations.
    const totalTruthCombinations = 1 << TOTAL_BOOLEAN_VARS;
    for (let truthAssignmentCounter = 0; truthAssignmentCounter < totalTruthCombinations; truthAssignmentCounter++) {
      // Evaluate both sides of the equivalence statement using the current truth assignment.
      const lhsTruthValue = evaluateLogicalExpression(parsedStatement.lhsFormula, truthAssignmentCounter);
      const rhsTruthValue = evaluateLogicalExpression(parsedStatement.rhsFormula, truthAssignmentCounter);

      // If the truth values of LHS and RHS differ for any assignment, it's not a tautology.
      if (lhsTruthValue !== rhsTruthValue) {
        isTautology = false;
        break; // No need to check further assignments; we've found a counterexample.
      }
    }

    // Output the final determination.
    console.log(isTautology ? 'YES' : 'NO');
  });

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input file system.