class InputSource {
    #rawContent;
    #lines;
    #currentLineIndex;

    constructor(sourceText) {
        this.#rawContent = sourceText;
        this.#lines = sourceText.trim().split("\n");
        this.#currentLineIndex = 0;
    }

    retrieveFirstTokenString() {
        if (this.#currentLineIndex >= this.#lines.length) {
            return undefined;
        }
        const line = this.#lines[this.#currentLineIndex];
        const tokens = line.split(" ");
        this.#currentLineIndex++;
        return tokens[0];
    }

    fetchCurrentLineItems(asNumbers = false) {
        if (this.#currentLineIndex >= this.#lines.length) {
            return [];
        }
        const lineContent = this.#lines[this.#currentLineIndex++];
        const items = lineContent.split(" ");
        return asNumbers ? items.map(Number) : items;
    }

    obtainMatrixData(rowCount, convertToNumbers = false) {
        const matrixRows = [];
        for (let i = 0; i < rowCount; i++) {
            if (this.#currentLineIndex >= this.#lines.length) break;
            const lineContent = this.#lines[this.#currentLineIndex++];
            const items = lineContent.split(" ");
            matrixRows.push(convertToNumbers ? items.map(Number) : items);
        }
        return matrixRows;
    }

    acquireLineSegments(count, parseAsNumbers = false) {
        const segments = [];
        for (let i = 0; i < count; i++) {
            if (this.#currentLineIndex >= this.#lines.length) break;
            const lineContent = this.#lines[this.#currentLineIndex++];
            segments.push(parseAsNumbers ? Number(lineContent) : lineContent);
        }
        return segments;
    }
}

const createMultiDimCollection = (...args) => {
    if (args.length < 1) {
        throw new Error("At least one argument (the value factory) is required.");
    }

    const valueProducer = args[args.length - 1];
    if (typeof valueProducer !== 'function') {
        throw new Error("The last argument must be a function (value factory).");
    }

    const dimensionSizes = args.slice(0, -1);

    if (dimensionSizes.some(d => typeof d !== 'number' || d < 0)) {
        throw new Error("Dimensions must be non-negative numbers.");
    }

    const buildRecursive = (currentDimIndex) => {
        if (currentDimIndex === dimensionSizes.length) {
            return valueProducer();
        }

        const currentSize = dimensionSizes[currentDimIndex];
        return Array.from({ length: currentSize }, () => buildRecursive(currentDimIndex + 1));
    };

    return buildRecursive(0);
};

const analyzeInputSequence = (inputString) => {
    const symbols = Array.from(inputString);

    const hasAdjacentDuplicates = symbols.slice(0, 3).some((symbol, idx) => {
        return symbol === symbols[idx + 1];
    });

    return hasAdjacentDuplicates ? "Bad" : "Good";
};

const fileSystemInterface = require("fs");
const receivedContent = fileSystemInterface.readFileSync("/dev/stdin", "utf8");

const dataHandler = new InputSource(receivedContent);
const firstParsedToken = dataHandler.retrieveFirstTokenString();

console.log(analyzeInputSequence(firstParsedToken));