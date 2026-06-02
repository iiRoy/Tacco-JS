const LOWER_BOUND = 0;
const UPPER_BOUND = 9;

function calculateDigitSumCombinations(targetValue, minDigit, maxDigit) {
    let currentCount = 0;
    const NUMBER_OF_DIGITS_IN_SUM = 4;

    for (let digitA = minDigit; digitA <= maxDigit; digitA++) {
        for (let digitB = minDigit; digitB <= maxDigit; digitB++) {
            for (let digitC = minDigit; digitC <= maxDigit; digitC++) {
                for (let digitD = minDigit; digitD <= maxDigit; digitD++) {
                    const currentSum = digitA + digitB + digitC + digitD;
                    if (currentSum === targetValue) {
                        currentCount++;
                    }
                }
            }
        }
    }
    return currentCount;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on("data", function(dataChunk) {
    const inputNumbers = String(dataChunk).split("\n").map(parseInt);

    for (let numIndex = 0; numIndex < inputNumbers.length; numIndex++) {
        const currentTargetSum = inputNumbers[numIndex];
        const resultCount = calculateDigitSumCombinations(currentTargetSum, LOWER_BOUND, UPPER_BOUND);
        console.log(resultCount);
    }
});
