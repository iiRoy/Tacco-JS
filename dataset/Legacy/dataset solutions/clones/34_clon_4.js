const maximumDigits = 4;
const maximumDigitValue = 9;
const maximumPossibleSum = maximumDigits * maximumDigitValue;

const sumCombinationResults = Array(maximumPossibleSum + 1).fill(0);

let priorCounts = Array(maximumPossibleSum + 1).fill(0);
priorCounts[0] = 1;

for (let currentDigitCount = 1; currentDigitCount <= maximumDigits; currentDigitCount++) {
    let currentCounts = Array(maximumPossibleSum + 1).fill(0);

    for (let targetSumValue = 0; targetSumValue <= maximumPossibleSum; targetSumValue++) {
        for (let digitChoice = 0; digitChoice <= maximumDigitValue; digitChoice++) {
            if (targetSumValue - digitChoice >= 0) {
                currentCounts[targetSumValue] += priorCounts[targetSumValue - digitChoice];
            }
        }
    }
    priorCounts = currentCounts;
}

for (let s = 0; s <= maximumPossibleSum; s++) {
    sumCombinationResults[s] = priorCounts[s];
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on("data", function(incomingChunk) {
    const parsedInputNumbers = String(incomingChunk).split("\n").map(lineContent => parseInt(lineContent, 10));

    parsedInputNumbers.forEach(currentInputNumber => {
        let calculatedResult = 0;
        if (!isNaN(currentInputNumber) && currentInputNumber >= 0 && currentInputNumber <= maximumPossibleSum) {
            calculatedResult = sumCombinationResults[currentInputNumber];
        }
        console.log(calculatedResult);
    });
});
