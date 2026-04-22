const obtainDataStream = () => require("node:fs").readFileSync("/dev/stdin", "utf8").trim();

class ContentProcessor {
    #lines;
    #currentLineIndex;

    constructor(rawContent) {
        this.#lines = rawContent.split("\n");
        this.#currentLineIndex = 0;
    }

    hasMoreEntries() {
        return this.#currentLineIndex < this.#lines.length;
    }

    retrieveNextEntry() {
        if (!this.hasMoreEntries()) {
            return "";
        }
        const entry = this.#lines[this.#currentLineIndex];
        this.#currentLineIndex++;
        return entry;
    }
}

const conversionRegistry = new Map([
    [1, (val) => Number.parseInt(val, 10)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (arr) => arr.join(" ")],
    [9, (arr) => arr.join("\n")],
    [0, (arr) => arr.join("")],
]);

const processInputDatum = (inputDatum, conversionType) => {
    try {
        const converter = conversionRegistry.get(conversionType);
        return converter ? converter(inputDatum) : inputDatum;
    } catch (e) {
        return inputDatum;
    }
};

const dataProcessor = new ContentProcessor(obtainDataStream());

const fetchInteger = () => processInputDatum(dataProcessor.retrieveNextEntry(), 1);
const fetchStringList = () => processInputDatum(dataProcessor.retrieveNextEntry(), 2);
const fetchIntegerList = () => processInputDatum(dataProcessor.retrieveNextEntry(), 4);
const fetchCharList = () => processInputDatum(dataProcessor.retrieveNextEntry(), 6);

const emitResult = (content) => console.log(content);
const reportIssue = (content) => console.error(content);

function* generateCombinations(depth, limit, currentCombination = []) {
    if (depth === 0) {
        yield currentCombination;
        return;
    }
    for (let currentVal = 1; currentVal <= limit; currentVal++) {
        yield* generateCombinations(depth - 1, limit, [...currentCombination, currentVal]);
    }
}

const executeCalculation = () => {
    const initialParameters = fetchIntegerList();
    const upperLimit = initialParameters[0];
    const targetDifference = initialParameters[2];

    const valueFrequency = new Map();

    for (const [valA, valB, valC, valD] of generateCombinations(4, upperLimit)) {
        let currentScore = 0;
        currentScore += Math.abs(valA - valB) === targetDifference ? 1 : 0;
        currentScore += Math.abs(valC - valB) === targetDifference ? 1 : 0;
        currentScore += Math.abs(valC - valD) === targetDifference ? 1 : 0;

        valueFrequency.set(currentScore, (valueFrequency.get(currentScore) || 0) + 1);
    }

    emitResult(Object.fromEntries(valueFrequency));
};

executeCalculation();