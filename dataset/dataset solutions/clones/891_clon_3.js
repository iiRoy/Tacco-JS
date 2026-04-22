const MODULO_CONSTANT = 1000000007;

const outputChannel = console.info;

function isDigitChar(charValue) {
    if (typeof charValue !== 'string' || charValue.length !== 1) {
        return false;
    }
    const charCode = charValue.charCodeAt(0);
    return charCode >= 48 && charCode <= 57;
}

if (typeof process !== "undefined" && process.stdin && typeof process.stdin.resume === 'function') {
    let receivedDataBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (dataSegment) => {
        receivedDataBuffer += dataSegment;
    });

    process.stdin.on('end', () => {
        const inputLines = receivedDataBuffer.split("\n").filter(line => line.trim() !== '');
        executeProcessing(inputLines);
    });
}

function calculateRecursiveModulus(baseVal, exponentVal) {
    if (typeof baseVal !== 'number' || typeof exponentVal !== 'number' || isNaN(baseVal) || isNaN(exponentVal)) {
        outputChannel(`Error: Invalid numeric input to calculateRecursiveModulus: base=${baseVal}, exp=${exponentVal}`);
        return 0;
    }

    if (baseVal > 90000000 && exponentVal > 1) {
        const remainderTerm = exponentVal % 2;
        const halfExponent = Math.floor(exponentVal / 2);
        const recursiveResult = calculateRecursiveModulus(baseVal, halfExponent);

        let intermediateSum;
        if (remainderTerm === 1) {
            intermediateSum = (2 * recursiveResult + baseVal) % MODULO_CONSTANT;
        } else {
            intermediateSum = (2 * recursiveResult) % MODULO_CONSTANT;
        }
        return intermediateSum % MODULO_CONSTANT;
    }
    return (baseVal * exponentVal) % MODULO_CONSTANT;
}

function calculateSquareRecursive(valueParam) {
    if (typeof valueParam !== 'number' || isNaN(valueParam)) {
        outputChannel(`Warning: Non-numeric input for calculateSquareRecursive: ${valueParam}`);
        return 0;
    }
    return calculateRecursiveModulus(valueParam, valueParam);
}

function calculateShiftedDivision(numeratorVal, shiftAmount) {
    if (typeof numeratorVal !== 'number' || isNaN(numeratorVal) || typeof shiftAmount !== 'number' || isNaN(shiftAmount) || shiftAmount < 0) {
        outputChannel(`Warning: Invalid input for calculateShiftedDivision: num=${numeratorVal}, shift=${shiftAmount}`);
        return 0;
    }
    const divisorPowerOfTwo = 1 << shiftAmount;
    if (divisorPowerOfTwo === 0) { // Guard against huge shiftAmount resulting in 0 or negative
        return 0;
    }
    return Math.floor(numeratorVal / divisorPowerOfTwo);
}

function cleanInputString(rawString) {
    if (typeof rawString !== 'string') {
        outputChannel("Warning: cleanInputString received non-string input.");
        return "";
    }
    const charactersToRemoveRegex = /[\sS]/g;
    return rawString.replace(charactersToRemoveRegex, '');
}

function segmentInputTokens(rawInputString) {
    if (!rawInputString || typeof rawInputString !== 'string') {
        return [];
    }

    const inputChars = rawInputString.split('');
    const arrayLength = inputChars.length;
    const tokenizedSegments = [];
    let segmentStartIdx = 0;
    let currentlyParsingNumber = false;

    for (let i = 0; i < arrayLength; i++) {
        const currentChar = inputChars[i];

        if (isDigitChar(currentChar)) {
            if (!currentlyParsingNumber) {
                segmentStartIdx = i;
                currentlyParsingNumber = true;
            }
        } else {
            if (currentlyParsingNumber) {
                const numberChars = inputChars.slice(segmentStartIdx, i);
                const numberString = numberChars.join('');
                const parsedNumber = Number(numberString);
                tokenizedSegments.push(parsedNumber);
                currentlyParsingNumber = false;
            }
            tokenizedSegments.push(currentChar);
        }
    }

    if (currentlyParsingNumber) {
        const numberChars = inputChars.slice(segmentStartIdx, arrayLength);
        const numberString = numberChars.join('');
        const parsedNumber = Number(numberString);
        tokenizedSegments.push(parsedNumber);
    }
    return tokenizedSegments;
}

