const fileSystem = require("fs");

class InputTokenQueue {
    constructor(initialTokens = []) {
        this.tokens = initialTokens;
        this.currentIndex = 0;
    }

    getNextToken() {
        if (this.currentIndex >= this.tokens.length) {
            return undefined;
        }
        const token = this.tokens[this.currentIndex];
        this.currentIndex++;
        return token;
    }
}

class InputParser {
    constructor(rawInputText) {
        const parsedTokens = rawInputText.trim().split(/\s+/g);
        this.tokenSource = new InputTokenQueue(parsedTokens);
    }

    readNextString() {
        return this.tokenSource.getNextToken();
    }

    readNextInt() {
        const token = this.tokenSource.getNextToken();
        return parseInt(token, 10);
    }
}

function calculateOperations(inputNumbers) {
    const firstValue = inputNumbers[0];

    if (firstValue !== 0) {
        console.log(-1);
        return;
    }

    let totalCount = 0;
    let lastProcessedValue = 0;

    for (let k = 1; k < inputNumbers.length; k++) {
        const currentNumber = inputNumbers[k];

        if (lastProcessedValue <= currentNumber) {
            const valueDifference = currentNumber - lastProcessedValue;
            if (valueDifference > 1) {
                console.log(-1);
                return;
            }
            if (valueDifference === 1) {
                totalCount++;
            } else if (valueDifference === 0) {
                totalCount += currentNumber;
            }
        } else {
            totalCount += currentNumber;
        }
        lastProcessedValue = currentNumber;
    }
    console.log(totalCount);
}

function processRawInput(inputContent) {
    const parserInstance = new InputParser(inputContent);

    const numberOfElements = parserInstance.readNextInt();
    const numbersToProcess = new Array(numberOfElements);

    for (let i = 0; i < numberOfElements; i++) {
        numbersToProcess[i] = parserInstance.readNextInt();
    }

    calculateOperations(numbersToProcess);
}

function initializeApplication() {
    const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    processRawInput(standardInputContent);
}

initializeApplication();
