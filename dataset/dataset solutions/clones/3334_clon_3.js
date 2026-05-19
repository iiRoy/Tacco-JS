function parseInitialData(inputLines) {
    const firstLineParts = inputLines[0].split(" ");
    const numElements = parseInt(firstLineParts[0], 10);
    const elementsArray = inputLines[1].split(" ").map(str => parseInt(str, 10));
    return { numElements, elementsArray };
}

function ProcessInput(rawData) {
    const cleanedLines = rawData.trim().split("\n");
    const { numElements: arrayLength, elementsArray: dataElements } = parseInitialData(cleanedLines);

    const memoizationTable = [];
    for (let i = 0; i < arrayLength; i++) {
        memoizationTable.push(new Array(arrayLength).fill(null));
    }

    function CalculateMaxDifference(leftIndex, rightIndex) {
        if (memoizationTable[leftIndex][rightIndex] !== null) {
            return memoizationTable[leftIndex][rightIndex];
        }

        let currentResult;
        const rangeSize = rightIndex - leftIndex;

        if (rangeSize === 0) {
            currentResult = dataElements[leftIndex];
        } else if (rangeSize === 1) {
            currentResult = Math.abs(dataElements[leftIndex] - dataElements[rightIndex]);
        } else {
            const nextLeftIndex = leftIndex + 1;
            const prevRightIndex = rightIndex - 1;

            const valueIfLeftTaken = dataElements[leftIndex] - CalculateMaxDifference(nextLeftIndex, rightIndex);
            const valueIfRightTaken = dataElements[rightIndex] - CalculateMaxDifference(leftIndex, prevRightIndex);

            currentResult = Math.max(valueIfLeftTaken, valueIfRightTaken);
        }

        memoizationTable[leftIndex][rightIndex] = currentResult;
        return currentResult;
    }

    console.log(CalculateMaxDifference(0, arrayLength - 1));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
