var log = console.log;
if (typeof process != "undefined") {
    var inputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        inputBuffer += chunk;
    });
    process.stdin.on('end', function() {
        var inputLines = inputBuffer.split("\n");
        mainProcessor(inputLines);
    });
}

function mainProcessor(inputLines) {
    for (const currentLine of inputLines) {
        if (currentLine === "#") {
            continue; // Guard clause: skip processing if line is just '#'
        }
        processInputLine(currentLine);
    }
}

// Computes S(x) = (x * x) % 1000000007, with overflow adjustment
function computeSquareModulo(inputValue) {
    const moduloConstant = 1000000007;
    const overflowThreshold = 500000000;
    let adjustedValue = inputValue;

    if (adjustedValue > overflowThreshold) {
        adjustedValue -= moduloConstant;
    }

    const squaredValue = adjustedValue * adjustedValue;
    return squaredValue % moduloConstant;
}

// Computes T(x, y) = floor(x / (2^y))
function performRightShiftDivision(dividend, shiftAmount) {
    const divisorPowerOfTwo = Math.pow(2, shiftAmount);
    return Math.floor(dividend / divisorPowerOfTwo);
}

// Removes 'S' characters and whitespace from a string
function cleanInputString(rawString) {
    return rawString.replace(/\s|S/g, '');
}

// Checks if a given token can be converted to a valid number
function isNumericToken(tokenValue) {
    const numericConversion = Number(tokenValue);
    return !isNaN(numericConversion);
}

// Helper function to parse and push a number segment
function pushNumberSegment(sourceArray, startIndex, endIndex, targetArray) {
    const numberChars = sourceArray.slice(startIndex, endIndex);
    const numberString = numberChars.join('');
    const parsedNumber = Number(numberString);
    targetArray.push(parsedNumber);
}

// Divides the input string into numbers and single characters (operators)
function segmentInputTokens(inputString) {
    const charArray = inputString.split('');
    const arrayLength = charArray.length;
    const processedTokens = [];
    let segmentStartIdx = 0;
    let isCurrentlyParsingNumber = false;

    for (let i = 0; i < arrayLength; i++) {
        const currentChar = charArray[i];
        const charIsNumeric = isNumericToken(currentChar);

        if (!isCurrentlyParsingNumber && charIsNumeric) {
            segmentStartIdx = i;
            isCurrentlyParsingNumber = true;
        } else if (isCurrentlyParsingNumber && !charIsNumeric) {
            pushNumberSegment(charArray, segmentStartIdx, i, processedTokens);
            isCurrentlyParsingNumber = false;
        }

        if (!charIsNumeric) {
            processedTokens.push(currentChar);
        }
    }

    if (isCurrentlyParsingNumber) {
        pushNumberSegment(charArray, segmentStartIdx, arrayLength, processedTokens);
    }
    return processedTokens;
}

// Determines if a '>' character is a single '>' (q) or part of a '>>' (t)
function isSingleGreaterThan(currentIndex, tokenSequence) {
    let isQToken = true;
    const nextToken = tokenSequence[currentIndex + 1];
    const tokenAfterNext = tokenSequence[currentIndex + 2];

    if (nextToken === '>') {
        // If it's '>>', it's 't' if followed by a number or '<'
        if (isNumericToken(tokenAfterNext) || tokenAfterNext === '<') {
            isQToken = false;
        }
    }
    return isQToken;
}

// Converts segmented tokens into a simplified token stream for evaluation
function tokenizeExpression(inputTokenList) {
    const outputTokens = [];
    const listLength = inputTokenList.length;

    for (let i = 0; i < listLength; i++) {
        const currentToken = inputTokenList[i];

        if (isNumericToken(currentToken)) {
            outputTokens.push(currentToken);
        } else if (currentToken === '<') {
            outputTokens.push('p'); // Represents S<x> start
        } else if (currentToken === '>') {
            if (isSingleGreaterThan(i, inputTokenList)) {
                outputTokens.push('q'); // Represents S<x> end (single '>')
            } else {
                outputTokens.push('t'); // Represents x>>y operator ('>>')
                i++; // Skip the next '>' as it's part of '>>'
            }
        }
    }
    return outputTokens;
}

// Evaluates the token stream by reducing it to a single result
function evaluateExpressionTree(tokenStack) {
    let currentIdx = 0;
    while (tokenStack.length > 1) {
        const currentToken = tokenStack[currentIdx];

        if (currentToken === 'q') { // Represents '>' for S<x>
            // Operation: S(x)
            // Expected pattern: [..., 'p', x, 'q', ...]
            // Result: [..., S(x), ...]
            const operandValue = tokenStack[currentIdx - 1];
            const pTokenPosition = currentIdx - 2;

            tokenStack[pTokenPosition] = computeSquareModulo(operandValue);
            tokenStack.splice(currentIdx - 1, 2); // Remove operand (x) and 'q'
            currentIdx -= 2; // Adjust index to point to the new S(x) result
        } else if (currentToken === 't') { // Represents '>>' for x>>y
            // Operation: T(x, y)
            // Expected pattern: [..., x, 't', y, ...]
            // Result: [..., T(x, y), ...]
            const leftOperand = tokenStack[currentIdx - 1];
            const rightOperand = tokenStack[currentIdx + 1];

            tokenStack[currentIdx - 1] = performRightShiftDivision(leftOperand, rightOperand);
            tokenStack.splice(currentIdx, 2); // Remove 't' and right operand (y)
            currentIdx -= 1; // Adjust index to point to the new T(x,y) result
        }
        // For numbers or 'p' tokens, or if currentToken is undefined (out of bounds),
        // simply advance the index. The loop condition `tokenStack.length > 1`
        // ensures termination when the expression is fully reduced.
        currentIdx++;
    }
    return tokenStack;
}

// Orchestrates the processing of a single input line
function processInputLine(inputString) {
    const cleanedString = cleanInputString(inputString);
    const segmentedTokens = segmentInputTokens(cleanedString);
    const expressionTokens = tokenizeExpression(segmentedTokens);
    const evaluatedResultArray = evaluateExpressionTree(expressionTokens);
    const finalResult = evaluatedResultArray[0];
    log(finalResult);
}
