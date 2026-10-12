let inputBuffer = '';
let inputTokens;

function executeAlgorithm() {
    let tokenIndex = 0;

    const retrieveNumericToken = () => +inputTokens[tokenIndex++];

    const gridDimension = retrieveNumericToken();
    const initialGrid = Array.from({ length: gridDimension }, () =>
        Array.from({ length: gridDimension }, retrieveNumericToken)
    );

    const rowPrefixSums = initialGrid.map(row => {
        let currentAccumulator = 0;
        return row.map(element => {
            currentAccumulator += element;
            return currentAccumulator;
        });
    });

    const allSubmatrixSums = Array.from({ length: gridDimension }, (_, exclusiveLeftColIdx) => exclusiveLeftColIdx - 1)
        .flatMap(exclusiveLeftColIdx =>
            Array.from({ length: gridDimension - (exclusiveLeftColIdx + 1) }, (_, k) => k + (exclusiveLeftColIdx + 1))
                .map(inclusiveRightColIdx => {
                    const columnSliceSums = Array.from({ length: gridDimension }, (_, rowIndex) => {
                        const rightBoundarySum = rowPrefixSums[rowIndex][inclusiveRightColIdx];
                        const leftBoundarySum = (exclusiveLeftColIdx === -1) ? 0 : rowPrefixSums[rowIndex][exclusiveLeftColIdx];
                        return rightBoundarySum - leftBoundarySum;
                    });

                    const kadaneResult = columnSliceSums.reduce((accumulator, currentElement) => {
                        const newCurrentMax = Math.max(currentElement, accumulator.currentMax + currentElement);
                        const newGlobalMax = Math.max(accumulator.globalMax, newCurrentMax);
                        return { currentMax: newCurrentMax, globalMax: newGlobalMax };
                    }, { currentMax: -Infinity, globalMax: -Infinity });

                    return kadaneResult.globalMax;
                })
        );

    const overallMaximumSubarraySum = allSubmatrixSums.reduce((max, current) => Math.max(max, current), -Infinity);

    console.log(overallMaximumSubarraySum);
}

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    inputTokens = inputBuffer.split(/\s+/).filter(Boolean);
    executeAlgorithm();
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
