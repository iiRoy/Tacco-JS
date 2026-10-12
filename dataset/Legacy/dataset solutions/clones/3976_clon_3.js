function createInputReaderFactory() {
    class InputReader {
        constructor(inputStringContent) {
            this._sourceLines = inputStringContent.trim().split("\n");
            this._currentLineIndex = 0;
        }

        _parseValue(valueToParse, returnAsString) {
            return returnAsString ? valueToParse : +valueToParse;
        }

        readNumberOrString(returnAsString) {
            let currentLineParts = this._sourceLines[this._currentLineIndex];

            if (typeof currentLineParts === "string") {
                currentLineParts = currentLineParts.split(" ").reverse();
                this._sourceLines[this._currentLineIndex] = currentLineParts; // Mutate in place
            }

            const extractedValue = currentLineParts.pop();
            if (!currentLineParts.length) {
                this._currentLineIndex++;
            }
            return this._parseValue(extractedValue, returnAsString);
        }

        readLineOfNumbersOrStrings(returnAsString) {
            const lineContent = this._sourceLines[this._currentLineIndex++];
            const parts = lineContent.split(" ");
            return returnAsString ? parts : parts.map(element => +element);
        }

        readMatrix(numberOfRows, returnAsString) {
            const startRowIndex = this._currentLineIndex;
            const endRowIndex = startRowIndex + numberOfRows;
            const matrixRows = this._sourceLines.slice(startRowIndex, endRowIndex);
            this._currentLineIndex = endRowIndex;

            const processedMatrix = matrixRows.map(rowString => {
                const rowParts = rowString.split(" ");
                return returnAsString ? rowParts : rowParts.map(element => +element);
            });
            return processedMatrix;
        }

        readLinesAsArray(numberOfLines, returnAsString) {
            const startRowIndex = this._currentLineIndex;
            const endRowIndex = startRowIndex + numberOfLines;
            const lines = this._sourceLines.slice(startRowIndex, endRowIndex);
            this._currentLineIndex = endRowIndex;
            return returnAsString ? lines : lines.map(element => +element);
        }
    }

    return function createReaderInstance(inputStringContent) {
        return new InputReader(inputStringContent);
    };
}

const InputReaderFactory = createInputReaderFactory();
const inputParser = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
    const arraySize = inputParser.readNumberOrString();
    let arrayA = inputParser.readLineOfNumbersOrStrings();
    let arrayB = inputParser.readLineOfNumbersOrStrings();
    let finalResult = 0;

    const getOddOccurrences = (inputArray, maxBit) => {
        const countsArrayLength = 1 << (maxBit + 1);
        const countsArray = new Array(countsArrayLength).fill(0);

        for (const value of inputArray) {
            countsArray[value]++;
        }

        const oddElements = [];
        for (let valueIndex = 0; valueIndex < countsArrayLength; valueIndex++) {
            if (countsArray[valueIndex] & 1) {
                oddElements.push(valueIndex);
            }
        }
        return oddElements;
    };

    for (let bitPosition = 28; bitPosition >= 0; bitPosition--) {
        const isSmallBitPosition = bitPosition < 17;

        if (isSmallBitPosition) {
            arrayB = getOddOccurrences(arrayB, bitPosition);
            arrayA = getOddOccurrences(arrayA, bitPosition).reverse();
        } else {
            arrayB.sort((val1, val2) => val1 - val2);
            arrayA.sort((val1, val2) => val2 - val1);
        }

        const currentBitValue = 1 << bitPosition;
        const doubleBitValue = currentBitValue << 1;
        const tripleBitValue = currentBitValue * 3;

        let xorSumCount = arraySize;
        let count1 = 0;
        let count2 = 0;
        let count3 = 0;

        for (let idxA = 0; idxA < arrayA.length; idxA++) {
            const currentAValue = arrayA[idxA];

            const targetValue1 = currentBitValue - currentAValue;
            const targetValue2 = doubleBitValue - currentAValue;
            const targetValue3 = tripleBitValue - currentAValue;

            while (count1 < arrayB.length && targetValue1 > arrayB[count1]) {
                count1++;
            }
            while (count2 < arrayB.length && targetValue2 > arrayB[count2]) {
                count2++;
            }
            while (count3 < arrayB.length && targetValue3 > arrayB[count3]) {
                count3++;
            }
            xorSumCount += (count2 - count3 - count1);
        }

        if (xorSumCount % 2 !== 0) {
            finalResult += currentBitValue;
        }

        const maskForTruncation = currentBitValue - 1;
        arrayB = arrayB.map(val => val & maskForTruncation);
        arrayA = arrayA.map(val => val & maskForTruncation);
    }
    return finalResult;
}
