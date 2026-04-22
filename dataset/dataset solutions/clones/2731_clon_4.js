let inputAccumulator = '';

function convertDigitsToValue(digitSequence) {
    let numericOutcome = 0;
    let powerOfTen = 1;
    for (let index = digitSequence.length - 1; index >= 0; index--) {
        const digitCharacter = digitSequence[index];
        const digitInteger = digitCharacter.charCodeAt(0) - '0'.charCodeAt(0);
        numericOutcome += digitInteger * powerOfTen;
        powerOfTen *= 10;
    }
    return numericOutcome;
}

function acquireNumericElements(textSource) {
    let collectedTokens = [];
    let currentTokenBuffer = '';
    for (let charPointer = 0; charPointer < textSource.length; charPointer++) {
        let symbol = textSource[charPointer];
        if (symbol >= '0' && symbol <= '9') {
            currentTokenBuffer += symbol;
        } else if (symbol === ' ' || symbol === '\n' || symbol === '\r') {
            if (currentTokenBuffer.length > 0) {
                collectedTokens.push(convertDigitsToValue(currentTokenBuffer));
                currentTokenBuffer = '';
            }
            if (collectedTokens.length === 2) break;
        }
    }
    if (currentTokenBuffer.length > 0 && collectedTokens.length < 2) {
        collectedTokens.push(convertDigitsToValue(currentTokenBuffer));
    }
    return collectedTokens;
}

function calculateUpboundDivision(topValue, bottomValue) {
    // Equivalent to Math.ceil(topValue / bottomValue) for positive integers
    return ~~((topValue + bottomValue - 1) / bottomValue);
}

function processAndDisplay(initialData) {
    const numericalComponents = acquireNumericElements(initialData);
    const baseAmount = numericalComponents[0];
    const modifier = numericalComponents[1];

    const finalDivisor = (modifier * 2) + 1;
    const computedResult = calculateUpboundDivision(baseAmount, finalDivisor);

    process.stdout.write(computedResult.toString() + '\n');
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunkOfData) {
    inputAccumulator += chunkOfData;
});

process.stdin.on('end', function() {
    processAndDisplay(inputAccumulator.trim());
});