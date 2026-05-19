const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputContent.trim().split("\n");
const numericDataQueue = processedLines.map(Number);

while (numericDataQueue.length > 0) {
    const initialValueForCount = numericDataQueue.shift();
    let countOfNumbersToSum = initialValueForCount / 4;

    if (countOfNumbersToSum === 0) {
        break;
    }

    let currentTotal = 0;

    for (let i = 0; i < countOfNumbersToSum; i++) {
        const nextNumberToAdd = numericDataQueue.shift();
        currentTotal += nextNumberToAdd;
    }

    console.log(currentTotal);
}
