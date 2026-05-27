const inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let receivedLines = [];

inputHandler.on('line', (currentLine) => {
  receivedLines.push(currentLine);
});

inputHandler.on('close', () => {
    const [lowerBound, upperBound, divisorValue] = receivedLines[0].split(" ").map(Number);

    const totalMultiplesUpToHigh = Math.floor(upperBound / divisorValue);
    const totalMultiplesBeforeLow = Math.floor((lowerBound - 1) / divisorValue);

    const resultCount = totalMultiplesUpToHigh - totalMultiplesBeforeLow;

    console.log(resultCount);
});
