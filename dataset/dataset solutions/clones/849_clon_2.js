'use strict'; /* This directive enforces stricter parsing and error handling */

function atomizer(lexemeFragment) { // A factory function to create parsers for fixed string fragments
  const fragmentLength = lexemeFragment.length; // Store the length of the string to match
  return function (sourceText, currentOffset) { // The actual parser function returned
    // Check if the substring at the current offset matches the target fragment
    return sourceText.slice(currentOffset, currentOffset + fragmentLength) === lexemeFragment
      ? [true, lexemeFragment, currentOffset + fragmentLength] // On success: flag, matched value, new offset
      : [false, null, currentOffset]; // On failure: flag, no value, original offset
  };
}

function alternation() { // A combinator that tries multiple parsers in order
  const potentialParsers = arguments; // Collects all parser functions passed as arguments
  return function (sourceText, currentOffset) { // The combined choice parser
    // Original loop: for (var loopIndex = 0; loopIndex < potentialParsers.length; loopIndex++) {
    for (let currentParser of potentialParsers) { // Iterate through each provided parser
      const parsingOutcome = currentParser(sourceText, currentOffset); // Attempt to parse
      if (parsingOutcome[0]) { // If the parsing attempt was successful (first element is true)
        return parsingOutcome; // Return the successful result immediately
      }
    }
    return [false, null, currentOffset]; // If all parsers fail, return a failure result
  };
}

// Below are additional parser combinator functions, kept as comments as in the original source.

// function sequenceCombinator() { // Combines parsers that must succeed in a specific order
//   const processingUnits = arguments; // Retrieves all parser functions for the sequence
//   return (inputData, startPoint) => { // The sequential parser
//     const collectedResults = []; // Stores the outcomes from each successful parser in the sequence
//     let nextScanPosition = startPoint; // Tracks the position in the input string
//     for (let processingUnit of processingUnits) { // Process each parser in the defined order
//       const individualParseResult = processingUnit(inputData, nextScanPosition); // Apply the current parser
//       if (!individualParseResult[0]) return [false, null, startPoint]; // If any parser fails, the entire sequence fails
//       collectedResults.push(individualParseResult[1]); // Add the parsed value to the collection
//       nextScanPosition = individualParseResult[2]; // Update the scan position for the next parser
//     }
//     return [true, collectedResults, nextScanPosition]; // All parsers succeeded: return success with all results
//   };
// }

// function deferredParser(generatorFunction) { // Creates a parser that is initialized only when first used
//   let actualParserInstance; // Variable to hold the lazily instantiated parser
//   return function (inputData, startPoint) { // The lazy parser wrapper
//     if (!actualParserInstance) actualParserInstance = generatorFunction(); // Initialize the parser if it hasn't been yet
//     return actualParserInstance(inputData, startPoint); // Execute the (now initialized) parser
//   };
// }

// function transformResult(baseParser, transformationFunction) { // Applies a function to the result of another parser
//   return (inputData, startPoint) => { // The result-transforming parser
//     const rawResult = baseParser(inputData, startPoint); // Execute the base parser
//     if (rawResult[0]) { // If the base parser succeeded
//       return [rawResult[0], transformationFunction(rawResult[1]), rawResult[2]]; // Apply the transformation to the parsed value
//     } else {
//       return rawResult; // If the base parser failed, return its failure result unchanged
//     }
//   };
// }

// function characterSetMatcher(allowedCharacters) { // Creates a parser that matches any single character from a given set
//   let charLookupTable = {}; // A hash map for efficient character checking
//   for (let validChar of allowedCharacters) charLookupTable[validChar] = validChar; // Populate the lookup table
//   return (inputData, startPoint) => { // The character set parser
//     const singleCharacter = inputData.slice(startPoint, startPoint + 1); // Extract a single character from the input
//     return charLookupTable[singleCharacter] ? [true, singleCharacter, startPoint + 1] : [false, null, startPoint]; // Check if the character is in the set
//   };
// }

// (inputReader => { // Self-executing function to process input
//   const logicalExpressionParser = deferredParser(() => { // Lazy parser for recursive logical expressions
//     const andOperation = transformResult(sequenceCombinator(atomizer('('), logicalExpressionParser, atomizer('*'), logicalExpressionParser, atomizer(')')), elementArray => {
//       return { operationType: '*', children: [elementArray[1], elementArray[3]] };
//     });
//     const orOperation = transformResult(sequenceCombinator(atomizer('('), logicalExpressionParser, atomizer('+'), logicalExpressionParser, atomizer(')')), elementArray => {
//       return { operationType: '+', children: [elementArray[1], elementArray[3]] };
//     });
//     const implicationOperation = transformResult(sequenceCombinator(atomizer('('), logicalExpressionParser, atomizer('->'), logicalExpressionParser, atomizer(')')), elementArray => {
//       return { operationType: '->', children: [elementArray[1], elementArray[3]] };
//     });
//     const negationOperation = transformResult(sequenceCombinator(atomizer('-'), logicalExpressionParser), elementArray => {
//       return { operationType: '-', children: [elementArray[1]] };
//     });
//     const literalValue = transformResult(characterSetMatcher('abcdefghijkTF'), charValue => { return { literal: charValue, children: [] }; });
//     return alternation(andOperation, orOperation, implicationOperation, negationOperation, literalValue);
//   });
//   const equivalenceStatementParser = transformResult(sequenceCombinator(logicalExpressionParser, atomizer('='), logicalExpressionParser), elementArray => {
//     return { leftOperand: elementArray[0], rightOperand: elementArray[2] };
//   });

//   inputReader.toString().split('\n').forEach(inputLine => {
//     if (inputLine == '#') process.exit(0); // Exit if an end-of-input marker is found
//     // const finalParsingResult = equivalenceStatementParser(inputLine, 0); // Attempt to parse the input line
//     // let overallConsistency = true; // Flag to determine if the statement is always consistent
//     // for (let permutationIndex = 0; permutationIndex < (1 << 11); permutationIndex++) { // Iterate through all possible truth assignments for variables
//     //   overallConsistency &= evaluateLogic(finalParsingResult[1].leftOperand) === evaluateLogic(finalParsingResult[1].rightOperand);
//     //   function convertCharToBool(variableChar) { // Helper function to convert char to boolean value
//     //     if (variableChar === 'T') return true;
//     //     if (variableChar === 'F') return false;
//     //     return !!(permutationIndex >> (variableChar.charCodeAt() - 'a'.charCodeAt()) & 1); // Map 'a' to 'k' to bits
//     //   }
//     //   function evaluateLogic(logicNode) { // Recursive function to evaluate the truth value of a logic expression tree
//     //     switch (logicNode.children.length) {
//     //       case 0: return convertCharToBool(logicNode.literal); // Base case: a literal truth value
//     //       case 1: return !evaluateLogic(logicNode.children[0]); // Unary NOT operation
//     //       case 2:
//     //         switch (logicNode.operationType) { // Binary operations
//     //           case '*': return evaluateLogic(logicNode.children[0]) && evaluateLogic(logicNode.children[1]); // AND
//     //           case '+': return evaluateLogic(logicNode.children[0]) || evaluateLogic(logicNode.children[1]); // OR
//     //           case '->': return !evaluateLogic(logicNode.children[0]) || evaluateLogic(logicNode.children[1]); // IMPLIES (equivalent to !A || B)
//     //         }
//     //     }
//     //   }
//     // }
//     // console.log(overallConsistency ? 'YES' : 'NO'); // Output the final consistency result
//   });
// })(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input using Node.js fs module