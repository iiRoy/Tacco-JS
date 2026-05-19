var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.trim().split("\n");

const parseLineOfNumbers = (lineStr) => lineStr.split(" ").map(Number);

const readNextInteger = (sourceLines) => parseInt(sourceLines.shift(), 10);

while (true) {
    const numAndSumValues = parseLineOfNumbers(lines.shift());
    const count = numAndSumValues[0];
    const targetSum = numAndSumValues[1];

    if (count === 0 && targetSum === 0) {
        break;
    }

    const numbers = [];
    for (let idx = 0; idx < count; idx++) {
        const currentNum = readNextInteger(lines);
        numbers.push(currentNum);
    }

    numbers.sort((a, b) => a - b);

    const MAX_POSSIBLE_SUM = 200;
    const sumCounts = Array(MAX_POSSIBLE_SUM + 1).fill(0);

    for (let idx1 = 0; idx1 < count; idx1++) {
        for (let idx2 = idx1 + 1; idx2 < count; idx2++) {
            const currentPairSum = numbers[idx1] + numbers[idx2];
            sumCounts[currentPairSum]++;
        }
    }

    let resultCount = 0;
    const startSumIndex = targetSum + 1;
    for (let currentSum = startSumIndex; currentSum <= MAX_POSSIBLE_SUM; currentSum++) {
        resultCount += sumCounts[currentSum];
    }

    console.log(resultCount);
}
