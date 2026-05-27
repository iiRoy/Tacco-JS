let inputBuffer = [];
const ioHandler = require('readline');

const inputReader = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', (currentLine) => {
    inputBuffer.push(currentLine);
});

inputReader.on('close', () => {
    const firstLineParts = inputBuffer[0].split(" ");
    const targetValue = Number(firstLineParts[0]);
    const forbiddenCount = Number(firstLineParts[1]);
    inputBuffer.shift();
    const forbiddenStepsRaw = inputBuffer.map(val => Number(val));

    const forbiddenStepsSet = new Set(forbiddenStepsRaw);

    const modulusConstant = 1000000007;

    const dpTable = Array(targetValue + 1).fill(0);

    dpTable[targetValue] = 1;

    for (let currentIdx = targetValue - 1; currentIdx >= 0; currentIdx--) {
        if (forbiddenStepsSet.has(currentIdx)) {
            dpTable[currentIdx] = 0;
            continue;
        }

        let currentPathSum = 0;

        if (currentIdx + 1 <= targetValue) {
            currentPathSum = (currentPathSum + dpTable[currentIdx + 1]) % modulusConstant;
        }

        if (currentIdx + 2 <= targetValue) {
            currentPathSum = (currentPathSum + dpTable[currentIdx + 2]) % modulusConstant;
        }

        dpTable[currentIdx] = currentPathSum;
    }

    console.log(dpTable[0]);
});
