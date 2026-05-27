const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = sourceData.trim().split('\n');

const digitMapping = new Map([
    ['7', '9'],
    ['6', '8'],
    ['5', '7'],
    ['4', '5']
]);

for (const segment of lineSegments) {
    const currentNumericValue = Number(segment);

    if (currentNumericValue === 0) {
        break;
    }

    const octalString = currentNumericValue.toString(8);

    const transformedOctalRepresentation = Array.from(octalString)
        .map(char => digitMapping.has(char) ? digitMapping.get(char) : char)
        .join('');

    console.log(transformedOctalRepresentation);
}
