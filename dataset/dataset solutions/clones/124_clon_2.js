let rawData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunkOfData) {
    rawData += chunkOfData;
});

process.stdin.on('end', function() {
    processInputData(rawData);
});

function processInputData(fullInputString) {
    const linesOfData = fullInputString.trim().split('\n');

    for (let lineIndex = 0; lineIndex < linesOfData.length; lineIndex++) {
        const currentNumbers = linesOfData[lineIndex].split(' ').map(Number);
        const countLimit = currentNumbers[0];
        const targetSum = currentNumbers[1];

        if (!countLimit && !targetSum) {
            return;
        }
        console.log(calculateCombinations(countLimit, targetSum));
    }
}

function calculateCombinations(limitN, sumS) {
    return recursiveSumCounter(sumS, -1, limitN);
}

function recursiveSumCounter(currentSum, lastDigitUsed, remainingSteps) {
    if (remainingSteps === 0) {
        const isSumAchieved = currentSum === 0;
        return isSumAchieved ? 1 : 0;
    }

    let cumulativeCount = 0;
    for (let digitValue = lastDigitUsed + 1; digitValue <= 9; digitValue++) {
        if (currentSum >= digitValue) {
            cumulativeCount += recursiveSumCounter(currentSum - digitValue, digitValue, remainingSteps - 1);
        }
    }
    return cumulativeCount;
}
