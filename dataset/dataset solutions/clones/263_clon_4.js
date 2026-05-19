function findPermutationCount(targetLength, targetSum, currentLength, currentSum, usedDigitsMask) {
    if (currentLength === targetLength) {
        return currentSum === targetSum ? 1 : 0;
    }

    let validCount = 0;
    for (let digitValue = 0; digitValue <= 9; digitValue++) {
        if (!((usedDigitsMask >> digitValue) & 1)) {
            const nextUsedMask = usedDigitsMask | (1 << digitValue);
            const nextWeightedComponent = digitValue * (currentLength + 1);
            validCount += findPermutationCount(
                targetLength,
                targetSum,
                currentLength + 1,
                currentSum + nextWeightedComponent,
                nextUsedMask
            );
        }
    }
    return validCount;
}

function processInputLines() {
    processedLines.forEach(function(lineContent) {
        const trimmedLine = lineContent.trim();
        if (trimmedLine === '') return;

        const parsedValues = trimmedLine.split(' ').map(parseFloat);
        const requiredLength = parsedValues[0];
        const desiredSum = parsedValues[1];

        const resultCount = findPermutationCount(requiredLength, desiredSum, 0, 0, 0);
        console.log(resultCount);
    });
}

let rawInputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunkData) {
    rawInputData += chunkData;
});

let processedLines;
process.stdin.on('end', function() {
    processedLines = rawInputData.split('\n');
    processInputLines();
});
