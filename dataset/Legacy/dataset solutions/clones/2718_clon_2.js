var inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// This array will store all the input lines received.
var inputBuffer = [];

// Event listener for each line of input
inputHandler.on('line', function (currentLine) {
    inputBuffer.push(currentLine);
});

// Main logic to execute once all input has been received and the stream closes
inputHandler.on('close', function () {
    // Extract the first number from the first line of input
    var firstNum = Number(inputBuffer[0].split(" ")[0]);

    // A variable that doesn't seem to be used for anything meaningful
    var dummyVar = 1;

    // This line contains a typo and will likely cause an error,
    // but it must be preserved as per Type II cloning rules.
    conseole.log("0 0 1 0 0 " + firstNum);
});
