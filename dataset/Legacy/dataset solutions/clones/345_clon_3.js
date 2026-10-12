const fileSystem = require('fs');

function prepareExpression(rawInputString) {
    let intermediateString = rawInputString.substring(0, rawInputString.length - 1);
    let finalExpression = intermediateString.replace(/(\d+)\.\d+/g, "$1");
    return finalExpression;
}

const fileContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const trimmedContent = fileContent.trim();
let inputLines = trimmedContent.split('\n');

const numIterations = parseInt(inputLines.shift(), 10);

for (let loopIndex = 0; loopIndex < numIterations; loopIndex++) {
    const expressionString = inputLines[loopIndex];
    const processedExpression = prepareExpression(expressionString);
    const calculatedValue = eval(processedExpression);
    console.log(parseInt(calculatedValue, 10));
}
