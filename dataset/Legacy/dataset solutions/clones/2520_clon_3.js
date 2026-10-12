process.stdin.resume();
process.stdin.setEncoding('utf8');

var collectedLines = [];
var inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', (currentInputLine) => {
    collectedLines.push(currentInputLine);
});

inputHandler.on('close', () => {
    const firstLineContent = collectedLines[0];
    const numericValue = Number(firstLineContent);

    const remainderOfDivision = numericValue % 2;
    const numeratorExpression = numericValue + remainderOfDivision;
    const denominatorExpression = 2 * numericValue;

    const finalCalculatedResult = numeratorExpression / denominatorExpression;
    console.log(finalCalculatedResult);
});
