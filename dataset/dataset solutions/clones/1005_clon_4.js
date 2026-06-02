var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var contentLines = fileContent.trim().split("\n");
var numericData = contentLines[1].split(' ').map(val => Number(val));

function locateMinimumIndexFunctional(collection, startPoint) {
    return collection.slice(startPoint).reduce((accumulatorIndex, currentValue, relativeIndex) => {
        const absoluteIndex = startPoint + relativeIndex;
        if (currentValue < collection[accumulatorIndex]) {
            return absoluteIndex;
        }
        return accumulatorIndex;
    }, startPoint);
}

function performRecursiveSort(dataSequence, currentIterationIndex, totalSwapCount) {
    if (currentIterationIndex >= dataSequence.length - 1) {
        return { sortedSequence: dataSequence, finalSwapCount: totalSwapCount };
    }

    const minimumElementPosition = locateMinimumIndexFunctional(dataSequence, currentIterationIndex);

    let updatedSwapCount = totalSwapCount;
    if (minimumElementPosition !== currentIterationIndex) {
        [dataSequence[currentIterationIndex], dataSequence[minimumElementPosition]] =
        [dataSequence[minimumElementPosition], dataSequence[currentIterationIndex]];
        updatedSwapCount++;
    }

    return performRecursiveSort(dataSequence, currentIterationIndex + 1, updatedSwapCount);
}

var sortResult = performRecursiveSort(numericData, 0, 0);

console.log(sortResult.sortedSequence.join(' '));
console.log(sortResult.finalSwapCount);
