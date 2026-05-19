class InputProcessor {
    constructor(rawContent) {
        this.lines = rawContent.trim().split('\n');
        this.currentLinePointer = 0;
    }

    retrieveToken(asString = false) {
        if (typeof this.lines[this.currentLinePointer] === "string") {
            this.lines[this.currentLinePointer] = this.lines[this.currentLinePointer].split(" ").reverse();
        }
        const tokenValue = this.lines[this.currentLinePointer].pop();
        if (!this.lines[this.currentLinePointer].length) {
            this.currentLinePointer++;
        }
        return asString ? tokenValue : Number(tokenValue);
    }

    retrieveLine(asStrings = false) {
        const lineContent = this.lines[this.currentLinePointer++].split(" ");
        return asStrings ? lineContent : lineContent.map(Number);
    }

    retrieveMatrix(numRows, asStrings = false) {
        const matrixData = this.lines.slice(this.currentLinePointer, this.currentLinePointer + numRows).map(line => line.split(" "));
        this.currentLinePointer += numRows;
        return asStrings ? matrixData : matrixData.map(row => row.map(Number));
    }

    retrieveRows(numRows, asStrings = false) {
        const rowData = this.lines.slice(this.currentLinePointer, this.currentLinePointer + numRows);
        this.currentLinePointer += numRows;
        return asStrings ? rowData : rowData.map(Number);
    }
}

const createInputReader = (inputContent) => {
    const processorInstance = new InputProcessor(inputContent);
    return {
        a: (asString) => processorInstance.retrieveToken(asString),
        l: (asStrings) => processorInstance.retrieveLine(asStrings),
        m: (numRows, asStrings) => processorInstance.retrieveMatrix(numRows, asStrings),
        r: (numRows, asStrings) => processorInstance.retrieveRows(numRows, asStrings),
    };
};

const constructMultiArray = (initialFillValue, ...dimensions) => {
    const buildRecursive = (dims, currentDimensionIndex) => {
        if (currentDimensionIndex === dims.length - 1) {
            return Array(dims[currentDimensionIndex]).fill(initialFillValue);
        } else {
            return Array(dims[currentDimensionIndex]).fill(0).map(() => buildRecursive(dims, currentDimensionIndex + 1));
        }
    };
    return buildRecursive(dimensions, 0);
};

const inputHandler = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(executeProblemSolution());

function executeProblemSolution() {
    const elementCount = inputHandler.a();
    const initialValues = inputHandler.l();
    return calculateMinimumCost(elementCount, initialValues);
}

function calculateMinimumCost(numElements, valuesArray) {
    const prefixSums = [0];
    valuesArray.forEach(val => prefixSums.push(prefixSums[prefixSums.length - 1] + val));

    const segmentCostMatrix = Array.from({ length: numElements }, (_, i) =>
        Array.from({ length: numElements - i }, (_, j) => {
            return prefixSums[j + i + 1] - prefixSums[j];
        })
    );

    const dpTable = Array.from({ length: numElements }, (_, i) =>
        Array.from({ length: numElements - i }, (_, j) => (i === 0 ? 0 : Infinity))
    );

    Array.from({ length: numElements - 1 }).forEach((_, i_index) => {
        const currentSegmentLengthMinusOne = i_index + 1;
        Array.from({ length: numElements - currentSegmentLengthMinusOne }).forEach((_, j_start) => {
            Array.from({ length: currentSegmentLengthMinusOne }).forEach((_, k_index) => {
                const splitPointLength = k_index + 1;

                const firstPartLengthMinusOne = currentSegmentLengthMinusOne - splitPointLength;
                const secondPartLengthMinusOne = splitPointLength - 1;
                const secondPartStartIndex = j_start + currentSegmentLengthMinusOne - splitPointLength + 1;

                const candidateTotalCost =
                    dpTable[firstPartLengthMinusOne][j_start] +
                    dpTable[secondPartLengthMinusOne][secondPartStartIndex] +
                    segmentCostMatrix[currentSegmentLengthMinusOne][j_start];

                if (candidateTotalCost < dpTable[currentSegmentLengthMinusOne][j_start]) {
                    dpTable[currentSegmentLengthMinusOne][j_start] = candidateTotalCost;
                }
            });
        });
    });

    return dpTable[numElements - 1][0];
}
