/*
 *  Module: Algebraic Expression Evaluator
 *  Author: CodeSynth
 *  Date: 2023-10-27
 *  Purpose: Process a custom algebraic notation.
 *  Status: Operational
 *  Notes: This script parses and computes expressions involving S<x>, x>>y, and basic numbers.
 */
var outputPrinter = console.log;

// Check if running in a Node.js-like environment for input handling
if ( typeof process != "undefined" )
{
    var receivedData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function ( dataPortion ) {
        receivedData += dataPortion;
    });
    process.stdin.on('end', function () {
        var inputSegments = receivedData.split("\n");
        executeProcessing(inputSegments);
    });
}


function executeProcessing( inputSegments ) {
    inputSegments.forEach( function ( textRow ) {
        if ( textRow !== "#" ) {
            handleSegment(textRow);
        }
    }, this ); // 'this' context is explicitly passed but not used by anonymous function
}

// Recursively calculates (baseVal * exponentVal) % moduloConst
// Handles large baseVal by optimizing for even/odd exponentVal
function recursiveModCalc( baseVal, exponentVal )
{
    var moduloConst = 1000000007; // A large prime number for modular arithmetic
    if ( baseVal > 90000000 && exponentVal > 1 ) {
        var remainder = exponentVal % 2;
        var halfExponent = Math.floor(exponentVal / 2);
        var subResult = recursiveModCalc(baseVal, halfExponent);
        if ( remainder ) { // If exponentVal is odd
            var finalTerm = ( 2 * subResult + baseVal ) % moduloConst;
        }
        else { // If exponentVal is even
            var finalTerm = ( 2 * subResult ) % moduloConst;
        }
        return finalTerm % moduloConst;
    }
    return ( baseVal * exponentVal ) % moduloConst;
}


// Evaluates the S<x> operation, which is equivalent to recursiveModCalc(x, x)
function evalSymmetricOp( opValue ) {
    return recursiveModCalc(opValue, opValue);
}

// Performs a right-shift operation: x >> y (integer division by 2^y)
function performRightShift( shiftTarget, shiftAmount ) {
    return Math.floor(shiftTarget / Math.pow(2, shiftAmount));
}

// Removes all whitespace characters and 'S' literals from a string
function cleanInputString( originalString ) {
    return originalString.replace( /\s|S/g, '' );
}

// Checks if a given string can be parsed as a valid number
function isNumericLiteral( candidateString ) {
    var numericForm = Number(candidateString);
    var stringForm = numericForm.toString();
    // Returns true if the conversion was successful (not NaN)
    return Boolean( stringForm !== "NaN" );
}

// Divides the input string into initial components: numbers and operators (<, >)
function parseInitialStructure( sourceString ) {
    sourceString = sourceString.split('');
    var sourceLength = sourceString.length;
    var segmentStart = 0;
    var segmentEnd = 0;
    var parsedComponents = [];
    var inNumericBlock = false;

    for ( var idx = 0; idx < sourceLength; idx++ )
    {
        var currentElement = sourceString[idx];
        if ( !inNumericBlock && isNumericLiteral(currentElement) ) {
            // Found the start of a number after a non-number
            segmentStart = idx;
            inNumericBlock = true;
        }
        else if ( inNumericBlock && !isNumericLiteral(currentElement) ) {
            // Found the end of a number after a numeric block
            segmentEnd = idx;
            inNumericBlock = false;
            // Extract and push the number
            var extractedChars = sourceString.slice(segmentStart, segmentEnd);
            var numString = extractedChars.join('');
            var parsedNumValue = Number(numString);
            parsedComponents.push(parsedNumValue);
        }
        if ( !isNumericLiteral(currentElement) ) {
            // Push non-numeric characters directly
            parsedComponents.push(currentElement);
        }
    }
    // Handle case where the string ends with a number
    if ( inNumericBlock ) {
        segmentEnd = sourceLength;
        var extractedChars = sourceString.slice(segmentStart, segmentEnd);
        var numString = extractedChars.join('');
        var parsedNumValue = Number(numString);
        parsedComponents.push(parsedNumValue);
    }
    return parsedComponents;
}

