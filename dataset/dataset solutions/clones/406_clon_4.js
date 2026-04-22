const fileSystemOperations = require('fs');

const numericSeriesCache = new Array(31); 

numericSeriesCache[0] = 1;
numericSeriesCache[1] = 1;
numericSeriesCache[2] = 2;

const deriveTerm = (positionIdentifier) => {
    if (positionIdentifier < 0 || positionIdentifier > 30) {
        return undefined;
    }
    if (numericSeriesCache[positionIdentifier] !== undefined) {
        return numericSeriesCache[positionIdentifier];
    }
    const val = deriveTerm(positionIdentifier - 1) +
                deriveTerm(positionIdentifier - 2) +
                deriveTerm(positionIdentifier - 3);
    numericSeriesCache[positionIdentifier] = val;
    return val;
};

for (let currentPointer = 0; currentPointer <= 30; currentPointer++) {
    deriveTerm(currentPointer);
}

const rawInputContent = fileSystemOperations.readFileSync('/dev/stdin', 'utf8');

const targetIndexValues = rawInputContent
    .split('\n')
    .filter(textLine => textLine !== '')
    .map(textLine => Number(textLine));

const finalOutputLines = targetIndexValues.map(inputLocator => {
    const retrievedValue = numericSeriesCache[inputLocator];

    if (retrievedValue === undefined) {
        return 0;
    }
    return Math.floor((retrievedValue + 3649) / 3650);
});

console.log(finalOutputLines.join('\n'));