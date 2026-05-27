var inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var storedInputLines = [];
inputHandler.on('line', (currentLineData) => {
    storedInputLines.push(currentLineData);
});

function determineGameWinner(firstOperandString, secondOperandString) {
    var operandA = parseInt(firstOperandString, 10);
    var operandB = parseInt(secondOperandString, 10);

    var differenceValue = operandB - operandA;
    var calculatedValue = differenceValue - 1;

    var isCalculatedValueOdd = (calculatedValue % 2 !== 0);

    if (isCalculatedValueOdd) {
        console.log('Alice');
    } else {
        console.log('borys');
    }
}

inputHandler.on('close', () => {
    var initialInputLine = storedInputLines[0];
    var lineSegments = initialInputLine.split(' ');

    determineGameWinner(lineSegments[1], lineSegments[2]);
});
