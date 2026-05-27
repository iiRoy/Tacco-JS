const createInputParser = (function() {
    class InputReader {
        constructor(sourceString) {
            this.sourceLines = sourceString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        readNextValue(returnAsString = false) {
            const lines = this.sourceLines;
            let lineIdx = this.currentLineIndex;
            let currentLineTokens;

            if (typeof lines[lineIdx] === "string") {
                lines[lineIdx] = lines[lineIdx].split(" ").reverse();
            }
            currentLineTokens = lines[lineIdx];

            const extractedValue = currentLineTokens.pop();

            if (currentLineTokens.length === 0) {
                this.currentLineIndex++;
            }

            return returnAsString ? extractedValue : +extractedValue;
        }

        readLineValues(returnAsStrings = false) {
            const lineContent = this.sourceLines[this.currentLineIndex++];
            const values = lineContent.split(" ");
            return returnAsStrings ? values : values.map(val => +val);
        }

        readMatrix(numRows, returnAsStrings = false) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
            this.currentLineIndex += numRows;
            const parsedMatrix = matrixRows.map(row => row.split(" "));
            return returnAsStrings ? parsedMatrix : parsedMatrix.map(row => row.map(val => +val));
        }

        readRows(numRows, returnAsStrings = false) {
            const rows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
            this.currentLineIndex += numRows;
            return returnAsStrings ? rows : rows.map(val => +val);
        }
    }

    return function(sourceString) {
        return new InputReader(sourceString);
    };
})();

function findLowerBound(sortedArray, startIndex, endIndex, targetValue) {
    let currentLow = startIndex;
    let currentHigh = endIndex;
    let pivotIndex;

    while (1 < currentHigh - currentLow) {
        pivotIndex = Math.floor((currentLow + currentHigh) / 2);
        if (sortedArray[pivotIndex] < targetValue) {
            currentLow = pivotIndex;
        } else {
            currentHigh = pivotIndex;
        }
    }
    return sortedArray[currentLow] < targetValue ? currentHigh : currentLow;
}

console.log(processMainLogic());

function processMainLogic() {
    const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

    const elementCount = inputReader.readNextValue();
    let arrayA = inputReader.readLineValues();
    let arrayB = inputReader.readLineValues();
    let finalResult = 0;

    function filterByOddCounts(inputArray, bitShift) {
        const frequencyMapSize = 1 << bitShift;
        const frequencyCounts = new Array(frequencyMapSize).fill(0);
        const reducedArray = [];

        for (let k = 0; k < inputArray.length; k++) {
            frequencyCounts[inputArray[k]]++;
        }

        for (let k = 0; k < frequencyMapSize; k++) {
            if (frequencyCounts[k] % 2 === 1) {
                reducedArray.push(k);
            }
        }
        return reducedArray;
    }

    arrayB.sort((val1, val2) => val1 - val2);

    for (let bitPosition = 28; bitPosition >= 0; bitPosition--) {
        const currentBitValue = 1 << bitPosition;
        const doubleBitValue = currentBitValue * 2;
        const tripleBitValue = currentBitValue * 3;
        const bitmask = currentBitValue - 1;

        let xorPairParityAccumulator = arrayA.length * arrayA.length;

        for (let arrayIndex = 0; arrayIndex < arrayA.length; arrayIndex++) {
            const valA = arrayA[arrayIndex];

            const boundIndex2 = findLowerBound(arrayB, 0, arrayB.length, doubleBitValue - valA);
            const boundIndex1 = findLowerBound(arrayB, 0, boundIndex2, currentBitValue - valA);
            const boundIndex3 = findLowerBound(arrayB, boundIndex2, arrayB.length, tripleBitValue - valA);
            
            xorPairParityAccumulator += -boundIndex3 + boundIndex2 - boundIndex1;
        }

        if (xorPairParityAccumulator % 2) {
            finalResult += currentBitValue;
        }

        arrayB = arrayB.map(val => val & bitmask);
        arrayA = arrayA.map(val => val & bitmask);

        if (bitPosition < 18) {
            arrayA = filterByOddCounts(arrayA, bitPosition);
            arrayB = filterByOddCounts(arrayB, bitPosition);
        } else {
            arrayB.sort((val1, val2) => val1 - val2);
        }
    }

    return finalResult;
}
