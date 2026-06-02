const fileSystemModule = require('fs');
const inputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const rawLines = inputContent.split("\n");
const processedNumbers = rawLines.map(value => Number(value));

const casePrefix = "Case ";
const valueSeparator = ": ";

for (let loopIndex = 0; loopIndex < processedNumbers.length; ++loopIndex) {
    const currentNumber = processedNumbers[loopIndex];
    if (currentNumber === 0) {
        break;
    }
    const caseNumber = loopIndex + 1;
    const outputString = casePrefix + caseNumber + valueSeparator + currentNumber;
    console.log(outputString);
}
