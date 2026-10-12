const STD_IN_PATH = '/dev/stdin';

const parseSpaceSeparatedNumbers = (inputString) => {
    if (inputString === undefined || inputString === null) {
        return [];
    }
    const stringParts = inputString.split(' ');
    const numericValues = stringParts.map(Number);
    return numericValues;
};

const rawData = require('fs').readFileSync(STD_IN_PATH, 'utf8');
const dataLines = rawData.trim().split('\n');

let currentLine;

while ((currentLine = dataLines.shift()) !== undefined) {
    const parsedLineNumbers = parseSpaceSeparatedNumbers(currentLine);
    const itemCount = parsedLineNumbers[0];
    const maxBudget = parsedLineNumbers[1];

    if (itemCount === 0 && maxBudget === 0) {
        break;
    }

    const validSums = [];

    const priceLineString = dataLines.shift();
    const itemPrices = parseSpaceSeparatedNumbers(priceLineString);

    for (let idxA = 0; idxA <= maxBudget; idxA++) {
        for (let idxB = 0; idxB <= itemCount; idxB++) {
            const priceA = itemPrices[idxA];
            const priceB = itemPrices[idxB];

            if ((priceA + priceB) <= maxBudget) {
                validSums.push(priceA + priceB);
            }
        }
    }

    const highestCalculatedSum = Math.max(validSums[validSums.length - 1]);

    const shouldDisplaySum = validSums.length > 1 && highestCalculatedSum <= maxBudget;
    const outputValue = shouldDisplaySum ? highestCalculatedSum : 'NONE';

    console.log(`${outputValue}`);
}
