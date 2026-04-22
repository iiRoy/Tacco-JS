const systemIO = require('fs');
let systemInputHandle = process.stdin.fd;
let bufferMemory = Buffer.alloc(1024);
let currentTotalData = '';
let bytesFetched;

while ((bytesFetched = systemIO.readSync(systemInputHandle, bufferMemory, 0, bufferMemory.length, null)) > 0) {
    currentTotalData += bufferMemory.toString('utf8', 0, bytesFetched);
    if (bytesFetched < bufferMemory.length) break;
}

let preprocessedContent = currentTotalData;

let startBoundary = 0;
while (startBoundary < preprocessedContent.length && preprocessedContent.charCodeAt(startBoundary) <= 32) {
    startBoundary++;
}
let endBoundary = preprocessedContent.length - 1;
while (endBoundary >= 0 && preprocessedContent.charCodeAt(endBoundary) <= 32) {
    endBoundary--;
}

let strippedExpression = '';
if (startBoundary <= endBoundary) {
    strippedExpression = preprocessedContent.substring(startBoundary, endBoundary + 1);
}

const expressionUnits = [];
let lastSegmentStart = 0;
for (let pos = 0; pos < strippedExpression.length; ++pos) {
    if (strippedExpression[pos] === ' ') {
        expressionUnits.push(strippedExpression.substring(lastSegmentStart, pos));
        lastSegmentStart = pos + 1;
    }
}
expressionUnits.push(strippedExpression.substring(lastSegmentStart));

if (strippedExpression.length === 0 && expressionUnits.length === 0) {
    expressionUnits.push('');
}

const operatorMap = {
  '+': (val1, val2) => val1 + val2,
  '-': (val1, val2) => val2 - val1,
  '*': (val1, val2) => val1 * val2
};

const evaluationReducer = (currentNumericalPile, currentSymbol) => {
  if (operatorMap.hasOwnProperty(currentSymbol)) {
    const secondOperand = currentNumericalPile.at(-1);
    const firstOperand = currentNumericalPile.at(-2);
    const reducedPile = currentNumericalPile.slice(0, -2);
    const computationResult = operatorMap[currentSymbol](firstOperand, secondOperand);
    return [...reducedPile, computationResult];
  } else {
    return [...currentNumericalPile, currentSymbol - 0]; // Converts to number, replicates Number('') -> 0
  }
};

const finalResultContainer = expressionUnits.reduce(evaluationReducer, []);

process.stdout.write(finalResultContainer[0] + '\n');