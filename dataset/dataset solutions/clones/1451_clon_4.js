const inputData = process.stdin.readFileSync(0, 'utf8');

const lineSegments = inputData.trim().split('\n');

const referenceNumbers = lineSegments[1].split(' ').map(strVal => parseInt(strVal, 10));
const queryNumbers = lineSegments[3].split(' ').map(strVal => parseInt(strVal, 10));

referenceNumbers.sort((x, y) => x - y);
queryNumbers.sort((x, y) => x - y);

let matchedItems = 0;
let refIndex = 0;
let queryIndex = 0;

while (refIndex < referenceNumbers.length && queryIndex < queryNumbers.length) {
    if (referenceNumbers[refIndex] === queryNumbers[queryIndex]) {
        matchedItems++;
        refIndex++;
        queryIndex++;
    } else if (referenceNumbers[refIndex] < queryNumbers[queryIndex]) {
        refIndex++;
    } else {
        queryIndex++;
    }
}

console.log(matchedItems);