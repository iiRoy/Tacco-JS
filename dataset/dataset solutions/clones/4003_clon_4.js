let collectedStringData = '';

const lineSeparator = global.process.platform === 'win32' ? '\r\n' : '\n';

function displayResult(valueToPresent) {
    global.process.stdout.cork();
    global.process.stdout.write(String(valueToPresent) + lineSeparator);
    global.process.stdout.uncork();
}

function determineQuotient(dividendValue, divisorValue) {
    if (divisorValue === 0) {
        throw new Error("Cannot divide by zero.");
    }

    if (dividendValue >= 0) {
        if (dividendValue < divisorValue) {
            return 0;
        } else {
            return 1 + determineQuotient(dividendValue - divisorValue, divisorValue);
        }
    } else {
        if (dividendValue > -divisorValue) {
            return -1;
        } else if (dividendValue === -divisorValue) {
            return -1;
        } else {
            return -1 + determineQuotient(dividendValue + divisorValue, divisorValue);
        }
    }
}

function obtainNumericalValue(textInterpretation) {
    let currentCharacterIndex = 0;
    let signDirection = 1;
    let accumulatedNumber = 0;
    let hasFoundDigits = false;

    while (currentCharacterIndex < textInterpretation.length && /\s/.test(textInterpretation[currentCharacterIndex])) {
        currentCharacterIndex++;
    }

    if (textInterpretation[currentCharacterIndex] === '-') {
        signDirection = -1;
        currentCharacterIndex++;
    } else if (textInterpretation[currentCharacterIndex] === '+') {
        currentCharacterIndex++;
    }

    while (currentCharacterIndex < textInterpretation.length) {
        const characterRepresentation = textInterpretation[currentCharacterIndex];
        if (characterRepresentation >= '0' && characterRepresentation <= '9') {
            accumulatedNumber = accumulatedNumber * 10 + (characterRepresentation.charCodeAt(0) - '0'.charCodeAt(0));
            hasFoundDigits = true;
            currentCharacterIndex++;
        } else {
            break;
        }
    }

    if (!hasFoundDigits) {
        return Number.NaN;
    }

    return accumulatedNumber * signDirection;
}

global.process.stdin.setEncoding('utf8');

global.process.stdin.on('data', (incomingDataChunk) => {
    collectedStringData += incomingDataChunk;
});

global.process.stdin.on('end', () => {
    const linesOfInformation = collectedStringData.split(lineSeparator);
    const initialInputLine = linesOfInformation[0];

    const numericalInput = obtainNumericalValue(initialInputLine === undefined ? '' : initialInputLine);
    const finalCalculatedValue = determineQuotient(numericalInput, 3);
    displayResult(finalCalculatedValue);
});

global.process.stdin.resume();