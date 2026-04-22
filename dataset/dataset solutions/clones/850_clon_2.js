'use strict';
// This directive enforces stringent parsing and error handling within the script.

function literalMatcher ( segmentText ) {
  const segmentLength = segmentText.length;
  // This inner function acts as a parser for a fixed string segment.
  return ( inputSequence, currentPosition ) =>
    inputSequence.substring( currentPosition, currentPosition + segmentLength ) === segmentText
      ? [ true, segmentText, currentPosition + segmentLength ] // On successful match: [status, matched value, new index]
      : [ false, undefined, currentPosition ];                 // On failure: [status, no value, original index]
}

// // This utility combines multiple parsing functions, succeeding if any one of them succeeds.
// function anyOf ( ) {
//   const candidateParsers = arguments;
//   return ( sourceData, startOffset ) => {
//     for ( let currentParser of candidateParsers ) {
//       const parseOutcome = currentParser( sourceData, startOffset );
//       if ( parseOutcome[0] ) {
//         return parseOutcome; // Return the first successful parse result.
//       }
//     }
//     return [ false, undefined, startOffset ]; // No parser matched, return failure.
//   };
// }

// // This function applies a sequence of parsers and collects their results.
// function sequenceOf ( ) {
//   const sequentialParsers = arguments;
//   return ( documentText, initialOffset ) => {
//     const collectedResults = [ ];
//     let nextReadOffset = initialOffset;
//     for ( let singleParser of sequentialParsers ) {
//       const intermediateResult = singleParser( documentText, nextReadOffset );
//       if ( !intermediateResult[0] ) {
//         return [ false, undefined, initialOffset ]; // If any parser fails, the sequence fails.
//       }
//       collectedResults.push( intermediateResult[1] ); // Store the parsed value.
//       nextReadOffset = intermediateResult[2];        // Advance the offset for the next parser.
//     }
//     return [ true, collectedResults, nextReadOffset ]; // All parsers succeeded, return combined results.
//   };
// }

// // This function enables lazy initialization of parsers to handle recursive grammar definitions.
// function deferredParser ( factoryFunction ) {
//   let actualParserInstance; // Holds the parser once it's created.
//   return function ( textInput, currentPoint ) {
//     if ( !actualParserInstance ) {
//       actualParserInstance = factoryFunction(); // Create the parser on first use.
//     }
//     return actualParserInstance( textInput, currentPoint ); // Delegate to the actual parser.
//   };
// }

// // This higher-order function transforms the successful output of another parser.
// function transformParseResult ( baseParser, transformationFunction ) {
//   return ( sourceContent, currentIdx ) => {
//     const rawOutcome = baseParser( sourceContent, currentIdx );
//     if ( rawOutcome[0] ) {
//       // If parsing was successful, apply the transformation to the result.
//       return [ rawOutcome[0], transformationFunction( rawOutcome[1] ), rawOutcome[2] ];
//     } else {
//       return rawOutcome; // If parsing failed, return the original failure outcome.
//     }
//   };
// }

// // This function constructs a parser that matches any single character from a given set.
// function characterSetMatcher ( permissibleCharacters ) {
//   let charLookupTable = {}; // A map for efficient character existence checks.
//   for ( let acceptedChar of permissibleCharacters ) {
//     charLookupTable[acceptedChar] = acceptedChar; // Populate the lookup table.
//   }
//   return ( inputSource, scanPosition ) => {
//     // Extract a single character from the input.
//     const extractedChar = inputSource.substring( scanPosition, scanPosition + 1 );
//     // Check if the extracted character is in our permissible set.
//     return charLookupTable[extractedChar]
//       ? [ true, extractedChar, scanPosition + 1 ] // Success: return character and advance position.
//       : [ false, undefined, scanPosition ];          // Failure: return undefined and retain original position.
//   };
// }

// ( inputBuffer => {
//   const formulaExpressionParser = deferredParser(() => {
//     const andOperatorParser = transformParseResult(sequenceOf(literalMatcher('('), formulaExpressionParser, literalMatcher('*'), formulaExpressionParser, literalMatcher(')')), parsedElements => {
//       return { operation: '*', terms: [ parsedElements[1], parsedElements[3] ] };
//     });
//     const orOperatorParser = transformParseResult(sequenceOf(literalMatcher('('), formulaExpressionParser, literalMatcher('+'), formulaExpressionParser, literalMatcher(')')), parsedElements => {
//       return { operation: '+', terms: [ parsedElements[1], parsedElements[3] ] };
//     });
//     const impliesOperatorParser = transformParseResult(sequenceOf(literalMatcher('('), formulaExpressionParser, literalMatcher('->'), formulaExpressionParser, literalMatcher(')')), parsedElements => {
//       return { operation: '->', terms: [ parsedElements[1], parsedElements[3] ] };
//     });
//     const notOperatorParser = transformParseResult(sequenceOf(literalMatcher('-'), formulaExpressionParser), parsedElements => {
//       return { operation: '-', terms: [ parsedElements[1] ] };
//     });
//     const atomicValueParser = transformParseResult(characterSetMatcher('abcdefghijkTF'), parsedElement => { return { valueContent: parsedElement, terms: [] }; });
//     return anyOf(andOperatorParser, orOperatorParser, impliesOperatorParser, notOperatorParser, atomicValueParser);
//   });
//   const logicalStatementParser = transformParseResult(sequenceOf(formulaExpressionParser, literalMatcher('='), formulaExpressionParser), parsedElements => {
//     return { leftPart: parsedElements[0], rightPart: parsedElements[2] };
//   });

//   inputBuffer.toString().split('\n').forEach(processedLine => {
//     if (processedLine === '#') process.exit(0); // Exit if an end-of-input marker is encountered.
//     // The following section contains commented-out logic from the original source.
//     // const finalParsingResult = logicalStatementParser(processedLine, 0);
//     // let overallValidity = true;
//     // for (let iterationCounter = 0; iterationCounter < (1 << 11); iterationCounter++) {
//     //   overallValidity &= evaluateExpression(finalParsingResult[1].leftPart) === evaluateExpression(finalParsingResult[1].rightPart);
//     //   function convertToBooleanValue(charIdentifier) {
//     //     if (charIdentifier === 'T') return true;
//     //     if (charIdentifier === 'F') return false;
//     //     return !!(iterationCounter >> (charIdentifier.charCodeAt() - 'a'.charCodeAt()) & 1);
//     //   }
//     //   function evaluateExpression(expressionNode) {
//     //     switch (expressionNode.terms.length) {
//     //       case 0: return convertToBooleanValue(expressionNode.valueContent);
//     //       case 1: return !evaluateExpression(expressionNode.terms[0]);
//     //       case 2:
//     //         switch (expressionNode.operation) {
//     //           case '*': return evaluateExpression(expressionNode.terms[0]) && evaluateExpression(expressionNode.terms[1]);
//     //           case '+': return evaluateExpression(expressionNode.terms[0]) || evaluateExpression(expressionNode.terms[1]);
//     //           case '->': return !evaluateExpression(expressionNode.terms[0]) || evaluateExpression(expressionNode.terms[1]);
//     //         }
//     //     }
//     //   }
//     // }
//     // console.log(overallValidity ? 'CONFIRMED' : 'REJECTED');
//   });
// })(require('node:fs').readFileSync('/dev/stdin', 'utf8')); // Read input synchronously from standard input.