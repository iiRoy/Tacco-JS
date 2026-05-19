var outputConsole = console.log;

if (typeof process !== "undefined") {
    let rawInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(dataChunk) {
        rawInputData += dataChunk;
    });

    process.stdin.on('end', function() {
        const allInputLines = rawInputData.split("\n");
        processAllInputLines(allInputLines);
    });
}

function processAllInputLines(allInputLines) {
    allInputLines.forEach(function(currentInputLine) {
        if (currentInputLine !== "#") {
            handleSingleExpressionLine(currentInputLine);
        }
    });
}

function calculateRecursiveModuloProduct(valA, valB) {
    const modulusValue = 1_000_000_007;

    if (valA > 90_000_000 && valB > 1) {
        const currentRemainder = valB % 2;
        const halfOfValB = Math.floor(valB / 2);
        const partialProduct = calculateRecursiveModuloProduct(valA, halfOfValB);

        let temporarySum;
        if (currentRemainder) {
            temporarySum = (2 * partialProduct + valA) % modulusValue;
        } else {
            temporarySum = (2 * partialProduct) % modulusValue;
        }
        return temporarySum % modulusValue;
    }
    return (valA * valB) % modulusValue;
}

function performSOperation(operandX) {
    return calculateRecursiveModuloProduct(operandX, operandX);
}

function performTOperation(baseValue, shiftAmount) {
    return Math.floor(baseValue / Math.pow(2, shiftAmount));
}

function stripWhitespaceAndS(rawExpressionString) {
    return rawExpressionString.replace(/\s|S/g, '');
}

function isValueNumeric(valueCandidate) {
    const convertedNumber = Number(valueCandidate);
    const stringRepresentation = convertedNumber.toString();
    return Boolean(stringRepresentation !== "NaN");
}

function segmentExpressionIntoParts(cleanedExpression) {
    let characterArray = cleanedExpression.split('');
    const expressionLength = characterArray.length;
    let currentSegmentStart = 0;
    let currentSegmentEnd = 0;
    let expressionSegments = [];
    let isParsingNumber = false;

    for (let charIndex = 0; charIndex < expressionLength; charIndex++) {
        const currentCharacter = characterArray[charIndex];

        if (!isParsingNumber && isValueNumeric(currentCharacter)) {
            currentSegmentStart = charIndex;
            isParsingNumber = true;
        } else if (isParsingNumber && !isValueNumeric(currentCharacter)) {
            currentSegmentEnd = charIndex;
            isParsingNumber = false;
            const numberChars = characterArray.slice(currentSegmentStart, currentSegmentEnd);
            const numberString = numberChars.join('');
            const parsedNumericValue = Number(numberString);
            expressionSegments.push(parsedNumericValue);
        }

        if (!isValueNumeric(currentCharacter)) {
            expressionSegments.push(currentCharacter);
        }
    }

    if (isParsingNumber) {
        currentSegmentEnd = expressionLength;
        const numberChars = characterArray.slice(currentSegmentStart, currentSegmentEnd);
        const numberString = numberChars.join('');
        const parsedNumericValue = Number(numberString);
        expressionSegments.push(parsedNumericValue);
    }
    return expressionSegments;
}

function isStandaloneQToken(currentPosition, tokenSequence) {
    let isQ = true;
    if (tokenSequence[currentPosition + 1] === '>') {
        if (isValueNumeric(tokenSequence[currentPosition + 2]) || tokenSequence[currentPosition + 2] === '<') {
            isQ = false;
        }
    }
    return isQ;
}

function convertToExpressionTokens(segmentedPartsArray) {
    let qTokenStartPlaceholder = 0;
    let qTokenEndPlaceholder = 0;

    let finalTokenArray = [];
    const sequenceLength = segmentedPartsArray.length;

    for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
        const currentElement = segmentedPartsArray[currentIdx];

        if (isValueNumeric(currentElement)) {
            finalTokenArray.push(currentElement);
        } else if (currentElement === '<') {
            finalTokenArray.push('p');
        } else if (currentElement === '>') {
            if (isStandaloneQToken(currentIdx, segmentedPartsArray)) {
                finalTokenArray.push('q');
            } else {
                finalTokenArray.push('t');
                currentIdx += 1;
            }
        }
    }
    return finalTokenArray;
}

function reduceExpressionTree(expressionTokens) {
    let processingIndex = 0;
    while (expressionTokens.length > 1) {
        const currentToken = expressionTokens[processingIndex];

        if (isValueNumeric(currentToken)) {
            if (processingIndex > 0 && expressionTokens[processingIndex - 1] === 't') {
                expressionTokens[processingIndex - 2] = performTOperation(expressionTokens[processingIndex - 2], expressionTokens[processingIndex]);
                expressionTokens.splice(processingIndex - 1, 2);
                processingIndex = processingIndex - 3;
            }
        } else if (currentToken === 'p') {
            // No direct action on 'p'
        } else if (currentToken === 'q') {
            expressionTokens[processingIndex - 2] = performSOperation(expressionTokens[processingIndex - 1]);
            expressionTokens.splice(processingIndex - 1, 2);
            processingIndex = processingIndex - 3;
        } else if (currentToken === 't') {
            // No direct action on 't'
        }
        processingIndex++;

        if (processingIndex >= expressionTokens.length) {
            processingIndex = 0;
        }
    }
    return expressionTokens;
}

function handleSingleExpressionLine(rawLineInput) {
    let currentProcessedResult = stripWhitespaceAndS(rawLineInput);
    if (!currentProcessedResult) { outputConsole(''); return; }

    currentProcessedResult = segmentExpressionIntoParts(currentProcessedResult);
    if (!currentProcessedResult) { outputConsole(''); return; }

    currentProcessedResult = convertToExpressionTokens(currentProcessedResult);
    if (!currentProcessedResult) { outputConsole(''); return; }

    currentProcessedResult = reduceExpressionTree(currentProcessedResult);
    if (!currentProcessedResult) { outputConsole(''); return; }

    currentProcessedResult = currentProcessedResult[0];
    if (!currentProcessedResult) { outputConsole(''); return; }

    outputConsole(currentProcessedResult);
}
