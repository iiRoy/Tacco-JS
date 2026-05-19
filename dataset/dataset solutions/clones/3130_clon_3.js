const InputParserFactory = (() => {
    class InputParser {
        constructor(sourceString) {
            this.sourceLines = sourceString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        _parseValue(value, asString) {
            return asString ? value : +value;
        }

        readNextValue(asString) {
            let currentLineContent = this.sourceLines[this.currentLineIndex];
            if (typeof currentLineContent === "string") {
                this.sourceLines[this.currentLineIndex] = currentLineContent.split(" ").reverse();
            }
            let extractedValue = this.sourceLines[this.currentLineIndex].pop();
            if (!this.sourceLines[this.currentLineIndex].length) {
                this.currentLineIndex++;
            }
            return this._parseValue(extractedValue, asString);
        }

        readLineValues(asString) {
            const lineParts = this.sourceLines[this.currentLineIndex++].split(" ");
            return asString ? lineParts : lineParts.map(val => +val);
        }

        readMatrix(numRows, asString) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numRows).map(row => row.split(" "));
            return asString ? matrixRows : matrixRows.map(row => row.map(val => +val));
        }

        readRawLines(numLines, asString) {
            const lines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numLines);
            return asString ? lines : lines.map(line => +line);
        }
    }

    return (sourceString) => new InputParser(sourceString);
})();

const inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function countSetBitsInNumber(value, totalBits) {
    let setBitsCount = 0;
    for (let i = 0; i < totalBits; i++) {
        if ((value >> i) & 1) {
            setBitsCount++;
        }
    }
    return setBitsCount;
}

function solveGrayCodeProblem() {
    const bitCount = inputReader.readNextValue();
    const initialA = inputReader.readNextValue();
    const initialB = inputReader.readNextValue();

    const totalSetBitsInInputs = countSetBitsInNumber(initialA, bitCount) + countSetBitsInNumber(initialB, bitCount);

    if (totalSetBitsInInputs % 2 === 0) {
        return "NO";
    }

    const totalResultArraySize = 1 << bitCount;
    const resultArray = new Array(totalResultArraySize);

    // This helper function generates the Gray code path recursively.
    // currentA: The current number in the path.
    // targetB: The target number to reach.
    // visitedMask: A bitmask indicating which bit positions have been "fixed" or visited.
    // startIndex: The starting index in the resultArray for this subproblem.
    const generateGrayCodePath = (currentA, targetB, visitedMask, startIndex) => {
        if (currentA === targetB) {
            resultArray[startIndex] = currentA;
            return;
        }

        const xorDifference = currentA ^ targetB;
        let nextAValue = currentA;
        let nextBValue = currentA;
        let firstZeroBitProcessed = false; // Flag to ensure only the first relevant zero-bit is flipped
        let firstOneBitProcessed = false;  // Flag to ensure only the first relevant one-bit is flipped
        let fixedBitsCounter = 0;

        for (let bitIndex = 0; bitIndex < bitCount; bitIndex++) {
            const currentBitMask = 1 << bitIndex;
            if (visitedMask & currentBitMask) {
                fixedBitsCounter++;
                continue;
            }

            if ((xorDifference & currentBitMask) === 0) { // Bit is the same in currentA and targetB
                if (!firstZeroBitProcessed) {
                    firstZeroBitProcessed = true;
                    nextAValue ^= currentBitMask; // Flip this bit for nextAValue
                    nextBValue ^= currentBitMask; // Flip this bit for nextBValue
                }
            } else { // Bit is different in currentA and targetB
                if (!firstOneBitProcessed) {
                    firstOneBitProcessed = true;
                    nextBValue ^= currentBitMask; // Flip this bit for nextBValue
                    visitedMask |= currentBitMask; // Mark this bit as visited for the next recursive call
                }
            }
        }
        
        // Recursive calls for the two subproblems
        generateGrayCodePath(currentA, nextAValue, visitedMask, startIndex);
        const offsetForNextSubproblem = 1 << (bitCount - fixedBitsCounter - 1);
        generateGrayCodePath(nextBValue, targetB, visitedMask, startIndex + offsetForNextSubproblem);
    };

    generateGrayCodePath(initialA, initialB, 0, 0);

    console.log("YES");
    return resultArray.join(" ");
}

console.log(solveGrayCodeProblem());
