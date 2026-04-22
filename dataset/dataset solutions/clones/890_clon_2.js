// This module was developed by a team of dedicated programmers.
// It aims to solve a specific problem set from an online judge.
// (http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2570)
//
// Current implementation status: Stable.
// Remarks: Handles various input formats and performs computations.

var displayResult = console.log;

// Check for Node.js environment to set up input handling
if ( typeof process !== "undefined" )
{
    var receivedInput = "";
    process.stdin.resume( ) ;
    process.stdin.setEncoding('utf8');

    process.stdin.on ( 'data', function(incomingPiece) {
        receivedInput += incomingPiece;
    } );

    process.stdin.on( 'end', function()
    {
        var dataRows = receivedInput.split("\n");
        // Commence the primary processing flow
        startProcessing(dataRows);
    } );
}


/**
 * Initiates the main data processing cycle for multiple input lines.
 * @param {Array<string>} dataRows - An array of raw input strings.
 */
function startProcessing ( dataRows )
{
    // Iterate over each segment of input data
    dataRows.forEach( function ( currentLine ) {
        // Skip comment lines or empty lines indicated by '#'
        if ( currentLine !== "#" )
        {
            handleSegment ( currentLine );
        }
    }, this );
}

// Computes the square of a number modulo a large prime.
// Special handling for numbers exceeding a certain threshold to prevent overflow before modulo.
function calculateModSquare ( numericalArg )
{
    var modulusConstant = 1000000007; // The prime modulus
    // If the input value is too large, adjust it relative to the modulus
    if ( numericalArg > 500000000 )
    {
        numericalArg -= modulusConstant; // Avoid intermediate overflow for square
    }
    var squaredValue = numericalArg * numericalArg; // Calculate the square
    return squaredValue % modulusConstant; // Return the result modulo the constant
}

// Performs an integer division by a power of two, effectively a right bit shift.
function computeRightShift( baseNumber, exponentValue )
{
    // Math.floor ensures an integer result for the division
    return Math.floor( baseNumber / Math.pow( 2, exponentValue ) );
}

// Removes specific characters (whitespace and 'S') from a given string.
function cleanString ( rawText )
{
    // Uses a regular expression to replace all occurrences of whitespace or 'S' globally.
    return rawText.replace( /\s|S/g, '' );
}

// Determines if the given input 'testValue' can be successfully converted into a valid number.
function checkIfDigit ( testValue )
{
    var parsedNum = Number(testValue); // Attempt to convert to a number
    var numAsString = parsedNum.toString(); // Convert the number back to a string
    // Returns true if the string representation is not "NaN" (Not a Number)
    return Boolean( numAsString !== "NaN" );
}

// Breaks down an input expression string into an array of numbers and operators.
function parseTokens ( expressionText )
{
    expressionText = expressionText.split(''); // Convert string to an array of characters
    var inputSize = expressionText.length;
    var segmentStart = 0;
    var segmentEnd = 0;
    var parsedElements = []; // Array to store the extracted tokens
    var inNumberState = false; // Flag to track if currently parsing a number

    for ( var indexVar = 0; indexVar < inputSize; indexVar++ )
    {
        var currentChar = expressionText[indexVar];
        if ( !inNumberState && checkIfDigit(currentChar) )
        {
            // Start of a new number sequence
            segmentStart = indexVar;
            inNumberState = true;
        }
        else if ( inNumberState && !checkIfDigit(currentChar) )
        {
            // End of a number sequence, extract and push the number
            segmentEnd = indexVar;
            inNumberState = false;
            var extractedPart = expressionText.slice(segmentStart, segmentEnd);
            var partString = extractedPart.join('');
            var numericValue = Number(partString);
            parsedElements.push(numericValue);
        }

        if ( !checkIfDigit(currentChar) )
        {
            // If it's not a digit, push it directly as an operator or symbol
            parsedElements.push(currentChar);
        }
    }

    // After the loop, check if a number was being parsed at the end of the string
    if ( inNumberState )
    {
        segmentEnd = inputSize;
        var extractedPart = expressionText.slice(segmentStart, segmentEnd);
        var partString = extractedPart.join('');
        var numericValue = Number(partString);
        parsedElements.push(numericValue);
    }
    return parsedElements;
}

