"use strict";

const InputProcessor = (function() {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    const tokenBuffer = rawInputData.split(/ |\n/);
    let currentTokenIndex = 0;

    function getNextToken(isString) {
        const tokenValue = tokenBuffer[currentTokenIndex++];
        return isString ? tokenValue : +tokenValue;
    }

    function getTokensArray(count, isString) {
        const tokensSlice = tokenBuffer.slice(currentTokenIndex, currentTokenIndex + count);
        currentTokenIndex += count;
        return isString ? tokensSlice : tokensSlice.map(val => +val);
    }

    function getMatrix(height, width, isString) {
        const resultMatrix = [];
        for (let row = 0; row < height; row++) {
            const rowTokens = tokenBuffer.slice(currentTokenIndex, currentTokenIndex + width);
            currentTokenIndex += width;
            resultMatrix.push(isString ? rowTokens : rowTokens.map(val => +val));
        }
        return resultMatrix;
    }

    function createMultiDimensionalArray(initialValue) {
        const args = arguments;
        let numDimensions = args.length;
        let evalString = "Array(args[" + (--numDimensions) + "]).fill().map(x=>{return " + initialValue + ";})";
        while (--numDimensions) {
            evalString = "Array(args[" + numDimensions + "]).fill().map(x=>" + evalString + ")";
        }
        return eval(evalString);
    }

    return {
        readNext: getNextToken,
        readArray: getTokensArray,
        readMatrix: getMatrix,
        createMultiDim: createMultiDimensionalArray
    };
})();

function FenwickTree(size) {
    this.treeData = Array(size + 1).fill(0);
}

FenwickTree.prototype.updateValue = function(value, index) {
    for (; index < this.treeData.length; index += index & -index) {
        this.treeData[index] += value;
    }
};

FenwickTree.prototype.queryPrefixSum = function(index) {
    let sumResult = 0;
    for (; index > 0; index -= index & -index) {
        sumResult += this.treeData[index];
    }
    return sumResult;
};

const ALPHABET_SIZE = 26;
function getCharAlphabetIndex(char) {
    return char.charCodeAt(0) - 97;
}

function executeProgram() {
    const stringLength = InputProcessor.readNext();
    const initialString = InputProcessor.readNext(true);
    const numQueries = InputProcessor.readNext();

    const charFenwickTrees = Array.from({ length: ALPHABET_SIZE }, () => new FenwickTree(stringLength));

    for (let charPos = 0; charPos < stringLength; charPos++) {
        const charIndex = getCharAlphabetIndex(initialString[charPos]);
        charFenwickTrees[charIndex].updateValue(1, charPos + 1);
    }

    const resultLines = [];

    for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        const queryType = InputProcessor.readNext();

        if (queryType === 1) {
            const positionToUpdate = InputProcessor.readNext();
            const newCharacter = InputProcessor.readNext(true);

            const oldCharValue = initialString[positionToUpdate - 1];
            const oldCharAlphabetIndex = getCharAlphabetIndex(oldCharValue);
            const newCharAlphabetIndex = getCharAlphabetIndex(newCharacter);

            charFenwickTrees[oldCharAlphabetIndex].updateValue(-1, positionToUpdate);
            charFenwickTrees[newCharAlphabetIndex].updateValue(1, positionToUpdate);
        } else {
            const rangeLeft = InputProcessor.readNext() - 1;
            const rangeRight = InputProcessor.readNext();

            let distinctCharCount = 0;

            for (let alphabetIdx = 0; alphabetIdx < ALPHABET_SIZE; alphabetIdx++) {
                const countInRange = charFenwickTrees[alphabetIdx].queryPrefixSum(rangeRight) -
                                     charFenwickTrees[alphabetIdx].queryPrefixSum(rangeLeft);
                if (countInRange > 0) {
                    distinctCharCount++;
                }
            }
            resultLines.push(distinctCharCount);
        }
    }
    return resultLines.join("\n");
}

const programOutput = executeProgram();
if (programOutput !== undefined) {
    console.log(programOutput);
}
