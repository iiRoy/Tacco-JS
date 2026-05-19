const inputLines = [];
const ioHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioHandler.on('line', (currentLine) => {
    inputLines.push(currentLine);
});

ioHandler.on('close', () => {
    const firstLineComponents = inputLines[0].split(" ").map(Number);
    const elementCount = firstLineComponents[0];
    const divisorValue = firstLineComponents[1];

    const numericSequence = inputLines[1].split(" ").map(Number);

    let totalPairs = 0;
    const remainderFrequencyMap = new Map();
    remainderFrequencyMap.set(0, 1);

    let currentAccumulatedRemainder = 0;

    for (let k = 0; k < elementCount; k++) {
        currentAccumulatedRemainder = (currentAccumulatedRemainder + numericSequence[k]) % divisorValue;
        
        const existingFrequency = remainderFrequencyMap.get(currentAccumulatedRemainder) || 0;
        totalPairs += existingFrequency;
        remainderFrequencyMap.set(currentAccumulatedRemainder, existingFrequency + 1);
    }

    console.log(totalPairs);
});
