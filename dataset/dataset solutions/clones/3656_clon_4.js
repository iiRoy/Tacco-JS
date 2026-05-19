const inputLines = [];
const streamProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

streamProcessor.on('line', (currentLineData) => {
    inputLines.push(currentLineData);
});

streamProcessor.on('close', () => {
    console.log("No");
});
