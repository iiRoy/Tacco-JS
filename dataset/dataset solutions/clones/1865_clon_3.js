const fileSystemModule = require('fs');
const rawData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const dataParts = rawData.split(" ");

const valueA = parseInt(dataParts[0], 10);
const valueB = parseInt(dataParts[1], 10);
const valueC = parseInt(dataParts[2], 10);
const limitK = parseInt(dataParts[3], 10);

let finalScore = 0;

const sumOfAAndB = valueA + valueB;

if (limitK <= sumOfAAndB) {
    finalScore = valueA;
} else {
    const excessKBeyondAB = limitK - sumOfAAndB;
    finalScore = valueA - excessKBeyondAB;
}

console.log(finalScore);
