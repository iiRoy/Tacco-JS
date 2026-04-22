const createDataFeeder = (sourceText) => {
    let internalLines = sourceText.split('\n');
    let lineCursor = 0;
    let currentSegmentCache = null;

    const acquireElement = (stringFormat = false) => {
        if (currentSegmentCache === null || currentSegmentCache.length === 0) {
            if (lineCursor >= internalLines.length) {
                return undefined;
            }
            const lineFragment = internalLines[lineCursor];
            currentSegmentCache = lineFragment.split(' ').reverse();
        }

        const retrievedElement = currentSegmentCache.pop();

        if (currentSegmentCache.length === 0) {
            lineCursor++;
            currentSegmentCache = null;
        }

        return stringFormat ? retrievedElement : Number(retrievedElement);
    };

    const acquireSequence = (stringFormat = false) => {
        if (lineCursor >= internalLines.length) {
            return [];
        }
        const lineFragment = internalLines[lineCursor++];
        currentSegmentCache = null;
        const elements = lineFragment.split(' ');
        return stringFormat ? elements : elements.map(Number);
    };

    const acquireSegmentedData = (numSegments, stringFormat = false) => {
        const collectedSegments = [];
        for (let idx = 0; idx < numSegments; idx++) {
            if (lineCursor >= internalLines.length) {
                break;
            }
            collectedSegments.push(acquireSequence(stringFormat));
        }
        return collectedSegments;
    };

    return {
        grabValue: acquireElement,
        grabLine: acquireSequence,
        grabLines: acquireSegmentedData
    };
};

function calculatePermutationDisorder(numericSeries) {
    let disorderCount = 0;

    function recursivelySortAndCount(partition) {
        if (partition.length <= 1) {
            return partition;
        }

        const middlePoint = Math.floor(partition.length / 2);
        const leftHalf = recursivelySortAndCount(partition.slice(0, middlePoint));
        const rightHalf = recursivelySortAndCount(partition.slice(middlePoint));

        return mergeHalvesAndAccumulate(leftHalf, rightHalf);
    }

    function mergeHalvesAndAccumulate(leftPart, rightPart) {
        const mergedResult = [];
        let leftIdx = 0;
        let rightIdx = 0;

        while (leftIdx < leftPart.length && rightIdx < rightPart.length) {
            if (leftPart[leftIdx] <= rightPart[rightIdx]) {
                mergedResult.push(leftPart[leftIdx++]);
            } else {
                mergedResult.push(rightPart[rightIdx++]);
                disorderCount += (leftPart.length - leftIdx);
            }
        }

        while (leftIdx < leftPart.length) {
            mergedResult.push(leftPart[leftIdx++]);
        }
        while (rightIdx < rightPart.length) {
            mergedResult.push(rightPart[rightIdx++]);
        }
        return mergedResult;
    }

    recursivelySortAndCount([...numericSeries]);
    return disorderCount;
}

function evaluateOptimalThreshold() {
    const inputSource = createDataFeeder(require("fs").readFileSync("/dev/stdin", "utf8"));

    const collectionSize = inputSource.grabValue();
    const dataCollection = inputSource.grabLine();

    if (collectionSize <= 2) {
        return Math.max(...dataCollection);
    }

    const targetDisorder = Math.floor(collectionSize * (collectionSize + 1) / 4 + 1);

    let lowerBound = 2;
    let upperBound = 1e9 + 1;

    const locateThresholdRecursively = (currentLow, currentHigh) => {
        if (currentLow >= currentHigh) {
            return currentLow;
        }
        const midCandidate = Math.floor((currentLow + currentHigh) / 2);

        const transformedSeries = dataCollection.reduce((accumulator, itemValue, index) => {
            const previousTotal = accumulator[index];
            const currentDelta = (itemValue < midCandidate) ? -1 : 1;
            accumulator.push(previousTotal + currentDelta);
            return accumulator;
        }, [0]);

        if (calculatePermutationDisorder(transformedSeries) >= targetDisorder) {
            return locateThresholdRecursively(currentLow, midCandidate);
        } else {
            return locateThresholdRecursively(midCandidate + 1, currentHigh);
        }
    };

    const finalThreshold = locateThresholdRecursively(lowerBound, upperBound);

    return finalThreshold - 1;
}

console.log(evaluateOptimalThreshold());