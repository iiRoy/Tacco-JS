const createInputProcessor = (sourceContent) => {
    let lineSegments = sourceContent.trim().split('\n').map(line => line.split(' '));
    let currentLineIndex = 0;
    let segmentPosition = 0;

    const retrieveNextNumber = () => {
        if (currentLineIndex >= lineSegments.length) {
            throw new Error("Input exhausted.");
        }
        while (segmentPosition >= lineSegments[currentLineIndex].length) {
            currentLineIndex++;
            segmentPosition = 0;
            if (currentLineIndex >= lineSegments.length) {
                throw new Error("Input exhausted while seeking next number.");
            }
        }

        const numericValue = Number(lineSegments[currentLineIndex][segmentPosition]);
        segmentPosition++;
        return numericValue;
    };

    const retrieveLineAsNumbers = () => {
        if (currentLineIndex >= lineSegments.length) {
            throw new Error("Input exhausted.");
        }
        const numbersInLine = lineSegments[currentLineIndex].map(Number);
        currentLineIndex++;
        segmentPosition = 0;
        return numbersInLine;
    };

    return {
        fetchNumber: retrieveNextNumber,
        fetchLineNumbers: retrieveLineAsNumbers,
    };
};

const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataStream = createInputProcessor(rawInputData);

const determineSmallestPowerOfTwo = (value) => {
    if (value <= 0) return 2;
    let currentPower = 1;
    while (currentPower < value) {
        currentPower *= 2;
    }
    return Math.max(2, currentPower);
};

function processPairs() {
    const totalElements = dataStream.fetchNumber();
    const inputNumbers = dataStream.fetchLineNumbers();

    const elementCounts = new Map();
    for (const num of inputNumbers) {
        elementCounts.set(num, (elementCounts.get(num) || 0) + 1);
    }

    let matchedPairs = 0;
    const uniqueSortedNumbers = Array.from(elementCounts.keys()).sort((valA, valB) => valB - valA);

    for (const currentNumber of uniqueSortedNumbers) {
        while (elementCounts.get(currentNumber) > 0) {
            elementCounts.set(currentNumber, elementCounts.get(currentNumber) - 1);

            const requiredSum = determineSmallestPowerOfTwo(currentNumber);
            const neededPartner = requiredSum - currentNumber;

            if (neededPartner > 0 && elementCounts.has(neededPartner) && elementCounts.get(neededPartner) > 0) {
                elementCounts.set(neededPartner, elementCounts.get(neededPartner) - 1);
                matchedPairs++;
            }
        }
    }
    return matchedPairs;
}

console.log(processPairs());
