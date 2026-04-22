/*
 *  Problem source: http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2570
 *  This file processes symbolic expressions following specific rules.
 *  Current status: Implemented and tested.
 *  Notes: Handles large number calculations with modulo arithmetic.
 */
var outputPrinter = console.log; /* Defines a utility for printing messages to the console. */

if (typeof process !== "undefined") { /* Checks if the current execution environment is Node.js. */
    var rawInputData = ""; /* Initializes an empty string to accumulate incoming data. */
    process.stdin.resume(); /* Ensures the standard input stream remains open. */
    process.stdin.setEncoding('utf8'); /* Sets the encoding for input data to UTF-8. */
    process.stdin.on('data', function (dataSegment) /* Event listener for incoming data chunks. */
    {
        rawInputData += dataSegment; /* Appends each data chunk to the main input string. */
    });
    process.stdin.on('end', function () /* Event listener for the end of the input stream. */
    {
        var inputRows = rawInputData.split("\n"); /* Splits the accumulated input into an array of lines. */
        processAllRows(inputRows); /* Invokes the primary processing function with the parsed lines. */
    });
}


function processAllRows(inputRows) /* Main function to iterate and process each input line. */
{
    inputRows.forEach(function (currentRow) /* Loops through every row provided in the input array. */
    {
        if (currentRow !== "#") /* Skips rows that contain only the '#' character, acting as a sentinel. */
        {
            handleSingleInput(currentRow); /* Processes the current row if it's not a comment/sentinel. */
        }
    });
}

function powerModAccumulator(baseVal, exponentVal) /* Computes (baseVal * exponentVal) % moduloDivisor, optimized for large exponents. */
{
    var moduloDivisor = 1_000_000_007; /* A large prime number used for modulo operations to prevent overflow. */
    if (baseVal > 90_000_000 && exponentVal > 1) /* Optimization for specific large base values and exponents. */
    {
        var remainderFlag = exponentVal % 2; /* Determines if the exponent is odd or even. */
        var halfExponent = Math.floor(exponentVal / 2); /* Divides the exponent by two for recursive calculation. */
        var prevResult = powerModAccumulator(baseVal, halfExponent); /* Recursive call with the halved exponent. */
        if (remainderFlag) /* If the original exponent was odd. */
        {
            var currentSum = (2 * prevResult + baseVal) % moduloDivisor; /* Adjusts the result for the odd exponent. */
        }
        else /* If the original exponent was even. */
        {
            var currentSum = (2 * prevResult) % moduloDivisor; /* Doubles the previous result for the even exponent. */
        }
        return currentSum % moduloDivisor; /* Ensures the final result is within the modulo range. */
    }
    return (baseVal * exponentVal) % moduloDivisor; /* Base case: direct multiplication and modulo for smaller values. */
}


// Calculates S(x) as defined in the problem description, equivalent to x^2 mod D for large x.
function selfPowerMod(operandValue)
{
    return powerModAccumulator(operandValue, operandValue); /* Calls the recursive modulo function with operandValue as both base and exponent. */
}

// Computes floor(x / (2^y)), effectively a right bit shift.
function floorDivisionPowerTwo(dividendVal, shifterVal)
{
    return Math.floor(dividendVal / Math.pow(2, shifterVal)); /* Divides dividend by 2 raised to the power of shifterVal, then floors. */
}

// Cleans the input string by removing all whitespace and 'S' characters.
function stripCharsAndSpaces(rawString)
{
    return rawString.replace(/\s|S/g, ''); /* Uses a regular expression to remove all whitespace characters and 'S'. */
}

// Determines if a given string element represents a numeric value.
function checkIfNumeral(elementEntry)
{
    var numericForm = Number(elementEntry); /* Attempts to convert the element to a number. */
    var stringForm = numericForm.toString(); /* Converts the numeric form back to a string. */
    // Returns true if the conversion was successful (not NaN).
    return Boolean(stringForm !== "NaN"); /* Checks if the string representation is not "NaN", indicating a valid number. */
}

