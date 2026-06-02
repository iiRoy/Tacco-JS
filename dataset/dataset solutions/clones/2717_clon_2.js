// Module for handling input operations
let inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputData = [];

inputHandler.on('line', function (currentLine) {
    inputData.push(currentLine);
});

// Main execution block
inputHandler.on('close', function () {
    let targetValue = Number(inputData[0]);
    let divisorCandidate = 1;

    while (targetValue % divisorCandidate === 0 && targetValue / divisorCandidate >= 1000000000) {
        divisorCandidate++;
    }

    console.log("0 0 " + divisorCandidate + " 0 0 " + (targetValue / divisorCandidate));
});
