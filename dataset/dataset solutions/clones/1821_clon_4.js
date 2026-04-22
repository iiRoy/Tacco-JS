const acquiredData = require('node:fs').readFileSync(0, 'utf8');

const transformAndParse = (rawText) =>
    rawText.trim().split(/\s+/).filter(Boolean).map(Number);

const numericalSequence = transformAndParse(acquiredData);

const elementCount = numericalSequence[0];

const buildCollectionsRecursive = (sourceArray, currentIdx, limit, firstCollection = [], secondCollection = []) => {
    if (currentIdx >= limit * 2) {
        return { firstCollection, secondCollection };
    }
    firstCollection.push(sourceArray[currentIdx]);
    secondCollection.push(sourceArray[currentIdx + 1]);
    return buildCollectionsRecursive(sourceArray, currentIdx + 2, limit, firstCollection, secondCollection);
};

const processedCollections = buildCollectionsRecursive(numericalSequence.slice(1), 0, elementCount);

const initialBounds = processedCollections.firstCollection;
const finalBounds = processedCollections.secondCollection;

const naturalOrderSort = (u, v) => u - v;
initialBounds.sort(naturalOrderSort);
finalBounds.sort(naturalOrderSort);

const computeDifference = (countVal, lowerSet, upperSet) => {
    const isValEven = (countVal % 2 === 0);
    const midPointIndex = Math.floor(countVal / 2);

    const determineComponent = (dataArr, evenFlag) => {
        return evenFlag
            ? (dataArr[midPointIndex - 1] + dataArr[midPointIndex])
            : dataArr[midPointIndex];
    };

    const minOutcome = determineComponent(lowerSet, isValEven);
    const maxOutcome = determineComponent(upperSet, isValEven);

    return maxOutcome - minOutcome + 1;
};

const finalComputation = computeDifference(elementCount, initialBounds, finalBounds);

process.stdout.write(finalComputation.toString() + '\n');