const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineSegments = fileContent.split('\n');

// The original code reads the first line (containing 'n') and discards it.
// We achieve the same by simply not using lineSegments[0] for subsequent processing,
// effectively "consuming" it from the input stream's perspective.

const numberLineContent = lineSegments[1]; // This string contains the space-separated numbers.

// The original code uses `split(' ').map(Number)`. To preserve exact behavior,
// especially regarding how multiple spaces or leading/trailing spaces result
// in empty strings that `Number()` converts to 0, we must use `split(' ')`.
// However, we replace the functional `map` with an imperative loop.
const tokenArray = numberLineContent.split(' ');

const parsedNumbers = [];
for (let i = 0; i < tokenArray.length; i++) {
    parsedNumbers.push(Number(tokenArray[i])); // Manually convert each token to a number
}

// Custom sorting function: Insertion Sort
// This replaces the built-in `Array.prototype.sort` method.
function performSort(dataCollection) {
    const dataLength = dataCollection.length;
    for (let currentIdx = 1; currentIdx < dataLength; currentIdx++) {
        let elementToInsert = dataCollection[currentIdx];
        let comparisonIdx = currentIdx - 1;
        while (comparisonIdx >= 0 && dataCollection[comparisonIdx] > elementToInsert) {
            dataCollection[comparisonIdx + 1] = dataCollection[comparisonIdx];
            comparisonIdx--;
        }
        dataCollection[comparisonIdx + 1] = elementToInsert;
    }
    return dataCollection; // The array is sorted in place, but returned for clarity.
}

const finalResult = performSort(parsedNumbers);

console.log(finalResult.join(' '));