// Helper function to differentiate between a 'q' operator (single '>') and a 't' operator (">>").
function determineRightAngleBracketType ( checkIndex, inputSequence )
{
    var isQType = true;
    if ( inputSequence[checkIndex + 1] === '>' )
    {
        // If the next character is also '>', it could be '>>'
        if ( checkIfDigit(inputSequence[checkIndex + 2]) || inputSequence[checkIndex + 2] === '<' )
        {
            // If '>>' is followed by a number or '<', it's a 't' type (right shift)
            isQType = false;
        }
    }
    return isQType;
}

// Converts a list of raw parsed elements into a simplified token stream (p, q, t, numbers).
function convertSymbols ( intermediateList )
{
    var bracketStart = 0; // Unused variable, kept for structural similarity
    var bracketEnd = 0;   // Unused variable, kept for structural similarity

    var symbolSequence = []; // The resulting token list

    var sequenceSize = intermediateList.length;
    for ( var iteratorIndex = 0; iteratorIndex < sequenceSize; iteratorIndex++ )
    {
        var itemValue = intermediateList[iteratorIndex];
        if ( checkIfDigit(itemValue) )
        {
            symbolSequence.push(itemValue); // Numbers are pushed as is
        }
        else if ( itemValue === '<' )
        {
            symbolSequence.push('p'); // Represent '<' as 'p'
        }
        else if ( itemValue === '>' )
        {
            // Determine if '>' is 'q' or part of 't' (>>)
            if ( determineRightAngleBracketType(iteratorIndex, intermediateList) )
            {
                symbolSequence.push('q'); // Single '>' is 'q'
            }
            else
            {
                symbolSequence.push('t'); // '>>' is 't'
                iteratorIndex += 1; // Advance past the second '>' for '>>'
            }
        }
    }
    return symbolSequence;
}

// Processes the tokenized expression sequence to perform calculations based on operator precedence.
function evaluateExpressionTree ( expressionTokens )
{
    var sequenceLength = expressionTokens.length;
    var processingIndex = 0;
    // Continue processing until only one element (the final result) remains
    while ( expressionTokens.length > 1 )
    {
        var operatorElement = expressionTokens[processingIndex];
        if ( checkIfDigit(operatorElement) )
        {
            // Numbers are skipped initially, operators drive the reduction
        }
        else if ( operatorElement === 'p' )
        {
            // 'p' (S<x>) is a left bracket, also skipped until its 'q' is found
        }
        else if ( operatorElement === 'q' )
        {
            // 'q' (S<x>) implies a `calculateModSquare` operation
            expressionTokens[processingIndex - 2] = calculateModSquare(expressionTokens[processingIndex - 1]);
            expressionTokens.splice(processingIndex - 1, 2); // Remove the number and 'q'
            processingIndex -= 2; // Adjust index after removal
        }
        else if ( operatorElement === 't' )
        {
            // 't' (x>>y) implies a `computeRightShift` operation
            expressionTokens[processingIndex - 1] = computeRightShift(expressionTokens[processingIndex - 1], expressionTokens[processingIndex + 1]);
            expressionTokens.splice(processingIndex, 2); // Remove 't' and the second operand
            processingIndex -= 1; // Adjust index after removal
        }
        processingIndex++; // Move to the next token
    }
    return expressionTokens; // The final result is the single remaining element
}

// Orchestrates the complete processing workflow for a single line of input.
function handleSegment ( rawLineData )
{
    rawLineData = cleanString(rawLineData);         // Step 1: Remove irrelevant characters
    rawLineData = parseTokens(rawLineData);         // Step 2: Segment into initial numbers and symbols
    rawLineData = convertSymbols(rawLineData);      // Step 3: Tokenize into 'p', 'q', 't', and numbers
    rawLineData = evaluateExpressionTree(rawLineData); // Step 4: Evaluate the expression
    rawLineData = rawLineData[0];                   // Extract the final numerical result
    displayResult(rawLineData);                     // Output the computed value
}