function isClosingBracketToken(currentIndex, tokenSequence) {
    if (currentIndex + 1 < tokenSequence.length && tokenSequence[currentIndex + 1] === '>') {
        if (currentIndex + 2 < tokenSequence.length) {
            const nextCharAfterDoubleArrow = tokenSequence[currentIndex + 2];
            if (isDigitChar(String(nextCharAfterDoubleArrow)) || nextCharAfterDoubleArrow === '<') {
                return false;
            }
        }
    }
    return true;
}

function convertSegmentsToTokens(segmentedInput) {
    if (!segmentedInput || !Array.isArray(segmentedInput)) {
        return [];
    }

    const processedTokens = [];
    const segmentCount = segmentedInput.length;

    for (let i = 0; i < segmentCount; i++) {
        const currentSegment = segmentedInput[i];

        if (typeof currentSegment === 'number') {
            processedTokens.push(currentSegment);
        } else if (currentSegment === '<') {
            processedTokens.push('p');
        } else if (currentSegment === '>') {
            if (isClosingBracketToken(i, segmentedInput)) {
                processedTokens.push('q');
            } else {
                processedTokens.push('t');
                i++;
            }
        }
    }
    return processedTokens;
}

function evaluateTokenTree(tokenList) {
    if (!tokenList || !Array.isArray(tokenList)) {
        return [NaN];
    }

    const evaluationStack = [...tokenList];
    let currentIdx = 0;

    while (evaluationStack.length > 1 && currentIdx < evaluationStack.length) {
        const currentToken = evaluationStack[currentIdx];

        if (typeof currentToken === 'number') {
            if (currentIdx >= 2 && evaluationStack[currentIdx - 1] === 't') {
                const shiftAmount = currentToken;
                const numerator = evaluationStack[currentIdx - 2];
                if (typeof numerator === 'number') {
                    const result = calculateShiftedDivision(numerator, shiftAmount);
                    evaluationStack.splice(currentIdx - 2, 3, result);
                    currentIdx -= 2;
                } else {
                    outputChannel(`Error: 't' operator not preceded by a number at index ${currentIdx - 2}`);
                    return [NaN];
                }
            } else {
                currentIdx++;
            }
        } else if (currentToken === 'q') {
            if (currentIdx >= 2 && evaluationStack[currentIdx - 2] === 'p' && typeof evaluationStack[currentIdx - 1] === 'number') {
                const valueForS = evaluationStack[currentIdx - 1];
                const result = calculateSquareRecursive(valueForS);
                evaluationStack.splice(currentIdx - 2, 3, result);
                currentIdx -= 2;
            } else {
                outputChannel(`Error: 'q' operator malformed or misplaced at index ${currentIdx}`);
                return [NaN];
            }
        } else if (currentToken === 'p' || currentToken === 't') {
            currentIdx++;
        } else {
            outputChannel(`Warning: Unrecognized token '${currentToken}' encountered at index ${currentIdx}`);
            currentIdx++;
        }
    }

    if (evaluationStack.length !== 1 || isNaN(evaluationStack[0])) {
        outputChannel(`Error: Evaluation did not yield a single valid result. Final stack: ${evaluationStack}`);
        return [NaN];
    }
    return evaluationStack;
}

function handleSingleLine(rawInputString) {
    let processedString = cleanInputString(rawInputString);
    if (!processedString) {
        outputChannel('');
        return;
    }

    let segmentedData = segmentInputTokens(processedString);
    if (!segmentedData || segmentedData.length === 0) {
        outputChannel('');
        return;
    }

    let tokenSequence = convertSegmentsToTokens(segmentedData);
    if (!tokenSequence || tokenSequence.length === 0) {
        outputChannel('');
        return;
    }

    let evaluationResult = evaluateTokenTree(tokenSequence);
    if (!evaluationResult || evaluationResult.length !== 1 || isNaN(evaluationResult[0])) {
        outputChannel('Evaluation Error');
        return;
    }

    outputChannel(evaluationResult[0]);
}

function executeProcessing(inputStrings) {
    if (!inputStrings || !Array.isArray(inputStrings) || inputStrings.length === 0) {
        outputChannel("No input lines provided for processing.");
        return;
    }

    let validLinesProcessed = 0;
    for (const currentString of inputStrings) {
        const trimmedString = currentString.trim();
        if (trimmedString === "#") {
            break;
        }
        if (trimmedString.length > 0) {
            handleSingleLine(trimmedString);
            validLinesProcessed++;
        }
    }

    if (validLinesProcessed === 0) {
        outputChannel("No valid non-empty lines were processed.");
    }
}