class InputParser {
    constructor(rawInputString) {
        this._inputLines = rawInputString.trim().split("\n");
        this._currentLineIndex = 0;
        this._currentLineTokens = [];
    }

    readNextToken(asString) {
        if (this._currentLineTokens.length === 0) {
            if (this._currentLineIndex >= this._inputLines.length) {
                return undefined;
            }
            this._currentLineTokens = this._inputLines[this._currentLineIndex].split(" ").reverse();
        }

        const token = this._currentLineTokens.pop();
        if (this._currentLineTokens.length === 0) {
            this._currentLineIndex++;
        }
        return asString ? token : +token;
    }

    readLineTokens(asString) {
        if (this._currentLineIndex >= this._inputLines.length) {
            return undefined;
        }
        const line = this._inputLines[this._currentLineIndex++];
        const tokens = line.split(" ");
        return asString ? tokens : tokens.map(val => +val);
    }

    readMatrix(numRows, asString) {
        const matrixRows = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
        this._currentLineIndex += numRows;
        const parsedMatrix = matrixRows.map(rowStr => rowStr.split(" "));
        return asString ? parsedMatrix : parsedMatrix.map(row => row.map(val => +val));
    }

    readLinesAsNumbers(numLines, asString) {
        const lines = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex + numLines);
        this._currentLineIndex += numLines;
        return asString ? lines : lines.map(val => +val);
    }
}

const createInputParser = (inputString) => new InputParser(inputString);

const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
    function buildArrayRecursively(dims, currentDimIndex) {
        if (currentDimIndex === dims.length - 1) {
            return Array(dims[currentDimIndex]).fill(initialValue);
        }
        return Array(dims[currentDimIndex]).fill(null).map(() => buildArrayRecursively(dims, currentDimIndex + 1));
    }
    if (dimensions.length === 0) {
        return initialValue;
    }
    return buildArrayRecursively(dimensions, 0);
}

const moduloConstant = 1e9 + 7;

console.log(main());

function main() {
    const lenS = inputReader.readNextToken();
    const lenT = inputReader.readNextToken();
    const arrayS = inputReader.readLineTokens();
    const arrayT = inputReader.readLineTokens();

    const applyModulo = (value) => {
        return (value % moduloConstant + moduloConstant) % moduloConstant;
    };

    const dynamicProgrammingTable = createMultiDimArray(0, lenS + 1, lenT + 1);

    let totalSubsequences = 1;

    for (let idxS = 0; idxS < lenS; idxS++) {
        for (let idxT = 0; idxT < lenT; idxT++) {
            const currentSIndex = idxS;
            const currentTIndex = idxT;
            const nextSIndex = idxS + 1;
            const nextTIndex = idxT + 1;

            let currentDpValue;

            if (arrayS[currentSIndex] === arrayT[currentTIndex]) {
                const subsequencesFromPreviousMatch = dynamicProgrammingTable[currentSIndex][currentTIndex];
                totalSubsequences = applyModulo(totalSubsequences + subsequencesFromPreviousMatch + 1);

                const valFromLeft = dynamicProgrammingTable[nextSIndex][currentTIndex];
                const valFromAbove = dynamicProgrammingTable[currentSIndex][nextTIndex];
                currentDpValue = applyModulo(valFromLeft + valFromAbove + 1);
            } else {
                const valFromLeft = dynamicProgrammingTable[nextSIndex][currentTIndex];
                const valFromAbove = dynamicProgrammingTable[currentSIndex][nextTIndex];
                const valFromDiagonal = dynamicProgrammingTable[currentSIndex][currentTIndex];
                currentDpValue = applyModulo(valFromLeft + valFromAbove - valFromDiagonal);
            }
            dynamicProgrammingTable[nextSIndex][nextTIndex] = currentDpValue;
        }
    }
    return totalSubsequences;
}