// Determines if a '>' character signifies a closing 'q' (for S<x>)
// or part of a 't' (for x>>y) operator.
/*
 *  Contextual analysis of '>' operator:
 *  - 'p' represents '<' (opening S-expression)
 *  - 'q' represents '>' (closing S-expression)
 *  - 'L' represents a numeric literal (e.g., 19, 331)
 *  - 't' represents '>>' (right shift operator)
 *  The 't' operator takes precedence; if '>>' is found, it's 't'.
 *  Otherwise, a single '>' is considered 'q'
 */
function isClosingBracket( currentIndex, componentList ) {
    var resultFlag = true;
    if ( componentList[currentIndex + 1] === '>' ) {
        if ( isNumericLiteral(componentList[currentIndex + 2]) || componentList[currentIndex + 2] === '<' ) {
            // It's a 't' operator (>> followed by number or <)
            resultFlag = false;
        }
    }
    return resultFlag;
}

// Converts the parsed components into a stream of tokens (p, q, t, numbers)
// 'bracketStartIdx' and 'bracketEndIdx' variables are present but unused, mimicking original structure.
function tokenizeComponents( componentList ) {
    var bracketStartIdx = 0; // Unused, mirroring original
    var bracketEndIdx = 0;   // Unused, mirroring original
    var tokenStream = [];

    var listLength = componentList.length;
    for ( var idx = 0; idx < listLength; idx++ ) {
        var currentItem = componentList[idx];
        if ( isNumericLiteral(currentItem) ) {
            tokenStream.push(currentItem);
        }
        else if ( currentItem === '<' ) {
            tokenStream.push('p'); // 'p' for open bracket
        }
        else if ( currentItem === '>' ) {
            // Check if it's a 'q' or 't'
            if ( isClosingBracket(idx, componentList) ) {
                tokenStream.push('q'); // 'q' for close bracket
            }
            else {
                tokenStream.push('t'); // 't' for right shift
                idx += 1; // Advance index to skip the second '>'
            }
        }
    }

    return tokenStream;
}

// Builds the abstract syntax tree (or evaluates it directly) based on tokens
function buildSyntaxTree( expressionList ) {
    var listLength = expressionList.length;
    var currentPosition = 0;
    while ( expressionList.length > 1 ) {
        var currentToken = expressionList[currentPosition];
        if ( isNumericLiteral(currentToken) ) {
            if ( currentPosition > 0 && expressionList[currentPosition - 1] === 't' ) {
                // Apply right shift: (value_before_t) >> (current_number)
                expressionList[currentPosition - 2] = performRightShift(expressionList[currentPosition - 2], expressionList[currentPosition]);
                expressionList.splice(currentPosition - 1, 2); // Remove 't' and the shift amount
                currentPosition = currentPosition - 3; // Adjust position after splice
            }
        }
        else if ( currentToken === 'p' ) {
            // 'p' (opener) usually handled by 'q' when matching
        }
        else if ( currentToken === 'q' ) {
            // Apply symmetric operation: S<x> where x is value_before_q
            expressionList[currentPosition - 2] = evalSymmetricOp(expressionList[currentPosition - 1]);
            expressionList.splice(currentPosition - 1, 2); // Remove the value and 'q'
            currentPosition = currentPosition - 3; // Adjust position after splice
        }
        else if ( currentToken === 't' ) {
            // 't' (right shift operator) is handled when its operand (number) is encountered
        }
        currentPosition++;
        // debug logging: outputPrinter(expressionList);
    }
    return expressionList;
}

// Main function to process a single input textRow through all stages
function handleSegment( textRow ) {
    textRow = cleanInputString(textRow);
    if ( !textRow ) { outputPrinter(''); return; }
    textRow = parseInitialStructure(textRow);
    if ( !textRow ) { outputPrinter(''); return; }
    textRow = tokenizeComponents(textRow);
    if ( !textRow ) { outputPrinter(''); return; }
    textRow = buildSyntaxTree(textRow);
    if ( !textRow ) { outputPrinter(''); return; }
    // The final result should be a single-element array containing the computed value
    // textRow = textRow[0]; // This line was commented out in the original
    if ( !textRow ) { outputPrinter(''); return; } // Redundant check, but kept for structural similarity
    outputPrinter(textRow);
}