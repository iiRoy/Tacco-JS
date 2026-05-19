const LOWER_BOUND = 0;
const UPPER_BOUND = 9;

function calculateSumCombinations(targetValue, minDigitValue, maxDigitValue) {
    let currentCombinationCount = 0;
    let sumOfCurrentDigits;

    for (let digit1 = minDigitValue; digit1 <= maxDigitValue; digit1++) {
        for (let digit2 = minDigitValue; digit2 <= maxDigitValue; digit2++) {
            for (let digit3 = minDigitValue; digit3 <= maxDigitValue; digit3++) {
                for (let digit4 = minDigitValue; digit4 <= maxDigitValue; digit4++) {
                    sumOfCurrentDigits = digit1 + digit2 + digit3 + digit4;
                    if (sumOfCurrentDigits === targetValue) {
                        currentCombinationCount++;
                    }
                }
            }
        }
    }
    return currentCombinationCount;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on("data", function(inputBuffer) {
    const processedInputLines = String(inputBuffer).trim().split("\n");
    const targetSumValues = processedInputLines.map(line => Number(line));

    for (let sumIndex = 0; sumIndex < targetSumValues.length; sumIndex++) {
        const currentTarget = targetSumValues[sumIndex];
        const resultCount = calculateSumCombinations(currentTarget, LOWER_BOUND, UPPER_BOUND);
        console.log(resultCount);
    }
});
