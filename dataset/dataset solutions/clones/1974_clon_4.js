const combineOrderedHalves = (firstHalf, secondHalf) => {
    let combinedResult = [];
    let leftPosition = 0;
    let rightPosition = 0;

    while (leftPosition < firstHalf.length && rightPosition < secondHalf.length) {
        if (firstHalf[leftPosition][0] < secondHalf[rightPosition][0]) {
            combinedResult.push(firstHalf[leftPosition]);
            leftPosition++;
        } else {
            combinedResult.push(secondHalf[rightPosition]);
            rightPosition++;
        }
    }
    return combinedResult.concat(firstHalf.slice(leftPosition)).concat(secondHalf.slice(rightPosition));
};

const organizeNumericCollection = (collection) => {
    if (collection.length <= 1) {
        return collection;
    }

    const midPoint = Math.floor(collection.length / 2);
    const leftSegment = collection.slice(0, midPoint);
    const rightSegment = collection.slice(midPoint);

    return combineOrderedHalves(
        organizeNumericCollection(leftSegment),
        organizeNumericCollection(rightSegment)
    );
};

const ingestData = (sourceText) => {
    const lines = sourceText.trim().split(/\n/);
    const initialParameters = lines[0].split(/\s+/).map(Number);
    const dataValues = lines[1].split(/\s+/).map(Number);

    const dataObjects = dataValues.map((val, idx) => ({ initialPosition: idx, actualValue: val }));
    return { overallSize: initialParameters[0], items: dataObjects };
};

const deriveOverallMagnitude = (inputPayload) => {
    const totalCount = inputPayload.overallSize;
    const itemCollection = inputPayload.items;

    const sortedCollection = organizeNumericCollection(itemCollection.map(obj => [obj.actualValue, obj.initialPosition]));

    const finalAccumulationState = sortedCollection.reduceRight((accumulator, currentItemPair, itemIndex) => {
        const { currentLeftBoundary, currentRightBoundary, runningSum } = accumulator;
        const [currentNumericalValue, currentOriginalIndex] = currentItemPair;

        const distanceToRightEnd = totalCount - currentOriginalIndex;
        const distanceToLeftEnd = currentOriginalIndex + 1;

        let nextLeftBoundary = currentLeftBoundary;
        let nextRightBoundary = currentRightBoundary;
        let nextRunningSum = runningSum;

        if (distanceToRightEnd < distanceToLeftEnd) {
            nextRunningSum += currentNumericalValue * (currentOriginalIndex - currentLeftBoundary + 1);
            nextLeftBoundary++;
        } else if (distanceToRightEnd > distanceToLeftEnd) {
            nextRunningSum += currentNumericalValue * (currentRightBoundary - currentOriginalIndex - 1);
            nextRightBoundary--;
        } else {
            // Equidistant case: tie-breaking by examining the next larger element in the sorted list
            const nextItemInSortedArray = sortedCollection[itemIndex + 1];
            const [, nextOriginalIndex] = nextItemInSortedArray;

            const nextItemDistanceToRightEnd = totalCount - nextOriginalIndex;
            const nextItemDistanceToLeftEnd = nextOriginalIndex + 1;

            if (nextItemDistanceToRightEnd < nextItemDistanceToLeftEnd) {
                nextRunningSum += currentNumericalValue * (currentRightBoundary - currentOriginalIndex - 1);
                nextRightBoundary--;
            } else if (nextItemDistanceToRightEnd > nextItemDistanceToLeftEnd) {
                nextRunningSum += currentNumericalValue * (currentOriginalIndex - currentLeftBoundary + 1);
                nextLeftBoundary++;
            }
        }

        return {
            currentLeftBoundary: nextLeftBoundary,
            currentRightBoundary: nextRightBoundary,
            runningSum: nextRunningSum
        };
    }, { currentLeftBoundary: 1, currentRightBoundary: totalCount, runningSum: 0 });

    return finalAccumulationState.runningSum;
};

const commenceProcessing = () => {
    const fileSystem = require("fs");
    const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    const parsedData = ingestData(rawInputContent);
    const finalOutcome = deriveOverallMagnitude(parsedData);
    console.log(finalOutcome);
};

commenceProcessing();