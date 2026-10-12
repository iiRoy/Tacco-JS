class InputReader {
    #lineBuffer;
    #currentLineIndex;

    constructor(rawInputContent) {
        this.#lineBuffer = rawInputContent.trim().split('\n');
        this.#currentLineIndex = 0;
    }

    hasMoreLines() {
        return this.#currentLineIndex < this.#lineBuffer.length;
    }

    retrieveNextLine() {
        if (!this.hasMoreLines()) {
            throw new Error("No more input lines available.");
        }
        return this.#lineBuffer[this.#currentLineIndex++];
    }
}

const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputProcessor = new InputReader(standardInputContent);

const conversionOperations = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (arr) => arr.join(" ")],
    [9, (arr) => arr.join("\n")],
    [0, (arr) => arr.join("")]
]);

function applyConversion(inputValue, conversionType) {
    try {
        const operation = conversionOperations.get(conversionType);
        return operation ? operation(inputValue) : inputValue;
    } catch (err) {
        return inputValue;
    }
}

function fetchInteger() { return applyConversion(inputProcessor.retrieveNextLine(), 1); }
function fetchStringArray() { return applyConversion(inputProcessor.retrieveNextLine(), 2); }
function fetchIntegerArray() { return applyConversion(inputProcessor.retrieveNextLine(), 4); }
function fetchCharacterArray() { return applyConversion(inputProcessor.retrieveNextLine(), 6); }

function emitResult(data) { console.log(data); }
function emitError(data) { console.error(data); }

processGraphData();

function processGraphData() {
    const graphParameters = fetchIntegerArray();
    const nodeCount = graphParameters[0];
    const edgeCount = graphParameters[1];

    const pathInfinity = 1000000007;

    const shortestPaths = Array.from({ length: nodeCount }, () =>
        Array.from({ length: nodeCount }, () => pathInfinity)
    );

    Array.from({ length: nodeCount }).forEach((_, idx) => {
        shortestPaths[idx][idx] = 0;
    });

    const originalEdgeWeights = new Map();

    Array.from({ length: edgeCount }).forEach(() => {
        const edgeData = fetchIntegerArray();
        const u = edgeData[0] - 1;
        const v = edgeData[1] - 1;
        const weight = edgeData[2];

        shortestPaths[u][v] = weight;
        shortestPaths[v][u] = weight;

        originalEdgeWeights.set(`${u}-${v}`, weight);
        originalEdgeWeights.set(`${v}-${u}`, weight);
    });

    Array.from({ length: nodeCount }).forEach((_, k) => {
        Array.from({ length: nodeCount }).forEach((_1, i) => {
            Array.from({ length: nodeCount }).forEach((_2, j) => {
                shortestPaths[i][j] = Math.min(
                    shortestPaths[i][j],
                    shortestPaths[i][k] + shortestPaths[k][j]
                );
            });
        });
    });

    let redundantEdgeCount = 0;

    Array.from({ length: nodeCount }).forEach((_, i) => {
        Array.from({ length: nodeCount }).forEach((_1, j) => {
            const edgeKey = `${i}-${j}`;
            if (originalEdgeWeights.has(edgeKey)) {
                const originalWeight = originalEdgeWeights.get(edgeKey);
                if (originalWeight !== shortestPaths[i][j]) {
                    redundantEdgeCount++;
                }
            }
        });
    });

    emitResult(redundantEdgeCount / 2);
}
