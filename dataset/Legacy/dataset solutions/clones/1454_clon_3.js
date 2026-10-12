const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';

const rawInputContent = fileSystem.readFileSync(standardInputPath, 'utf8');

const processInputLines = (fullContent) => {
    const cleanedContent = fullContent.trim();
    return cleanedContent.split('\n');
};

const convertLineToNumbers = (lineOfText) => {
    return lineOfText.split(' ').map(Number);
};

const allInputLines = processInputLines(rawInputContent);
const numbersToProcess = convertLineToNumbers(allInputLines[1]);

const numericSortComparator = (valueA, valueB) => valueA - valueB;

numbersToProcess.sort(numericSortComparator);

const finalOutputString = numbersToProcess.join(' ');
console.log(finalOutputString);
