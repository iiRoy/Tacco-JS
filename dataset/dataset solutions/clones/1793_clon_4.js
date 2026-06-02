process.stdin.resume();
process.stdin.setEncoding('utf8');

const collectedInput = [];
const inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', (lineContent) => {
    collectedInput.push(lineContent);
});

inputHandler.on('close', () => {
    const [sizeStr, roundsStr] = collectedInput[0].split(" ");
    const arraySize = Number(sizeStr);
    const numRounds = Number(roundsStr);
    let currentData = collectedInput[1].split(" ").map(Number);

    const evolveData = (previousData) => {
        return Array.from({ length: arraySize }, (_, targetPosition) => {
            return previousData.filter((sourceValue, sourcePosition) => {
                return sourceValue >= Math.abs(targetPosition - sourcePosition);
            }).length;
        });
    };

    const finalData = Array.from({ length: numRounds }).reduce(evolveData, currentData);

    console.log(finalData.slice(0, 5).join(' '));
});
