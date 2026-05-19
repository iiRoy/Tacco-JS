function create2DArray(rows, cols) {
    cols = cols || rows;
    return Array(rows).fill(0).map(row => Array(cols).fill(0));
}

class InputReader {
    #inputLines;
    #currentLineIndex;

    constructor(inputString) {
        this.#inputLines = inputString.split("\n");
        this.#currentLineIndex = 0;
    }

    #readSingleToken(parseAsNumber) {
        let currentLineContent = this.#inputLines[this.#currentLineIndex];

        if (typeof currentLineContent === "string") {
            this.#inputLines[this.#currentLineIndex] = currentLineContent.split(" ").reverse();
        }

        const tokenValue = this.#inputLines[this.#currentLineIndex].pop();

        if (!this.#inputLines[this.#currentLineIndex].length) {
            this.#currentLineIndex++;
        }
        return parseAsNumber ? +tokenValue : tokenValue;
    }

    #readFullLine(parseAsNumber) {
        let currentLineContent = this.#inputLines[this.#currentLineIndex];
        let tokensToProcess;

        if (typeof currentLineContent === "string") {
            tokensToProcess = currentLineContent.split(" ");
        } else {
            tokensToProcess = currentLineContent.reverse();
        }
        this.#currentLineIndex++;
        return parseAsNumber ? tokensToProcess.map(val => +val) : tokensToProcess;
    }

    readToken(parseAsNumber) { return this.#readSingleToken(parseAsNumber); }
    one(parseAsNumber) { return this.#readSingleToken(parseAsNumber); }
    single(parseAsNumber) { return this.#readSingleToken(parseAsNumber); }

    readLineTokens(parseAsNumber) { return this.#readFullLine(parseAsNumber); }
    line(parseAsNumber) { return this.#readFullLine(parseAsNumber); }
    row(parseAsNumber) { return this.#readFullLine(parseAsNumber); }

    readMatrix(numRows, parseAsNumber) {
        const resultMatrix = [];
        for (let i = 0; i < numRows; i++) {
            const lineData = this.#inputLines[this.#currentLineIndex + i].split(" ");
            resultMatrix[i] = parseAsNumber ? lineData.map(val => +val) : lineData;
        }
        this.#currentLineIndex += numRows;
        return resultMatrix;
    }
    matrix(numRows, parseAsNumber) { return this.readMatrix(numRows, parseAsNumber); }

    readAndCountPairs(gridRows, numPairsToRead) {
        const countGrid = create2DArray(gridRows + 1);
        for (let i = 0; i < numPairsToRead; i++) {
            const currentLine = this.#inputLines[this.#currentLineIndex + i].split(" ");
            const rowIdx = +currentLine[0];
            const colIdx = +currentLine[1];
            countGrid[rowIdx][colIdx]++;
        }
        this.#currentLineIndex += numPairsToRead;
        return countGrid;
    }
    ary(gridRows, numPairsToRead) { return this.readAndCountPairs(gridRows, numPairsToRead); }
}

class DisjointSetUnion {
    #parentArray;

    constructor(size) {
        this.#parentArray = Array(size + 1).fill(0).map((_, i) => i);
    }

    findRoot(element) {
        if (this.#parentArray[element] === element) {
            return element;
        }
        this.#parentArray[element] = this.findRoot(this.#parentArray[element]);
        return this.#parentArray[element];
    }

    areConnected(elementX, elementY) {
        return this.findRoot(elementX) === this.findRoot(elementY);
    }

    unionSets(elementX, elementY) {
        const rootX = this.findRoot(elementX);
        const rootY = this.findRoot(elementY);
        if (rootX !== rootY) {
            this.#parentArray[rootX] = rootY;
            return true;
        }
        return false;
    }
}

const inputProcessor = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
    const numElements = inputProcessor.readToken(true);
    const numConnectionsK = inputProcessor.readToken(true);
    const numConnectionsL = inputProcessor.readToken(true);

    const dsuA = new DisjointSetUnion(numElements);
    const dsuB = new DisjointSetUnion(numElements);

    const applyConnections = (count, dsuInstance) => {
        for (let loopIdx = 0; loopIdx < count; loopIdx++) {
            const connectionPair = inputProcessor.readLineTokens(true);
            dsuInstance.unionSets(connectionPair[0], connectionPair[1]);
        }
    };

    applyConnections(numConnectionsK, dsuA);
    applyConnections(numConnectionsL, dsuB);

    const combinedRootStrings = [];
    const rootFrequencyMap = new Map();

    for (let idx = 0; idx < numElements; idx++) {
        const currentElement = idx + 1;
        const rootOfA = dsuA.findRoot(currentElement);
        const rootOfB = dsuB.findRoot(currentElement);
        const combinedKey = `${rootOfA},${rootOfB}`;

        combinedRootStrings[idx] = combinedKey;
        rootFrequencyMap.set(combinedKey, (rootFrequencyMap.get(combinedKey) || 0) + 1);
    }

    const finalResultCounts = [];
    for (let idx = 0; idx < numElements; idx++) {
        finalResultCounts[idx] = rootFrequencyMap.get(combinedRootStrings[idx]);
    }

    return finalResultCounts.join(" ");
}
