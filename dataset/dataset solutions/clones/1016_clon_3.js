let totalShiftCount;

function gapInsertionSort(dataElements, elementCount, currentGap) {
    for (let loopIterator = currentGap; loopIterator < elementCount; loopIterator++) {
        const elementToInsert = dataElements[loopIterator];
        let comparisonIndex = loopIterator - currentGap;

        while (comparisonIndex >= 0 && dataElements[comparisonIndex] > elementToInsert) {
            dataElements[comparisonIndex + currentGap] = dataElements[comparisonIndex];
            comparisonIndex -= currentGap;
            totalShiftCount++;
        }
        dataElements[comparisonIndex + currentGap] = elementToInsert;
    }
}

function generateShellGaps(limit) {
    const sequence = [];
    let k = 1;
    while (true) {
        const calculatedGap = Math.pow(2, k) - 1;
        if (calculatedGap > limit) {
            break;
        }
        sequence.push(calculatedGap);
        k++;
    }
    sequence.reverse();
    return sequence;
}

function applyShellSort(dataElements, elementCount) {
    totalShiftCount = 0;

    const gapSequence = generateShellGaps(elementCount);
    const numGapsInSequence = gapSequence.length;

    for (let loopIterator = 0; loopIterator < numGapsInSequence; loopIterator++) {
        const currentGapValue = gapSequence[loopIterator];
        gapInsertionSort(dataElements, elementCount, currentGapValue);
    }

    console.log(numGapsInSequence);
    console.log(gapSequence.join(' '));
    console.log(totalShiftCount);
    for (let loopIterator = 0; loopIterator < elementCount; loopIterator++) {
        console.log(dataElements[loopIterator]);
    }
}

(function() {
    const fs = require('fs');
    const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
    let processedLines = rawInputContent.split('\n');

    const elementCountStr = processedLines.shift();
    const elementCount = parseInt(elementCountStr, 10);

    const dataElements = processedLines.map(lineStr => parseInt(lineStr, 10));

    applyShellSort(dataElements, elementCount);
})();