// Divides the initial string into numeric literals and operator characters.
function splitByLiteralsAndOperators(inputString)
{
    inputString = inputString.split(''); /* Converts the input string into an array of individual characters. */
    var dataLength = inputString.length; /* Stores the total number of characters in the array. */
    var segmentStartIdx = 0; /* Index marking the beginning of a potential numeric segment. */
    var segmentEndIdx = 0; /* Index marking the end of a potential numeric segment. */
    var intermediateTokens = []; /* Array to store the parsed numbers and operators. */
    var currentlyParsingNumber = false; /* Flag to track if the parser is currently inside a number sequence. */
    for (var charIndex = 0; charIndex < dataLength; charIndex++) /* Iterates through each character of the input string. */
    {
        var elementItem = inputString[charIndex]; /* Gets the current character. */
        if (!currentlyParsingNumber && checkIfNumeral(elementItem)) /* If not currently parsing a number and the character is a digit. */
        {
            segmentStartIdx = charIndex; /* Marks the start of a new numeric segment. */
            currentlyParsingNumber = true; /* Sets the flag to indicate parsing a number. */
        }
        else if (currentlyParsingNumber && !checkIfNumeral(elementItem)) /* If currently parsing a number but the character is not a digit. */
        {
            segmentEndIdx = charIndex; /* Marks the end of the current numeric segment. */
            currentlyParsingNumber = false; /* Resets the flag as the number sequence has ended. */
            var subArray = inputString.slice(segmentStartIdx, segmentEndIdx); /* Extracts the characters forming the number. */
            var numberString = subArray.join(''); /* Joins the characters back into a string. */
            var parsedNumber = Number(numberString); /* Converts the string into a numeric value. */
            intermediateTokens.push(parsedNumber); /* Adds the parsed number to the tokens array. */
        }
        if (!checkIfNumeral(elementItem)) /* If the current character is not a digit (it's an operator). */
        {
            intermediateTokens.push(elementItem); /* Adds the operator character directly to the tokens array. */
        }
    }
    // After the loop, check if a number was being parsed at the very end of the string.
    if (currentlyParsingNumber) /* If the input ended while a number was being parsed. */
    {
        segmentEndIdx = dataLength; /* The end of the number is the end of the string. */
        var subArray = inputString.slice(segmentStartIdx, segmentEndIdx); /* Extracts the final numeric segment. */
        var numberString = subArray.join(''); /* Joins characters to form the number string. */
        var parsedNumber = Number(numberString); /* Converts to a number. */
        intermediateTokens.push(parsedNumber); /* Adds the last number to the tokens. */
    }
    return intermediateTokens; /* Returns the array of numbers and operators. */
}

// Helper function to distinguish between a single '>' and '>>' operator.
function checkIsSingleClosing(currentIdx, tokenSequence)
{
    var resultFlag = true; /* Assumes it's a single closing bracket by default. */
    if (tokenSequence[currentIdx + 1] === '>') /* Checks if the next character is also '>'. */
    {
        // If the next token after '>>' is a number or '<', it's part of '>>', not a single '>'.
        // Original logic: if (is_number(line[i + 2]) || line[i + 2] == '<') then it's 't' (>>), so ret=false
        if (checkIfNumeral(tokenSequence[currentIdx + 2]) || tokenSequence[currentIdx + 2] === '<')
        {
            // It's part of a '>>' operator, so it's NOT a single closing bracket.
            resultFlag = false; /* Sets flag to false if it's a '>>' operator. */
        }
    }
    return resultFlag; /* Returns whether it's a single closing bracket. */
}

// Converts the parsed characters and numbers into a standardized token sequence.
// 'p' for '<', 'q' for single '>', 't' for '>>'.
function symbolicTokenize(charAndNumberSequence)
{
    // The original code declared q_start and q_end but never used them.
    // To strictly maintain the number of statements, we re-declare them with new names.
    var openBracketPos = 0; /* Placeholder variable, not actively used in this function's logic. */
    var closeBracketPos = 0; /* Another placeholder variable, unused. */

    var finalTokenSequence = []; /* Array to store the standardized tokens. */

    var sequenceLength = charAndNumberSequence.length; /* Length of the input sequence. */
    for (var currentIdx = 0; currentIdx < sequenceLength; currentIdx++) /* Iterates through each element. */
    {
        var elementItem = charAndNumberSequence[currentIdx]; /* Current element being processed. */
        if (checkIfNumeral(elementItem)) /* If the element is a number. */
        {
            finalTokenSequence.push(elementItem); /* Adds the number directly. */
        }
        else if (elementItem === '<') /* If the element is an opening bracket. */
        {
            finalTokenSequence.push('p'); /* Replaces '<' with 'p'. */
        }
        else if (elementItem === '>') /* If the element is a closing bracket. */
        {
            if (checkIsSingleClosing(currentIdx, charAndNumberSequence)) /* Checks if it's a single closing bracket or part of '>>'. */
            {
                finalTokenSequence.push('q'); /* Replaces single '>' with 'q'. */
            }
            else /* It's part of a '>>' operator. */
            {
                finalTokenSequence.push('t'); /* Replaces '>>' with 't'. */
                currentIdx += 1; /* Increments index to skip the second '>' character. */
            }
        }
    }

    return finalTokenSequence; /* Returns the array of standardized tokens. */
}

