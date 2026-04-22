const sourceTextLines = require('node:fs').readFileSync(process.stdin.fd, 'utf-8').split(/\r?\n/);

const { sortedValues, finalOperationCount } = (() => {
    let mergeComparisons = 0;

    const stitchArrays = (firstArr, secondArr) => {
        const mergedResult = [];
        let ptr1 = 0;
        let ptr2 = 0;

        while (ptr1 < firstArr.length && ptr2 < secondArr.length) {
            mergeComparisons++;
            if (firstArr[ptr1] <= secondArr[ptr2]) {
                mergedResult.push(firstArr[ptr1]);
                ptr1++;
            } else {
                mergedResult.push(secondArr[ptr2]);
                ptr2++;
            }
        }

        while (ptr1 < firstArr.length) {
            mergeComparisons++;
            mergedResult.push(firstArr[ptr1]);
            ptr1++;
        }

        while (ptr2 < secondArr.length) {
            mergeComparisons++;
            mergedResult.push(secondArr[ptr2]);
            ptr2++;
        }

        return mergedResult;
    };

    const orchestrateSort = (currentArray) => {
        if (currentArray.length <= 1) {
            return currentArray;
        }

        const divisionPoint = ~~ (currentArray.length / 2);
        const segmentOne = currentArray.slice(0, divisionPoint);
        const segmentTwo = currentArray.slice(divisionPoint);

        const sortedSegmentOne = orchestrateSort(segmentOne);
        const sortedSegmentTwo = orchestrateSort(segmentTwo);

        return stitchArrays(sortedSegmentOne, sortedSegmentTwo);
    };

    const numericalSequence = sourceTextLines[1].split(' ').map(val => parseFloat(val));

    const finalSequence = orchestrateSort(numericalSequence);

    return {
        sortedValues: finalSequence,
        finalOperationCount: mergeComparisons
    };
})();

process.stdout.write(sortedValues.join(' ') + '\n');
process.stdout.write(finalOperationCount + '\n');