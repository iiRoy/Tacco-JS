const inputFilePath = '/dev/stdin';
const rawData = require('fs').readFileSync(inputFilePath, 'utf8');

function convertConcatenatedToNumber(strA, strB) {
    const combinedString = strA + strB;
    return Number(combinedString);
}

const trimmedInput = rawData.trim();
const dataLines = trimmedInput.split("\n");

const itemCountString = dataLines.shift();
const itemCount = Number(itemCountString);

const computedValues = [];

for (let firstIndex = 0; firstIndex < itemCount; firstIndex++) {
    for (let secondIndex = firstIndex + 1; secondIndex < itemCount; secondIndex++) {
        computedValues.push(convertConcatenatedToNumber(dataLines[firstIndex], dataLines[secondIndex]));
        computedValues.push(convertConcatenatedToNumber(dataLines[secondIndex], dataLines[firstIndex]));
    }
}

const numericSortComparator = (valueA, valueB) => {
    return valueA - valueB;
};

computedValues.sort(numericSortComparator);

console.log(computedValues[2]);
