class InputSourceHandler {
    #inputLines;
    #currentLineIndex;

    constructor(rawContent) {
        this.#inputLines = rawContent.split("\n").map(s => s.trim());
        this.#currentLineIndex = 0;
    }

    hasMoreInput() {
        return this.#currentLineIndex < this.#inputLines.length;
    }

    retrieveNextInputLine() {
        if (!this.hasMoreInput()) {
            throw new Error("Input exhausted: No more lines available.");
        }
        return this.#inputLines[this.#currentLineIndex++];
    }
}

const dataTransformationRegistry = new Map([
    [1, (str) => parseInt(str, 10)],
    [2, (str) => str.split(" ")],
    [4, (str) => str.split(" ").map(Number)],
    [6, (str) => str.split("")],
    [7, (str) => str.split("").map(Number)],
    [8, (arr) => arr.join(" ")],
    [9, (arr) => arr.join("\n")],
    [0, (arr) => arr.join("")],
]);

function applyDataTransformation(item, transformationType) {
    try {
        const transformer = dataTransformationRegistry.get(transformationType);
        return transformer ? transformer(item) : item;
    } catch (transformationError) {
        return item;
    }
}

function fetchRawInputContent() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

function displayOutput(content) {
    console.log(content);
}

function reportProgramError(message) {
    console.error(message);
}

function calculateTotalDivisors(numberToAnalyze) {
    if (numberToAnalyze <= 0) return 0;
    if (numberToAnalyze === 1) return 1;

    let currentNumber = numberToAnalyze;
    let productOfExponentsPlusOne = 1;
    let primeFactorCandidate = 2;

    while (primeFactorCandidate * primeFactorCandidate <= currentNumber) {
        if (currentNumber % primeFactorCandidate === 0) {
            let exponentCount = 0;
            while (currentNumber % primeFactorCandidate === 0) {
                exponentCount++;
                currentNumber /= primeFactorCandidate;
            }
            productOfExponentsPlusOne *= (exponentCount + 1);
        }
        primeFactorCandidate++;
    }

    if (currentNumber > 1) {
        productOfExponentsPlusOne *= 2;
    }

    return productOfExponentsPlusOne;
}

function executeMainLogic() {
    const rawInputData = fetchRawInputContent();
    const inputProcessor = new InputSourceHandler(rawInputData);

    const retrieveNextInteger = () => applyDataTransformation(inputProcessor.retrieveNextInputLine(), 1);

    const inputNumericValue = retrieveNextInteger();
    const valueForDivisorCalculation = inputNumericValue - 1;

    let finalDivisorCount;
    if (valueForDivisorCalculation === 0) {
        finalDivisorCount = 0;
    } else if (valueForDivisorCalculation === 1) {
        finalDivisorCount = 1;
    } else {
        finalDivisorCount = calculateTotalDivisors(valueForDivisorCalculation);
    }

    displayOutput(finalDivisorCount + 1);
}

executeMainLogic();
