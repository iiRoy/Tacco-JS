const lowerBound = 0;
const upperBound = 9;

function calculateDigitCombinations(targetValue, minDigit, maxDigit) {
    let combinationCount = 0;
    const numberOfDigits = 4; // This constant clarifies the problem's structure

    for (let digitA = minDigit; digitA <= maxDigit; digitA++) {
        for (let digitB = minDigit; digitB <= maxDigit; digitB++) {
            for (let digitC = minDigit; digitC <= maxDigit; digitC++) {
                for (let digitD = minDigit; digitD <= maxDigit; digitD++) {
                    const currentSum = digitA + digitB + digitC + digitD;
                    if (currentSum === targetValue) {
                        combinationCount++;
                        // Preserve the exact output format and content
                        console.log([digitA, digitB, digitC, digitD], currentSum, targetValue);
                    }
                }
            }
        }
    }
    return combinationCount;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on("data", function(inputDataChunk) {
    // The original code's input parsing:
    // String(chunk).shift() extracts the first character of the input string.
    // .split("\n") on a single character string (e.g., "5") results in ["5"].
    // .map(parseInt) then parses this single character into a number.
    // This means 'n' becomes an array containing a single number,
    // which is the integer value of the first character of the input.
    const firstCharacter = String(inputDataChunk).charAt(0);
    const targetSumsArray = [parseInt(firstCharacter, 10)]; // Explicit radix for robustness

    for (let sumIndex = 0; sumIndex < targetSumsArray.length; sumIndex++) {
        const currentTargetSum = targetSumsArray[sumIndex];
        const totalCombinations = calculateDigitCombinations(currentTargetSum, lowerBound, upperBound);
        console.log(totalCombinations);
    }
});
