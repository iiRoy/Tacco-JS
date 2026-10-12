const InputParserFactory = (() => {
    class InputParser {
        constructor(sourceString) {
            this.sourceLines = sourceString.trim().split('\n');
            this.currentLineIndex = 0;
        }

        readNextValue(asString) {
            let lineParts = this.sourceLines[this.currentLineIndex];
            if (typeof lineParts === 'string') {
                lineParts = lineParts.split(' ').reverse();
                this.sourceLines[this.currentLineIndex] = lineParts;
            }

            const extractedVal = lineParts.pop();
            if (!lineParts.length) {
                this.currentLineIndex++;
            }
            return asString ? extractedVal : Number(extractedVal);
        }

        readLineOfValues(asStrings) {
            const lineContent = this.sourceLines[this.currentLineIndex++];
            const values = lineContent.split(' ');
            return asStrings ? values : values.map(Number);
        }

        readMatrix(numRows, asStrings) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
            this.currentLineIndex += numRows;
            const parsedMatrix = matrixRows.map(row => row.split(' '));
            return asStrings ? parsedMatrix : parsedMatrix.map(row => row.map(Number));
        }

        readRawLines(numLines, asStrings) {
            const rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
            this.currentLineIndex += numLines;
            return asStrings ? rawLines : rawLines.map(Number);
        }
    }

    return (inputString) => new InputParser(inputString);
})();

const parserInstance = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveProblem());

function solveProblem() {
    const countN = parserInstance.readNextValue();
    const inputNumbers = parserInstance.readLineOfValues();

    const createFrequencyMap = (numbersArray) => {
        const freqMap = {};
        for (const num of numbersArray) {
            freqMap[num] = (freqMap[num] || 0) + 1;
        }
        return freqMap;
    };

    const numberCounts = createFrequencyMap(inputNumbers);

    inputNumbers.sort((valA, valB) => valB - valA);

    const generatePowersOfTwo = (maxInputVal) => {
        const powers = [2];
        let currentPower = 2;
        let powerIndex = 0;
        while (currentPower <= maxInputVal) {
            currentPower *= 2;
            powers.push(currentPower);
            powerIndex++;
        }
        return { powersArray: powers, initialPowerIndex: powerIndex };
    };

    const { powersArray, initialPowerIndex } = generatePowersOfTwo(inputNumbers[0]);
    let currentPowerIndex = initialPowerIndex;

    let resultCount = 0;

    for (let loopIterator = 0; loopIterator < countN; loopIterator++) {
        const currentNumber = inputNumbers[loopIterator];

        if (numberCounts[currentNumber] <= 0) {
            continue;
        }

        numberCounts[currentNumber]--;

        while (currentPowerIndex > 0 && powersArray[currentPowerIndex - 1] >= currentNumber) {
            currentPowerIndex--;
        }

        const targetComplement = powersArray[currentPowerIndex] - currentNumber;

        if (numberCounts[targetComplement] && numberCounts[targetComplement] > 0) {
            numberCounts[targetComplement]--;
            resultCount++;
        }
    }
    return resultCount;
}
