const sourceOfData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = sourceOfData.trim().split('\n');

function processRemaining(remainingLines) {
    if (remainingLines.length === 0) {
        return;
    }

    const currentEntry = remainingLines[0];
    const numericalValue = Number(currentEntry);

    const termOne = numericalValue;
    const termTwo = numericalValue + 1;
    const totalProduct = termOne * termTwo;
    const halfProduct = (totalProduct >>> 1);
    const finalResult = halfProduct + 1;

    console.log(finalResult);

    processRemaining(remainingLines.slice(1));
}

processRemaining(processedLines);