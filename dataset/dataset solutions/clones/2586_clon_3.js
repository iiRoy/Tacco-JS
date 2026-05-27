const InputReaderFactory = (function () {
    class InputReader {
        constructor(sourceString) {
            this._sourceLines = sourceString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        _extractAndAdvance(isString) {
            let currentLineContent = this._sourceLines[this._currentLineIndex];
            if (typeof currentLineContent === "string") {
                this._sourceLines[this._currentLineIndex] = currentLineContent.split(" ").reverse();
            }
            let extractedValue = this._sourceLines[this._currentLineIndex].pop();
            if (!this._sourceLines[this._currentLineIndex].length) {
                this._currentLineIndex++;
            }
            return isString ? extractedValue : +extractedValue;
        }

        readNextValue(isString = false) {
            return this._extractAndAdvance(isString);
        }

        readLineValues(isString = false) {
            const lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
            return isString ? lineContent : lineContent.map(val => +val);
        }

        readMatrix(numRows, isString = false) {
            const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(line => line.split(" "));
            return isString ? matrixRows : matrixRows.map(row => row.map(val => +val));
        }

        readRawLines(numRows, isString = false) {
            const rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
            return isString ? rawLines : rawLines.map(val => +val);
        }
    }

    function createReader(sourceString) {
        return new InputReader(sourceString);
    }

    return createReader;
})();

const inputHandler = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const dimensions = Array.prototype.slice.call(arguments, 1);
    let currentDimIndex = dimensions.length - 1;
    let arrayCreationString = `Array(dimensions[${currentDimIndex}]).fill(0).map(x=>{return ${initialValue};})`;

    while (--currentDimIndex >= 0) {
        arrayCreationString = `Array(dimensions[${currentDimIndex}]).fill(0).map(x=>${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

let numElements, sortedValues, visitedStates;

console.log(executeMainLogic());

function executeMainLogic() {
    numElements = inputHandler.readNextValue();
    const rawInputValues = inputHandler.readLineValues();
    sortedValues = rawInputValues.sort((valA, valB) => valB - valA);

    const arrayCapacity = 1 << numElements;
    visitedStates = createMultiDimArray(0, arrayCapacity);
    visitedStates[0] = 1;

    const initialBranchState = [[sortedValues[0], 1]];
    const finalResult = performBfs(initialBranchState);
    return finalResult === 1 ? "Yes" : "No";
}

function performBfs(currentBranch) {
    const branchCount = currentBranch.length;
    const totalStatesCount = visitedStates.length;

    if (branchCount === totalStatesCount) {
        return 1;
    }

    let nextIterationQueue = currentBranch.slice();
    let searchStartIndex = 1;

    for (let branchElementIndex = 0; branchElementIndex < branchCount; branchElementIndex++) {
        const currentElement = currentBranch[branchElementIndex];
        const currentElementValue = currentElement[0];
        const currentElementSearchPos = currentElement[1];

        if (searchStartIndex < currentElementSearchPos) {
            searchStartIndex = currentElementSearchPos;
        }

        while (searchStartIndex < totalStatesCount) {
            const isStateVisited = visitedStates[searchStartIndex];
            if (isStateVisited) {
                searchStartIndex++;
                continue;
            }

            const candidateValue = sortedValues[searchStartIndex];
            if (candidateValue < currentElementValue) {
                break;
            }
            searchStartIndex++;
        }

        if (searchStartIndex === totalStatesCount) {
            return 0;
        }

        visitedStates[searchStartIndex] = 1;

        const newBranchValue = sortedValues[searchStartIndex];
        const newBranchIndex = searchStartIndex + 1;
        nextIterationQueue.push([newBranchValue, newBranchIndex]);
    }

    const sortQueueByValueDesc = (itemA, itemB) => itemB[0] - itemA[0];
    const sortedNextIterationQueue = nextIterationQueue.sort(sortQueueByValueDesc);

    return performBfs(sortedNextIterationQueue);
}
