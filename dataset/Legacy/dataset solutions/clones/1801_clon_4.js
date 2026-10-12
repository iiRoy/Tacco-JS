function determineXorPossibility(countElements, xorTarget, valueArray, operationString) {
    let maximumValue = 0;
    for (let j = 0; j < countElements; j++) {
        maximumValue = Math.max(maximumValue, Number(valueArray[j]));
    }

    let xorSpaceSize = 1;
    while (xorSpaceSize <= maximumValue) {
        xorSpaceSize <<= 1;
    }

    let nextIterationStates = new Uint8Array(xorSpaceSize).fill(0);
    let currentIterationStates = new Uint8Array(xorSpaceSize).fill(0);

    nextIterationStates[0] = 1;

    for (let elementIndex = countElements - 1; elementIndex >= 0; elementIndex--) {
        const currentNumericValue = Number(valueArray[elementIndex]);
        const currentOperationChar = operationString[elementIndex];

        currentIterationStates.fill(0);

        for (let currentXorSumCandidate = 0; currentXorSumCandidate < xorSpaceSize; currentXorSumCandidate++) {
            const resultWithoutXor = nextIterationStates[currentXorSumCandidate];
            const resultWithXor = nextIterationStates[currentXorSumCandidate ^ currentNumericValue];

            if (currentOperationChar === '0') {
                if (resultWithoutXor || resultWithXor) {
                    currentIterationStates[currentXorSumCandidate] = 1;
                }
            } else {
                if (resultWithoutXor && resultWithXor) {
                    currentIterationStates[currentXorSumCandidate] = 1;
                }
            }
        }
        [currentIterationStates, nextIterationStates] = [nextIterationStates, currentIterationStates];
    }

    return nextIterationStates[xorTarget] === 1;
}

function processInputData(rawData) {
    const inputLines = rawData.split('\n');
    let currentLinePointer = 0;
    const totalTestCases = Number(inputLines[currentLinePointer++]);

    for (let caseCounter = 0; caseCounter < totalTestCases; caseCounter++) {
        const numElements = Number(inputLines[currentLinePointer++]);
        const arrayValues = inputLines[currentLinePointer++].split(' ');
        const sequenceString = inputLines[currentLinePointer++];

        const finalOutcome = determineXorPossibility(numElements, 0, arrayValues, sequenceString);
        console.log(finalOutcome ? '0' : '1');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
