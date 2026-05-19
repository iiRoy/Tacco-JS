const inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const inputLines = [];

inputHandler.on('line', function (currentLine) {
  inputLines.push(currentLine);
});

inputHandler.on('close', function () {
    const rawInputLine = inputLines[0];
    const numberStringParts = rawInputLine.split(" ");

    const parsedNumbers = [];
    const totalParts = numberStringParts.length;

    for (let idx = 0; idx < totalParts; idx++) {
        const currentStringValue = numberStringParts[idx];
        parsedNumbers.push(parseInt(currentStringValue, 10));
    }

    const lowerBound = parsedNumbers[0];
    const upperBound = parsedNumbers[1];
    const divisorValue = parsedNumbers[2];

    let divisibleCount = 0;

    for (let currentNumber = lowerBound; currentNumber <= upperBound; currentNumber++) {
        const isDivisible = (currentNumber % divisorValue === 0);
        if (isDivisible) {
            divisibleCount++;
        }
    }
    console.log(divisibleCount);
});
