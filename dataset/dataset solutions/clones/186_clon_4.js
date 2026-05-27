const fileSystemModule = require('fs');

const sourceDataLines = fileSystemModule.readFileSync('/dev/stdin', 'utf8').split('\n');

const numericRepresentations = sourceDataLines.map(datumString =>
    Number(datumString.replace('.', ''))
);

const highestNumericValue = Math.max(...numericRepresentations);
const lowestNumericValue = Math.min(...numericRepresentations);

console.log((highestNumericValue - lowestNumericValue) / 10);