// Evaluates the token sequence by applying operations based on 'p', 'q', 't' symbols.
function reduceTokens(tokenSequence)
{
    var sequenceLength = tokenSequence.length; /* Gets the initial length of the token sequence. */
    var processingIndex = 0; /* Iterator for traversing the sequence. */
    while (tokenSequence.length > 1) /* Continues as long as there's more than one token to process. */
    {
        var currentElement = tokenSequence[processingIndex]; /* Gets the current element. */
        if (checkIfNumeral(currentElement)) /* If the current element is a number. */
        {
            // Check for 't' (>> operator) immediately preceding a number.
            if (processingIndex > 0 && tokenSequence[processingIndex - 1] === 't')
            {
                // Apply the 't' operation: T(operand1, operand2) where operand1 is at [idx-2] and operand2 is current.
                tokenSequence[processingIndex - 2] = floorDivisionPowerTwo(tokenSequence[processingIndex - 2], tokenSequence[processingIndex]);
                tokenSequence.splice(processingIndex - 1, 2); /* Removes the 't' and the second operand. */
                processingIndex = processingIndex - 3; /* Adjusts index to re-evaluate the new element and potentially previous elements. */
            }
        }
        else if (currentElement === 'p') /* If the current element is a 'p' (opening bracket). */
        {
            // 'p' tokens mark the start of an S<x> expression but are primarily handled by 'q'.
            // No direct operation on 'p' itself, it waits for its matching 'q'.
        }
        else if (currentElement === 'q') /* If the current element is a 'q' (closing bracket for S<x>). */
        {
            // Apply the 'q' operation: S(operand) where operand is at [idx-1].
            tokenSequence[processingIndex - 2] = selfPowerMod(tokenSequence[processingIndex - 1]);
            tokenSequence.splice(processingIndex - 1, 2); /* Removes 'p' and the operand. */
            processingIndex = processingIndex - 3; /* Adjusts index after reduction. */
        }
        else if (currentElement === 't') /* If the current element is a 't' (right shift operator). */
        {
            // 't' tokens are handled when a number follows them. No direct action here.
        }
        processingIndex++; /* Moves to the next element. */
        // outputPrinter(tokenSequence); // Debugging line, commented out for final output.
    }
    return tokenSequence; /* Returns the final reduced token sequence (should contain a single number). */
}

// Orchestrates the complete processing pipeline for a single input line.
function handleSingleInput(initialRow)
{
    var processingData = stripCharsAndSpaces(initialRow); /* Step 1: Clean the input string. */
    if (!processingData) { outputPrinter(''); return; } /* If empty after cleaning, print empty and exit. */

    processingData = splitByLiteralsAndOperators(processingData); /* Step 2: Split into numbers and operators. */
    if (!processingData) { outputPrinter(''); return; } /* If empty, print empty and exit. */

    processingData = symbolicTokenize(processingData); /* Step 3: Convert operators to symbolic tokens ('p', 'q', 't'). */
    if (!processingData) { outputPrinter(''); return; } /* If empty, print empty and exit. */

    processingData = reduceTokens(processingData); /* Step 4: Evaluate the token sequence. */
    if (!processingData) { outputPrinter(''); return; } /* If empty, print empty and exit. */

    var finalResult = processingData[0]; /* The final result should be the single remaining element. */
    if (!finalResult) { outputPrinter(''); return; } /* If the final result is falsy (e.g., 0, undefined, null), print empty string. */

    outputPrinter(finalResult); /* Print the calculated final result. */
}