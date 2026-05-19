'use strict';

// This function creates a parser for a fixed string literal.
function lexicalUnit(inputString) {
  // Determine the length of the string literal to match.
  const stringLength = inputString.length;

  // Return a new parsing function.
  return (sourceText, currentPosition) => {
    // Check if the substring at the current position matches the input string.
    if (sourceText.substr(currentPosition, stringLength) === inputString) {
      // If it matches, return success: true, the matched string, and the new position.
      return [true, inputString, currentPosition + stringLength];
    } else {
      // If it doesn't match, return failure: false, null, and the original position.
      return [false, null, currentPosition];
    }
  };
}

/*
 * This function generates a parser that attempts to match
 * one of several provided parsers in order.
 */
// function selectOption() {
//   // Collect all parser functions passed as arguments.
//   const parserFunctions = arguments;
//   // Return a new parsing function.
//   return (sourceText, currentPosition) => {
//     // Iterate through each parser function.
//     for (let currentParser of parserFunctions) {
//       // Attempt to parse the target string at the current position.
//       const parsingResult = currentParser(sourceText, currentPosition);
//       // If the current parser successfully matched something, return its result.
//       if (parsingResult[0]) return parsingResult;
//     }
//     // If no parser matched, return a failure result.
//     return [false, null, currentPosition];
//   };
// }

/*
 * This function creates a parser that matches a sequence of other parsers.
 * All parsers in the sequence must succeed for the overall sequence to succeed.
 */
// function sequenceOf() {
//   // Gather all parser functions for the sequence.
//   const parserSteps = arguments;
//   // Return the combined sequence parser.
//   return (sourceText, initialPosition) => {
//     // Array to store the results of each successful parser in the sequence.
//     const collectedMatches = [];
//     // Keep track of the position after each successful parse.
//     let subsequentPosition = initialPosition;
//     // Iterate through each parser in the defined sequence.
//     for (let stepParser of parserSteps) {
//       // Attempt to parse using the current step parser.
//       const stepResult = stepParser(sourceText, subsequentPosition);
//       // If any step parser fails, the entire sequence fails.
//       if (!stepResult[0]) return [false, null, initialPosition];
//       // If successful, add the matched value to the results.
//       collectedMatches.push(stepResult[1]);
//       // Update the position for the next parser in the sequence.
//       subsequentPosition = stepResult[2];
//     }
//     // If all parsers succeeded, return the combined results and the final position.
//     return [true, collectedMatches, subsequentPosition];
//   };
// }

/*
 * This utility function allows for defining recursive parsers by
 * delaying the evaluation of a parser until it's actually needed.
 */
// function deferredParser(parserFactory) {
//   // Variable to store the parser once it's created.
//   let cachedParser;
//   // Return the lazy parser function.
//   return function (inputString, currentOffset) {
//     // If the parser hasn't been created yet, call the factory function.
//     if (!cachedParser) cachedParser = parserFactory();
//     // Execute the (now created) parser.
//     return cachedParser(inputString, currentOffset);
//   };
// }

/*
 * This function applies a transformation function to the successful result
 * of a parser, allowing for modification of the parsed value.
 */
// function transformResult(baseParser, mapperFunction) {
//   // Return a new parser that wraps the base parser.
//   return (sourceInput, startPosition) => {
//     // Attempt to parse using the provided base parser.
//     const parsingOutcome = baseParser(sourceInput, startPosition);
//     // If the base parser succeeded, apply the mapper function to its value.
//     if (parsingOutcome[0]) {
//       return [parsingOutcome[0], mapperFunction(parsingOutcome[1]), parsingOutcome[2]];
//     } else {
//       // If the base parser failed, return its failure result directly.
//       return parsingOutcome;
//     }
//   };
// }

/*
 * This function creates a parser that matches any single character
 * present in the given set of characters.
 */
// function matchAnyChar(characterSet) {
//   // Create a lookup map for efficient character checking.
//   let validCharactersMap = {};
//   for (let singleChar of characterSet) {
//     validCharactersMap[singleChar] = singleChar;
//   }
//   // Return the character matching parser.
//   return (inputString, currentIdx) => {
//     // Extract the character at the current index.
//     const currentChar = inputString.substr(currentIdx, 1);
//     // Check if the character is in our valid set.
//     if (validCharactersMap[currentChar]) {
//       // If it is, return success with the character and the new position.
//       return [true, currentChar, currentIdx + 1];
//     } else {
//       // Otherwise, return failure.
//       return [false, null, currentIdx];
//     }
//   };
// }

