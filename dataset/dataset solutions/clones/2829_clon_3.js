const InputDataParser = (function() {

    const safeNumberConversion = (inputVal) => {
        if (typeof inputVal === 'string' && inputVal.trim() === '') {
            return NaN;
        }
        return Number(inputVal);
    };

    function StreamReader(entireInputContent) {
        if (typeof entireInputContent !== 'string' || entireInputContent.trim().length === 0) {
            this.bufferedLines = [];
        } else {
            this.bufferedLines = entireInputContent.trim().split("\n");
        }
        this.currentLinePointer = 0;
        this.currentTokenBuffer = [];
    }

    StreamReader.prototype = {
        hasMoreLines: function() {
            return this.currentLinePointer < this.bufferedLines.length;
        },

        retrieveNextToken: function(shouldReturnRaw) {
            if (!this.hasMoreLines()) {
                return undefined;
            }

            if (this.currentTokenBuffer.length === 0) {
                const lineString = this.bufferedLines[this.currentLinePointer];
                this.currentTokenBuffer = lineString.split(" ").reverse();
            }

            if (this.currentTokenBuffer.length === 0) {
                this.currentLinePointer++;
                return this.retrieveNextToken(shouldReturnRaw);
            }

            const tokenValue = this.currentTokenBuffer.pop();

            if (this.currentTokenBuffer.length === 0) {
                this.currentLinePointer++;
            }

            return shouldReturnRaw ? tokenValue : safeNumberConversion(tokenValue);
        },

        fetchLineAsTokenArray: function(shouldReturnRawArray) {
            if (!this.hasMoreLines()) {
                return undefined;
            }

            const currentLine = this.bufferedLines[this.currentLinePointer++];
            this.currentTokenBuffer = [];

            const tokens = currentLine.split(" ");
            return shouldReturnRawArray ? tokens : tokens.map(safeNumberConversion);
        },

        acquireMatrixData: function(numLinesToRead, shouldReturnRawMatrix) {
            if (!Number.isInteger(numLinesToRead) || numLinesToRead <= 0) {
                console.error("Error: Invalid number of lines specified for matrix acquisition.");
                return undefined;
            }

            if (this.currentLinePointer + numLinesToRead > this.bufferedLines.length) {
                return undefined;
            }

            const linesForMatrix = this.bufferedLines.slice(
                this.currentLinePointer,
                this.currentLinePointer + numLinesToRead
            );
            this.currentLinePointer += numLinesToRead;
            this.currentTokenBuffer = [];

            return shouldReturnRawMatrix ?
                linesForMatrix.map(line => line.split(" ")) :
                linesForMatrix.map(line => line.split(" ").map(safeNumberConversion));
        },

        retrieveRawLines: function(numLinesToRead, shouldReturnNumericArray) {
            if (!Number.isInteger(numLinesToRead) || numLinesToRead <= 0) {
                console.error("Error: Invalid number of lines specified for raw line retrieval.");
                return undefined;
            }

            if (this.currentLinePointer + numLinesToRead > this.bufferedLines.length) {
                return undefined;
            }

            const rawLineSegments = this.bufferedLines.slice(
                this.currentLinePointer,
                this.currentLinePointer + numLinesToRead
            );
            this.currentLinePointer += numLinesToRead;
            this.currentTokenBuffer = [];

            return shouldReturnNumericArray ? rawLineSegments.map(safeNumberConversion) : rawLineSegments;
        }
    };

    return function createNewInputReader(inputStringContent) {
        return new StreamReader(inputStringContent);
    };
})();

function createInitializedGrid(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    if (dimensions.some(dim => !Number.isInteger(dim) || dim < 0)) {
        throw new Error("All dimensions for grid initialization must be non-negative integers.");
    }

    const buildNestedArray = (currentDimensionIndex) => {
        if (currentDimensionIndex === dimensions.length - 1) {
            return Array(dimensions[currentDimensionIndex]).fill(initialValue);
        } else {
            return Array(dimensions[currentDimensionIndex]).fill(null).map(() =>
                buildNestedArray(currentDimensionIndex + 1)
            );
        }
    };

    return buildNestedArray(0);
}

const MODULUS_PRIME = 1000000007;

const applyModulo = (value) => {
    return (value % MODULUS_PRIME + MODULUS_PRIME) % MODULUS_PRIME;
};

console.log(executeMainAlgorithm());

function executeMainAlgorithm() {
    let fileSystemAccess;
    try {
        fileSystemAccess = require("fs");
    } catch (error) {
        console.error("Runtime Error: The 'fs' module is required but could not be loaded. Ensure this script runs in a Node.js environment.");
        process.exit(1);
    }

    const standardInputContent = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
    const inputDataSource = InputDataParser(standardInputContent);

    const sequenceALength = inputDataSource.retrieveNextToken();
    const sequenceBLength = inputDataSource.retrieveNextToken();

    if (sequenceALength === undefined || sequenceBLength === undefined ||
        !Number.isInteger(sequenceALength) || !Number.isInteger(sequenceBLength) ||
        sequenceALength < 0 || sequenceBLength < 0) {
        console.error("Input Error: Invalid or missing sequence length parameters. Expected non-negative integers.");
        return 0;
    }

    const sequenceA = inputDataSource.fetchLineAsTokenArray();
    const sequenceB = inputDataSource.fetchLineAsTokenArray();

    if (!Array.isArray(sequenceA) || sequenceA.length !== sequenceALength ||
        !Array.isArray(sequenceB) || sequenceB.length !== sequenceBLength) {
        console.error("Input Error: Sequence data does not match declared lengths or is malformed.");
        return 0;
    }

    const dpTable = createInitializedGrid(0, sequenceALength + 1, sequenceBLength + 1);

    let totalUniqueCommonSubsequences = 1;

    for (let idxA = 0; idxA < sequenceALength; ++idxA) {
        for (let idxB = 0; idxB < sequenceBLength; ++idxB) {
            const dpRowIndex = idxA + 1;
            const dpColIndex = idxB + 1;

            if (sequenceA[idxA] === sequenceB[idxB]) {
                const newSubsequencesFromMatch = dpTable[idxA][idxB];
                totalUniqueCommonSubsequences = applyModulo(totalUniqueCommonSubsequences + newSubsequencesFromMatch + 1);

                const valueFromAbove = dpTable[idxA][dpColIndex];
                const valueFromLeft = dpTable[dpRowIndex][idxB];
                dpTable[dpRowIndex][dpColIndex] = applyModulo(valueFromLeft + valueFromAbove + 1);
            } else {
                const valueFromAbove = dpTable[idxA][dpColIndex];
                const valueFromLeft = dpTable[dpRowIndex][idxB];
                const valueFromDiagonal = dpTable[idxA][idxB];

                dpTable[dpRowIndex][dpColIndex] = applyModulo(valueFromLeft + valueFromAbove - valueFromDiagonal);
            }
        }
    }

    return totalUniqueCommonSubsequences;
}