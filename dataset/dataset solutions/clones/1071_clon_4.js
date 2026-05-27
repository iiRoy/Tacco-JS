function processInput(inputData) {
    const lines = inputData.trim().split('\n');
    const elementCount = Number(lines.shift());
    const numericalArray = lines.shift().split(' ').map(Number);

    const processedArray = partitionTransform(numericalArray, 0, elementCount);
    console.log(processedArray.join(' '));
}

function partitionTransform(sourceArray, startBoundary, endBoundary) {
    const pivotElement = sourceArray[endBoundary - 1];

    const segmentToProcess = sourceArray.slice(startBoundary, endBoundary - 1);

    const elementsBelowOrEqual = segmentToProcess.filter(val => val <= pivotElement);
    const elementsAbove = segmentToProcess.filter(val => val > pivotElement);

    elementsAbove.sort((a, b) => a - b);

    const newSegmentContent = [
        ...elementsBelowOrEqual,
        `[${pivotElement}]`,
        ...elementsAbove
    ];

    sourceArray.splice(startBoundary, endBoundary - startBoundary, ...newSegmentContent);

    return sourceArray;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
