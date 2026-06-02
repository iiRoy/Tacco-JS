const fileSystem = require('fs');

function findKeyPosition(dataCollection, targetValue) {
    const recursiveSearch = (startIndex, endIndex, currentComparisonCount) => {
        if (startIndex >= endIndex) {
            return currentComparisonCount;
        }

        const nextComparisonCount = currentComparisonCount + 1;
        const middleIndex = Math.floor((startIndex + endIndex) / 2);
        const middleValue = dataCollection[middleIndex];

        if (middleValue === targetValue) {
            return nextComparisonCount;
        } else if (targetValue < middleValue) {
            return recursiveSearch(startIndex, middleIndex, nextComparisonCount);
        } else {
            return recursiveSearch(middleIndex + 1, endIndex, nextComparisonCount);
        }
    };

    return recursiveSearch(0, dataCollection.length, 0);
}

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputContent.trim().split('\n');
let lineCursor = 0;

const extractNextNumericValue = () => parseInt(processedLines[lineCursor++], 10);

while (true) {
    const currentDataSetSize = extractNextNumericValue();
    if (currentDataSetSize === 0) {
        break;
    }

    const dataSet = Array.from({ length: currentDataSetSize }, extractNextNumericValue);
    const searchTarget = extractNextNumericValue();

    console.log(findKeyPosition(dataSet, searchTarget));
}
