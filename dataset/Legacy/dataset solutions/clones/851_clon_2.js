'use strict';

// A utility function to create a parser for a fixed string literal.
function lexUnit(patternStr) {
  const patternLen = patternStr.length; // Determine the length of the string to match.
  return function (inputStr, currentIdx) {
    // Check if the substring at the current index matches the pattern.
    if (inputStr.substr(currentIdx, patternLen) === patternStr) {
      // If matched, return success, the matched string, and the new position.
      return [true, patternStr, currentIdx + patternLen];
    } else {
      // If not matched, return failure, null, and the original position.
      return [false, null, currentIdx];
    }
  };
}

// Creates a parser that tries a list of parsers in order and returns the first successful one.
function selectParser() {
  const parserList = arguments; // Get all parser functions passed as arguments.
  return function (inputStr, currentIdx) {
    // Iterate through the provided parsers.
    for (let idx = 0; idx < parserList.length; idx++) {
      const parseOutcome = parserList[idx](inputStr, currentIdx); // Attempt to parse.
      if (parseOutcome[0]) {
        // If parsing was successful, return its result immediately.
        return parseOutcome;
      }
    }
    // If no parser succeeded, return a failure result.
    return [false, null, currentIdx];
  };
}

// Creates a parser that applies a sequence of parsers. All must succeed in order.
function chainParsers() {
  const parserList = arguments; // Get all parser functions.
  return function (inputStr, currentIdx) {
    const parseResult = []; // Accumulate results from successful parsers.
    let nextIdx = currentIdx; // Keep track of the current position in the input string.

    // Loop through each parser in the sequence.
    for (let idx = 0; idx < parserList.length; idx++) {
      const parseOutcome = parserList[idx](inputStr, nextIdx); // Apply the current parser.
      if (!parseOutcome[0]) {
        // If any parser fails, the entire sequence fails.
        return [false, null, currentIdx];
      }
      parseResult.push(parseOutcome[1]); // Store the successful parse value.
      nextIdx = parseOutcome[2]; // Update the position for the next parser.
    }
    // If all parsers succeeded, return the accumulated results and the final position.
    return [true, parseResult, nextIdx];
  };
}

// Creates a parser that is lazily initialized. Useful for recursive grammar definitions.
function deferParser(transformFunc) {
  let actualParser; // This will hold the actual parser once initialized.
  return function (inputStr, startPosition) {
    // Initialize the parser only when it's first called.
    if (!actualParser) {
      actualParser = transformFunc(); // Call the factory function to get the parser.
    }
    // Then, execute the actual parser.
    return actualParser(inputStr, startPosition);
  };
}

// Transforms the result of a parser using a provided function.
function transformResult(actualParser, transformFunc) {
  return function (inputStr, currentIdx) {
    const parseResult = actualParser(inputStr, currentIdx); // Run the base parser.
    // If the base parser succeeded, apply the transformation function to its value.
    if (parseResult[0]) {
      return [parseResult[0], transformFunc(parseResult[1]), parseResult[2]];
    } else {
      // If the base parser failed, return its original failure result.
      return parseResult;
    }
  };
}

// Creates a parser that matches a single character from a given set of characters.
function matchCharInSet(charSet) {
  const charMap = {}; // Use an object for efficient character lookup.
  for (let idx = 0; idx < charSet.length; idx++) {
    charMap[charSet[idx]] = charSet[idx]; // Populate the map.
  }
  return function (inputStr, currentIdx) {
    const currentChar = inputStr.substr(currentIdx, 1); // Get the character at the current position.
    // Check if the character exists in our allowed set.
    if (charMap[currentChar]) {
      return [true, currentChar, currentIdx + 1]; // Success: return char and advance position.
    } else {
      return [false, null, currentIdx]; // Failure.
    }
  };
}

