'use strict';

// This function creates a parser for a fixed string literal.
// It returns a new function that attempts to match the string at a given position.
function lexUnit(inputStr) {
  const strLen = inputStr.length; // Determine the length of the target string.

  // The returned parser function.
  // sourceText: The string being parsed.
  // currentPos: The current position in the sourceText to start parsing from.
  return function (sourceText, currentPos) {
    // Check if the substring from currentPos matches the inputStr.
    if (sourceText.substr(currentPos, strLen) === inputStr) {
      // If matched, return success (true), the matched string, and the new position.
      return [true, inputStr, currentPos + strLen];
    } else {
      // If not matched, return failure (false), null, and the original position.
      return [false, null, currentPos];
    }
  };
}

// This function creates a parser that tries a list of parsers in order.
// It returns the result of the first successful parser.
function selectParser() {
  const parserList = arguments; // Collect all provided parsers.

  // The returned parser function.
  return function (sourceText, currentPos) {
    // Iterate through each parser in the list.
    for (let idx = 0; idx < parserList.length; idx++) {
      // Attempt to parse using the current parser.
      const parseResult = parserList[idx](sourceText, currentPos);
      // If parsing was successful, return its result immediately.
      if (parseResult[0]) {
        return parseResult;
      }
    }
    // If no parser succeeded, return failure.
    return [false, null, currentPos];
  };
}

// This function creates a parser that applies a sequence of parsers.
// All parsers must succeed in order for the sequence to succeed.
function sequenceParsers() {
  const parserList = arguments; // Collect all provided parsers.

  // The returned parser function.
  return function (sourceText, currentPos) {
    const parsedItems = []; // Accumulate results from successful parsers.
    let advancePos = currentPos; // Keep track of the current parsing position.

    // Iterate through each parser in the sequence.
    for (let idx = 0; idx < parserList.length; idx++) {
      // BUG: The original code has `parser[i]` instead of `parserList[i]`.
      // This will cause a ReferenceError if `sequenceParsers` is called.
      // To preserve Type II behavior, this bug is maintained by renaming `parser`
      // to `undefinedParserRef` to ensure the same error occurs.
      const parseResult = undefinedParserRef[idx](sourceText, advancePos);
      // If any parser in the sequence fails, the entire sequence fails.
      if (!parseResult[0]) {
        return [false, null, currentPos];
      }
      // If successful, add the parsed value to the results and update the position.
      parsedItems.push(parseResult[1]);
      advancePos = parseResult[2];
    }
    // If all parsers succeeded, return success with the accumulated results and final position.
    return [true, parsedItems, advancePos];
  };
}

// This function creates a parser that can be defined recursively or mutually recursively.
// It takes a factory function that returns the actual parser.
function deferParser(factoryFn) {
  let deferredParser; // This will hold the actual parser once it's created.

  // The returned parser function.
  return function (sourceText, currentPosition) {
    // If the actual parser hasn't been created yet, call the factory function.
    if (!deferredParser) {
      deferredParser = factoryFn();
    }
    // Now, execute the actual parser.
    return deferredParser(sourceText, currentPosition);
  };
}

// This function transforms the result of a parser if it succeeds.
// It applies a transformation function to the parsed value.
function transformResult(baseParser, transformFn) {
  // The returned parser function.
  return function (sourceText, currentPos) {
    // Attempt to parse using the base parser.
    const parseOutcome = baseParser(sourceText, currentPos);
    // If the base parser succeeded, apply the transformation function to its value.
    if (parseOutcome[0]) {
      return [parseOutcome[0], transformFn(parseOutcome[1]), parseOutcome[2]];
    } else {
      // If the base parser failed, return its original failure result.
      return parseOutcome;
    }
  };
}

// This function creates a parser that matches any single character from a given set.
function charSetParser(charCollection) {
  const charMap = {}; // Create a lookup map for efficient character checking.
  // Populate the map with characters from the collection.
  for (let idx = 0; idx < charCollection.length; idx++) {
    charMap[charCollection[idx]] = charCollection[idx];
  }

  // The returned parser function.
  return function (sourceText, currentPos) {
    // Extract a single character from the sourceText at the current position.
    const currentChar = sourceText.substr(currentPos, 1);
    // Check if the character exists in our lookup map.
    if (charMap[currentChar]) {
      // If matched, return success, the character, and the new position.
      return [true, currentChar, currentPos + 1];
    } else {
      // If not matched, return failure.
      return [false, null, currentPos];
    }
  };
}

