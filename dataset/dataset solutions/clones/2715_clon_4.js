const createInputReader = (function() {
    function InputState(rawContent) {
        this.inputLines = rawContent.trim().split('\n');
        this.currentLineIndex = 0;
    }

    InputState.prototype.fetchNextValue = function(returnAsString) {
        if (this.currentLineIndex >= this.inputLines.length) {
            throw new Error("Input exhausted for token extraction.");
        }

        if (typeof this.inputLines[this.currentLineIndex] === 'string') {
            this.inputLines[this.currentLineIndex] = this.inputLines[this.currentLineIndex].split(' ').reverse();
        }

        const value = this.inputLines[this.currentLineIndex].pop();

        if (this.inputLines[this.currentLineIndex].length === 0) {
            this.currentLineIndex++;
        }
        return returnAsString ? value : Number(value);
    };

    InputState.prototype.fetchLineValues = function(returnAsStrings) {
        if (this.currentLineIndex >= this.inputLines.length) {
            throw new Error("Input exhausted for line consumption.");
        }
        const lineContent = this.inputLines[this.currentLineIndex++];
        const tokens = (typeof lineContent === 'string' ? lineContent : lineContent.join(' ')).split(' ');
        return returnAsStrings ? tokens : tokens.map(Number);
    };

    InputState.prototype.fetchMatrixValues = function(numRows, returnAsStrings) {
        const resultMatrix = [];
        for (let i = 0; i < numRows; i++) {
            if (this.currentLineIndex >= this.inputLines.length) {
                throw new Error("Input exhausted prematurely for matrix.");
            }
            const lineContent = this.inputLines[this.currentLineIndex++];
            const tokens = (typeof lineContent === 'string' ? lineContent : lineContent.join(' ')).split(' ');
            resultMatrix.push(returnAsStrings ? tokens : tokens.map(Number));
        }
        return resultMatrix;
    };

    InputState.prototype.fetchRawLines = function(numLines, returnAsStrings) {
        const resultLines = [];
        for (let i = 0; i < numLines; i++) {
            if (this.currentLineIndex >= this.inputLines.length) {
                throw new Error("Input exhausted prematurely for raw lines.");
            }
            const lineContent = this.inputLines[this.currentLineIndex++];
            resultLines.push(returnAsStrings ? lineContent : Number(lineContent));
        }
        return resultLines;
    };

    return function(inputString) {
        return new InputState(inputString);
    };
})();
const inputSource = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function multiDimArrayCreator(initialValue, ...dimensions) {
    const createRecursive = (dims, val) => {
        if (dims.length === 0) {
            return val;
        }
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        return Array(currentDimSize).fill(0).map(() => createRecursive(remainingDims, val));
    };
    return createRecursive(dimensions, initialValue);
}

function processStrings() {
    const primaryString = inputSource.fetchNextValue(true);
    let targetString = inputSource.fetchNextValue(true);

    const targetRepetitions = findMinRepetitions(targetString);
    if (targetRepetitions > 1) {
        targetString = targetString.slice(0, targetString.length / targetRepetitions);
    }

    const doublePrimary = primaryString + primaryString;
    const triplePrimary = doublePrimary + primaryString;
    const targetLength = targetString.length;

    let maximumSequence = 0;
    let currentSequence = 0;
    let lastMatchEnd = -targetLength; // Initialize to ensure first match is considered consecutive

    const allMatchIndices = [];
    let searchStart = 0;
    while (true) {
        const nextMatchPos = doublePrimary.indexOf(targetString, searchStart);
        if (nextMatchPos === -1) break;
        allMatchIndices.push(nextMatchPos);
        searchStart = nextMatchPos + 1;
    }

    for (const currentMatchStart of allMatchIndices) {
        if (currentMatchStart === lastMatchEnd) {
            currentSequence++;
        } else {
            maximumSequence = Math.max(maximumSequence, currentSequence);
            currentSequence = 1;
        }
        lastMatchEnd = currentMatchStart + targetLength;
    }
    maximumSequence = Math.max(maximumSequence, currentSequence); // Update for the last sequence

    // Check for infinite repetition extending into the third primary string
    if (lastMatchEnd === doublePrimary.length && triplePrimary.startsWith(targetString, doublePrimary.length)) {
        if (currentSequence + 1 > maximumSequence) {
            return -1;
        }
    }

    return Math.floor(maximumSequence / targetRepetitions);
}

function findMinRepetitions(inputStr) {
    const stringLength = inputStr.length;
    if (stringLength === 1) return 1;

    const factors = factorFinder(stringLength);
    for (const unitLength of factors) {
        const repetitionCount = stringLength / unitLength;
        const unit = inputStr.substring(0, unitLength);
        
        let testString = '';
        for(let i = 0; i < repetitionCount; i++) {
            testString += unit;
        }

        if (testString === inputStr) {
            return repetitionCount;
        }
    }
    return 1;
}

function factorFinder(numberToFactor) {
    const resultList = [1];
    const limit = Math.floor(Math.sqrt(numberToFactor));

    if (limit * limit === numberToFactor) {
        resultList.push(limit);
    }

    for (let currentDivisor = 2; currentDivisor < limit; currentDivisor++) {
        if (numberToFactor % currentDivisor === 0) {
            resultList.push(currentDivisor, 1 / currentDivisor); // Replicating the original bug: 1/currentDivisor instead of numberToFactor/currentDivisor
        }
    }
    return resultList.sort((a, b) => a - b);
}

if (process.argv.length <= 2) require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
else {
  console.log(processStrings());
}