/*
 * This immediately-invoked function expression (IIFE) processes input
 * from stdin, attempting to parse and evaluate logical formulas.
 */
// (inputDataStream => {
//   // Define the main parser for logical formulas using lazy evaluation for recursion.
//   const expressionParser = deferredParser(() => {
//     // Parser for AND operations: (formula * formula)
//     const conjunctionParser = transformResult(sequenceOf(lexicalUnit('('), expressionParser, lexicalUnit('*'), expressionParser, lexicalUnit(')')), parsedItems => {
//       return { operator: '*', operands: [parsedItems[1], parsedItems[3]] };
//     });
//     // Parser for OR operations: (formula + formula)
//     const disjunctionParser = transformResult(sequenceOf(lexicalUnit('('), expressionParser, lexicalUnit('+'), expressionParser, lexicalUnit(')')), parsedItems => {
//       return { operator: '+', operands: [parsedItems[1], parsedItems[3]] };
//     });
//     // Parser for IMPLICATION operations: (formula -> formula)
//     const implicationParser = transformResult(sequenceOf(lexicalUnit('('), expressionParser, lexicalUnit('->'), expressionParser, lexicalUnit(')')), parsedItems => {
//       return { operator: '->', operands: [parsedItems[1], parsedItems[3]] };
//     });
//     // Parser for NOT operations: -formula
//     const negationParser = transformResult(sequenceOf(lexicalUnit('-'), expressionParser), parsedItems => {
//       return { operator: '-', operands: [parsedItems[1]] };
//     });
//     // Parser for atomic values (variables a-k, T, F)
//     const valueParser = transformResult(matchAnyChar('abcdefghijkTF'), matchedChar => { return { value: matchedChar, operands: [] }; });
//     // Combine all formula parsers using choice.
//     return selectOption(conjunctionParser, disjunctionParser, implicationParser, negationParser, valueParser);
//   });

//   // Parser for an entire equation: formula = formula
//   const equalityParser = transformResult(sequenceOf(expressionParser, lexicalUnit('='), expressionParser), parsedItems => {
//     return { leftSide: parsedItems[0], rightSide: parsedItems[2] };
//   });

//   // Process each line from the standard input.
//   inputDataStream.toString().split('\n').forEach(currentLine => {
//     // Exit if the line is '#'.
//     if (currentLine == '#') process.exit(0);
//     // The following code block is commented out in the original,
//     // so it remains commented out here, with identifiers renamed.

//     // const parsingResult = equalityParser(currentLine, 0);
//     // let isTautology = true;
//     // // Iterate through all possible truth assignments for 11 variables (a-k).
//     // for (let truthAssignmentIndex = 0; truthAssignmentIndex < (1 << 11); truthAssignmentIndex++) {
//     //   // Check if the left and right sides of the equation evaluate to the same boolean value.
//     //   isTautology &= evaluateFormula(parsingResult[1].leftSide) === evaluateFormula(parsingResult[1].rightSide);

//     //   // Helper function to convert a character (variable, 'T', 'F') to a boolean.
//     //   function convertToBoolean(charValue) {
//     //     if (charValue === 'T') return true;
//     //     if (charValue === 'F') return false;
//     //     // For variables 'a' through 'k', determine truth value from the current assignment index.
//     //     return !!(truthAssignmentIndex >> (charValue.charCodeAt() - 'a'.charCodeAt()) & 1);
//     //   }

//     //   // Recursive function to evaluate a formula node.
//     //   function evaluateFormula(formulaNode) {
//     //     switch (formulaNode.operands.length) {
//     //       case 0: // Atomic value (variable, T, F)
//     //         return convertToBoolean(formulaNode.value);
//     //       case 1: // Unary operator (NOT)
//     //         return !evaluateFormula(formulaNode.operands[0]);
//     //       case 2: // Binary operators (AND, OR, IMPLICATION)
//     //         switch (formulaNode.operator) {
//     //           case '*': return evaluateFormula(formulaNode.operands[0]) && evaluateFormula(formulaNode.operands[1]);
//     //           case '+': return evaluateFormula(formulaNode.operands[0]) || evaluateFormula(formulaNode.operands[1]);
//     //           case '->': return !evaluateFormula(formulaNode.operands[0]) || evaluateFormula(formulaNode.operands[1]);
//     //         }
//     //     }
//     //   }
//     // }
//     // // Output 'YES' if the equation is a tautology, 'NO' otherwise.
//     // console.log(isTautology ? 'YES' : 'NO');
//   });
// })(require('fs').readFileSync('/dev/stdin', 'utf8'));