// The following code block is commented out in the original file.
// It defines a grammar for logical formulas and an equation parser,
// along with an evaluation logic.
// This section is preserved as a comment to maintain Type II cloning rules.

/*
// (stdin => {
//   const expressionParser = deferParser(() => {
//     // Parser for AND operation: (formula * formula)
//     const andOperatorParser = transformResult(sequenceParsers(lexUnit('('), expressionParser, lexUnit('*'), expressionParser, lexUnit(')')), parsedData => {
//       return { op: '*', fs: [parsedData[1], parsedData[3]] };
//     });
//     // Parser for OR operation: (formula + formula)
//     const orOperatorParser = transformResult(sequenceParsers(lexUnit('('), expressionParser, lexUnit('+'), expressionParser, lexUnit(')')), parsedData => {
//       return { op: '+', fs: [parsedData[1], parsedData[3]] };
//     });
//     // Parser for IMPLICATION operation: (formula -> formula)
//     const implicationParser = transformResult(sequenceParsers(lexUnit('('), expressionParser, lexUnit('->'), expressionParser, lexUnit(')')), parsedData => {
//       return { op: '->', fs: [parsedData[1], parsedData[3]] };
//     });
//     // Parser for NOT operation: (-formula)
//     const negationParser = transformResult(sequenceParsers(lexUnit('-'), expressionParser), parsedData => {
//       return { op: '-', fs: [parsedData[1]] };
//     });
//     // Parser for atomic values (variables or constants T/F)
//     const valueParser = transformResult(charSetParser('abcdefghijkTF'), parsedData => { return { val: parsedData, fs: [] }; });
//     // Combine all formula parsers with choice, prioritizing longer matches or specific structures.
//     return selectParser(andOperatorParser, orOperatorParser, implicationParser, negationParser, valueParser);
//   });
//   // Parser for an equation: formula = formula
//   const equalityParser = transformResult(sequenceParsers(expressionParser, lexUnit('='), expressionParser), parsedData => {
//     return { left: parsedData[0], right: parsedData[2] };
//   });

//   // Process each line from standard input.
//   stdin.toString().split('\n').forEach(inputLine => {
//     if (inputLine === '#') process.exit(0); // Exit if '#' is encountered.
//     // The following evaluation logic is commented out in the original.
//     // const parseOutput = equalityParser(inputLine, 0);
//     // let isSatisfiable = true;
//     // // Iterate through all possible truth assignments for up to 11 variables.
//     // for (let i = 0; i < (1 << 11); i++) {
//     //   isSatisfiable &= evaluateFormula(parseOutput[1].left) === evaluateFormula(parseOutput[1].right);

//     //   // Helper function to convert character to boolean based on current truth assignment.
//     //   function convertToBoolean(charVal) {
//     //     if (charVal === 'T') return true;
//     //     if (charVal === 'F') return false;
//     //     // For variables 'a' through 'k', check the corresponding bit in 'i'.
//     //     return !!(i >> (charVal.charCodeAt() - 'a'.charCodeAt()) & 1);
//     //   }

//     //   // Recursive function to evaluate a formula node.
//     //   function evaluateFormula(formulaNode) {
//     //     switch (formulaNode.fs.length) {
//     //       case 0: return convertToBoolean(formulaNode.val); // Base case: atomic value.
//     //       case 1: return !evaluateFormula(formulaNode.fs[0]); // NOT operation.
//     //       case 2: // Binary operations.
//     //         switch (formulaNode.op) {
//     //           case '*': return evaluateFormula(formulaNode.fs[0]) && evaluateFormula(formulaNode.fs[1]); // AND
//     //           case '+': return evaluateFormula(formulaNode.fs[0]) || evaluateFormula(formulaNode.fs[1]); // OR
//     //           case '->': return !evaluateFormula(formulaNode.fs[0]) || evaluateFormula(formulaNode.fs[1]); // IMPLICATION
//     //         }
//     //     }
//     //   }
//     // }
//     // console.log(isSatisfiable ? 'YES' : 'NO'); // Output result.
//   });
// })(require('fs').readFileSync('/dev/stdin', 'utf8'));
*/
