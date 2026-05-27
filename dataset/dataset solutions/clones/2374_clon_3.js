const fileSystemModule = require('fs');

function* createTokenIterator(inputLine) {
    const dataTokens = inputLine.split(/\s+/);
    for (const currentToken of dataTokens) {
        yield currentToken;
    }
}

function* createParsedTokenIterator(inputLine, tokenParser) {
    const dataTokens = inputLine.split(/\s+/);
    for (const currentToken of dataTokens) {
        yield tokenParser(currentToken);
    }
}

function createInputReader(inputLine) {
    const tokenIterator = createTokenIterator(inputLine);
    return () => tokenIterator.next().value;
}

function createIntInputReader(inputLine) {
    const tokenIterator = createTokenIterator(inputLine);
    return () => parseInt(tokenIterator.next().value, 10);
}

function createBigIntInputReader(inputLine) {
    const tokenIterator = createTokenIterator(inputLine);
    return () => BigInt(tokenIterator.next().value);
}

function calculateUniquePinCombinations({ inputLength, inputString }) {
    const nextDigitOccurrence = Array(inputLength);
    const lastSeenDigitIndex = Array(10).fill(-1);

    for (let currentStringIndex = inputLength - 1; currentStringIndex >= 0; currentStringIndex--) {
        const digitValue = Number(inputString[currentStringIndex]);
        nextDigitOccurrence[currentStringIndex] = [...lastSeenDigitIndex];
        lastSeenDigitIndex[digitValue] = currentStringIndex;
    }

    let totalValidPins = 0;

    const isValidPinSequence = (pinCandidateDigits) => {
        let currentSearchIndex = lastSeenDigitIndex[pinCandidateDigits[0]];
        if (currentSearchIndex === -1) {
            return false;
        }

        for (let digitPos = 1; digitPos < 3; digitPos++) {
            currentSearchIndex = nextDigitOccurrence[currentSearchIndex][pinCandidateDigits[digitPos]];
            if (currentSearchIndex === -1) {
                return false;
            }
        }
        return true;
    };

    for (let candidateNum = 0; candidateNum < 1000; candidateNum++) {
        const pinString = String(candidateNum).padStart(3, '0');
        const pinDigits = [
            Number(pinString[0]),
            Number(pinString[1]),
            Number(pinString[2])
        ];

        if (isValidPinSequence(pinDigits)) {
            totalValidPins++;
        }
    }

    return totalValidPins;
}

function processInputAndSolve(inputData) {
    const readNextToken = createInputReader(inputData);
    const inputLength = parseInt(readNextToken(), 10);
    const inputString = readNextToken();

    const resultCount = calculateUniquePinCombinations({ inputLength, inputString });
    console.log(resultCount);
}

if (require.main === module) {
    const stdinContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processInputAndSolve(stdinContent);
}
