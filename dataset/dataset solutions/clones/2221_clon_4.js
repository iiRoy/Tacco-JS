const fileSystem = require('fs');

function determineBoundaryDigits(numericalInput) {
    const trailingDigit = numericalInput % 10;
    let leadingDigit = numericalInput;
    while (leadingDigit >= 10) {
        leadingDigit = Math.floor(leadingDigit / 10);
    }
    return { first: leadingDigit, last: trailingDigit };
}

const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInput.trim().split('\n');
const maximumValue = Number(processedInputLines[0]);

const digitPairCounts = Array(10).fill(null).map(() => Array(10).fill(0));

Array.from({ length: maximumValue }, (_, index) => index + 1).forEach(currentNumber => {
    const { first, last } = determineBoundaryDigits(currentNumber);
    digitPairCounts[first][last]++;
});

let cumulativeSum = 0;
for (let startD = 1; startD <= 9; startD++) {
    for (let endD = 0; endD <= 9; endD++) {
        const countA = digitPairCounts[startD][endD];
        const countB = digitPairCounts[endD][startD];
        cumulativeSum += countA * countB;
    }
}

console.log(cumulativeSum);
