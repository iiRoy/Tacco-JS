const InputReaderFactory = (function () {
    function createInputReader(sourceString) {
        return new InputReader(sourceString);
    }

    function InputReader(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    // Helper to get and parse a value from the current line, advancing the internal pointer
    InputReader.prototype._extractAndParseValue = function (returnAsString) {
        const currentLineContent = this.sourceLines[this.currentLineIndex];
        if (typeof currentLineContent === "string") {
            // Split and reverse once per line to efficiently pop from the end
            this.sourceLines[this.currentLineIndex] = currentLineContent.split(" ").reverse();
        }
        const extractedValue = this.sourceLines[this.currentLineIndex].pop();
        if (!this.sourceLines[this.currentLineIndex].length) {
            this.currentLineIndex++;
        }
        return returnAsString ? extractedValue : Number(extractedValue);
    };

    // Reads a single value from the current line
    InputReader.prototype.readSingleValue = function (returnAsString = false) {
        return this._extractAndParseValue(returnAsString);
    };

    // Reads an entire line of values
    InputReader.prototype.readLineValues = function (returnAsString = false) {
        const lineContent = this.sourceLines[this.currentLineIndex++];
        const values = lineContent.split(" ");
        return returnAsString ? values : values.map(val => Number(val));
    };

    // Reads N lines as a matrix
    InputReader.prototype.readMatrix = function (numRows, returnAsString = false) {
        const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
        this.currentLineIndex += numRows;
        if (returnAsString) {
            return matrixRows.map(row => row.split(" "));
        } else {
            return matrixRows.map(row => row.split(" ").map(val => Number(val)));
        }
    };

    // Reads N lines as a flat array of values
    InputReader.prototype.readLinesAsArray = function (numLines, returnAsString = false) {
        const lines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
        this.currentLineIndex += numLines;
        return returnAsString ? lines : lines.map(val => Number(val));
    };

    return createInputReader;
})();

const inputProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let arrayCreationExpression = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationExpression = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationExpression + ")";
    }
    return eval(arrayCreationExpression);
}

function calculateGCD(numA, numB) {
    return numB ? calculateGCD(numB, numA % numB) : numA;
}

const calculateArrayGCD = (numbers) => {
    if (numbers.length === 0) return 0; // Or handle error, depending on expected input
    return numbers.reduce((accumulator, currentValue) => calculateGCD(accumulator, currentValue));
};

executeSolution();

function executeSolution() {
    const elementCount = inputProcessor.readSingleValue();
    let numberSequence = inputProcessor.readLinesAsArray(elementCount + 1);

    const greatestCommonDivisor = calculateArrayGCD(numberSequence);

    const foundPrimes = getPrimeFactors(Math.abs(greatestCommonDivisor));

    numberSequence = numberSequence.map(val => val / greatestCommonDivisor);

    let candidatePrimes;
    const lastSequenceElement = numberSequence[elementCount];
    if (lastSequenceElement === 0) {
        candidatePrimes = sievePrimes(elementCount);
    } else {
        candidatePrimes = getPrimeFactors(Math.abs(lastSequenceElement));
    }

    function verifyPrimeCondition(primeValue, totalElements, dataArray) {
        if (totalElements < primeValue) {
            return false;
        }
        const segmentLength = primeValue - 1;
        for (let segmentStart = 0; segmentStart < segmentLength; segmentStart++) {
            let currentSegmentSum = 0;
            for (let dataIndex = segmentStart; dataIndex < totalElements; dataIndex += segmentLength) {
                currentSegmentSum += dataArray[dataIndex];
            }
            if (currentSegmentSum % primeValue !== 0) {
                return false;
            }
        }
        return true;
    }

    for (const currentCandidate of candidatePrimes) {
        if (foundPrimes.has(currentCandidate) || elementCount < currentCandidate) {
            continue;
        }

        if (verifyPrimeCondition(currentCandidate, elementCount, numberSequence)) {
            foundPrimes.add(currentCandidate);
        }
    }

    if (foundPrimes.size > 0) {
        const sortedFoundPrimes = Array.from(foundPrimes).sort((pA, pB) => pA - pB);
        console.log(sortedFoundPrimes.join("\n"));
    }
}

function getPrimeFactors(numberToFactorize) {
    const primeFactorsSet = new Set();
    if (numberToFactorize <= 1) {
        return primeFactorsSet;
    }

    let remainingNumber = numberToFactorize;
    for (let currentDivisor = 2; currentDivisor * currentDivisor <= remainingNumber; currentDivisor++) {
        if (remainingNumber % currentDivisor === 0) {
            primeFactorsSet.add(currentDivisor);
            while (remainingNumber % currentDivisor === 0) {
                remainingNumber /= currentDivisor;
            }
        }
    }
    if (remainingNumber > 1) {
        primeFactorsSet.add(remainingNumber);
    }
    return primeFactorsSet;
}

function sievePrimes(upperLimit) {
    const isPrimeTracker = Array(upperLimit + 1).fill(true);
    const primeNumbersResult = new Set();

    if (upperLimit < 2) {
        return primeNumbersResult;
    }

    isPrimeTracker[0] = false;
    isPrimeTracker[1] = false;

    for (let p = 2; p <= upperLimit; p++) {
        if (isPrimeTracker[p]) {
            primeNumbersResult.add(p);
            for (let multiple = p * p; multiple <= upperLimit; multiple += p) {
                isPrimeTracker[multiple] = false;
            }
        }
    }
    return primeNumbersResult;
}
