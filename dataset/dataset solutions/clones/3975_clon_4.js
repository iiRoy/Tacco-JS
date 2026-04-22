class DataStreamIterator {
    #sourceLines;
    #currentLineIndex;
    #lineTokens;
    #tokenIndex;

    constructor(fullInputString) {
        this.#sourceLines = fullInputString.trim().split("\n");
        this.#currentLineIndex = 0;
        this.#lineTokens = [];
        this.#tokenIndex = 0;
    }

    #ensureLineTokensLoaded() {
        if (this.#tokenIndex >= this.#lineTokens.length) {
            if (this.#currentLineIndex >= this.#sourceLines.length) {
                throw new Error("End of input stream reached.");
            }
            this.#lineTokens = this.#sourceLines[this.#currentLineIndex++].trim().split(" ");
            this.#tokenIndex = 0;
        }
    }

    extractNumericAtom(returnAsString = false) {
        this.#ensureLineTokensLoaded();
        const value = this.#lineTokens[this.#tokenIndex++];
        return returnAsString ? value : +value;
    }

    fetchLineAsNumbers(returnAsString = false) {
        if (this.#currentLineIndex >= this.#sourceLines.length) {
            throw new Error("End of input stream reached.");
        }
        this.#lineTokens = []; // Reset token state for extractNumericAtom
        this.#tokenIndex = 0;

        const line = this.#sourceLines[this.#currentLineIndex++].trim().split(" ");
        return returnAsString ? line : line.map(Number);
    }

    fetchMatrixSlice(numRows, returnAsString = false) {
        if (this.#currentLineIndex + numRows > this.#sourceLines.length) {
            throw new Error("Not enough rows for matrix slice.");
        }
        this.#lineTokens = []; // Reset token state
        this.#tokenIndex = 0;

        const slice = this.#sourceLines.slice(this.#currentLineIndex, this.#currentLineIndex + numRows);
        this.#currentLineIndex += numRows;
        return returnAsString ?
            slice.map(l => l.trim().split(" ")) :
            slice.map(l => l.trim().split(" ").map(Number));
    }

    fetchVectorSlice(numElements, returnAsString = false) {
        if (this.#currentLineIndex + numElements > this.#sourceLines.length) {
            throw new Error("Not enough rows for vector slice.");
        }
        this.#lineTokens = []; // Reset token state
        this.#tokenIndex = 0;

        const slice = this.#sourceLines.slice(this.#currentLineIndex, this.#currentLineIndex + numElements);
        this.#currentLineIndex += numElements;
        return returnAsString ? slice : slice.map(Number);
    }
}

function locateFloorIndex(dataCollection, startIdx, endIdx, targetValue) {
    if (startIdx >= endIdx) {
        return startIdx;
    }
    const midIdx = startIdx + Math.floor((endIdx - startIdx) / 2);
    if (dataCollection[midIdx] < targetValue) {
        return locateFloorIndex(dataCollection, midIdx + 1, endIdx, targetValue);
    } else {
        return locateFloorIndex(dataCollection, startIdx, midIdx, targetValue);
    }
}

function filterOddOccurrences(inputNumericArray) {
    const valueCounts = new Map();
    for (const val of inputNumericArray) {
        valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
    }
    const filteredValues = [];
    for (const [val, count] of valueCounts.entries()) {
        if (count % 2 !== 0) {
            filteredValues.push(val);
        }
    }
    return filteredValues.sort((valA, valB) => valA - valB);
}

function calculateAggregateSum() {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputReader = new DataStreamIterator(rawInput);

    const countElements = inputReader.extractNumericAtom();
    let firstArray = inputReader.fetchLineAsNumbers();
    let secondArray = inputReader.fetchLineAsNumbers();
    let finalResult = 0;

    for (let bitPosition = 28; bitPosition >= 0; bitPosition--) {
        const currentBitVal = 1 << bitPosition;
        const doubleBitVal = currentBitVal * 2;
        const tripleBitVal = currentBitVal * 3;
        const bitMask = currentBitVal - 1;

        let parityAccumulator = countElements * countElements;

        secondArray.sort((valA, valB) => valA - valB);

        for (let elementIndex = 0; elementIndex < countElements; elementIndex++) {
            const currentAVal = firstArray[elementIndex];

            const idxBoundary2 = locateFloorIndex(secondArray, 0, countElements, doubleBitVal - currentAVal);
            const idxBoundary1 = locateFloorIndex(secondArray, 0, idxBoundary2, currentBitVal - currentAVal);
            const idxBoundary3 = locateFloorIndex(secondArray, idxBoundary2, countElements, tripleBitVal - currentAVal);

            parityAccumulator += -idxBoundary3 + idxBoundary2 - idxBoundary1;
        }

        if (parityAccumulator % 2 !== 0) {
            finalResult += currentBitVal;
        }

        secondArray = secondArray.map(val => val & bitMask);
        if (bitPosition < 18) {
            secondArray = filterOddOccurrences(secondArray);
        }
        firstArray = firstArray.map(val => val & bitMask);
    }
    return finalResult;
}

console.log(calculateAggregateSum());