// Main execution block for processing input.
(function (inputData) {
  // Define the parser for logical formulas using lazy evaluation for recursion.
  const expressionParser = deferParser(function () {
    // Parser for AND operations: (formula * formula)
    const conjunctionParser = transformResult(
      chainParsers(lexUnit('('), expressionParser, lexUnit('*'), expressionParser, lexUnit(')')),
      function (parsedItems) {
        return { op: '*', fs: [parsedItems[1], parsedItems[3]] };
      }
    );

    // Parser for OR operations: (formula + formula)
    const disjunctionParser = transformResult(
      chainParsers(lexUnit('('), expressionParser, lexUnit('+'), expressionParser, lexUnit(')')),
      function (parsedItems) {
        return { op: '+', fs: [parsedItems[1], parsedItems[3]] };
      }
    );

    // Parser for IMPLICATION operations: (formula -> formula)
    const implicationParser = transformResult(
      chainParsers(lexUnit('('), expressionParser, lexUnit('->'), expressionParser, lexUnit(')')),
      function (parsedItems) {
        return { op: '->', fs: [parsedItems[1], parsedItems[3]] };
      }
    );

    // Parser for NOT operations: -formula
    const negationParser = transformResult(
      chainParsers(lexUnit('-'), expressionParser),
      function (parsedItems) {
        return { op: '-', fs: [parsedItems[1]] };
      }
    );

    // Parser for atomic values (variables a-k, T, F)
    const valueParser = transformResult(
      matchCharInSet('abcdefghijkTF'),
      function (charVal) {
        return { val: charVal, fs: [] };
      }
    );

    // Combine all formula parsers, trying them in order of precedence/specificity.
    return selectParser(conjunctionParser, disjunctionParser, implicationParser, negationParser, valueParser);
  });

  // Parser for an entire equation: formula = formula
  const equalityParser = transformResult(
    chainParsers(expressionParser, lexUnit('='), expressionParser),
    function (parsedItems) {
      return { left: parsedItems[0], right: parsedItems[2] };
    }
  );

  // Process each line from the standard input.
  inputData.toString().split('\n').forEach(function (lineContent) {
    // Exit if a '#' character is encountered.
    if (lineContent === '#') {
      process.exit(0);
    }

    // Attempt to parse the current line as an equation.
    const parseOutput = equalityParser(lineContent, 0);
    let isEquiv = true; // Flag to track if the equation holds true for all assignments.

    // Iterate through all possible truth assignments for variables 'a' through 'k'.
    // There are 11 variables (a-k), so 2^11 combinations.
    for (let bitmaskIter = 0; bitmaskIter < (1 << 11); bitmaskIter++) {
      // Helper function to convert a character (variable, 'T', 'F') to a boolean value.
      const convertCharToBool = function (charVal) {
        if (charVal === 'T') return true;
        if (charVal === 'F') return false;
        // For variables 'a' through 'k', determine truth value based on the current bitmask.
        return !!(bitmaskIter >> (charVal.charCodeAt() - 'a'.charCodeAt()) & 1);
      };

      // Recursive function to evaluate the truth value of an expression node.
      const evaluateExpression = function (exprNode) {
        switch (exprNode.fs.length) {
          case 0: // Base case: a literal value or variable.
            return convertCharToBool(exprNode.val);
          case 1: // Unary operation (NOT).
            return !evaluateExpression(exprNode.fs[0]);
          case 2: // Binary operations (AND, OR, IMPLICATION).
            switch (exprNode.op) {
              case '*': return evaluateExpression(exprNode.fs[0]) && evaluateExpression(exprNode.fs[1]);
              case '+': return evaluateExpression(exprNode.fs[0]) || evaluateExpression(exprNode.fs[1]);
              case '->': return !evaluateExpression(exprNode.fs[0]) || evaluateExpression(exprNode.fs[1]);
            }
        }
      };
      // Check if the left side of the equation is equivalent to the right side for the current assignment.
      // If not, the equation is not a tautology, and we can break early.
      if (evaluateExpression(parseOutput[1].left) !== evaluateExpression(parseOutput[1].right)) {
        isEquiv = false;
        break; // No need to check further assignments if one fails.
      }
    }
    // Output "YES" if the equation is a tautology (equivalent for all assignments), "NO" otherwise.
    console.log(isEquiv ? 'YES' : 'NO');
  });
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input.
