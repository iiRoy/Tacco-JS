process.stdin.resume();
process.stdin.setEncoding('utf8');

const sortItems = (collection) => {
    collection.sort((itemOne, itemTwo) => itemTwo.value - itemOne.value);
    return collection;
};

const computeGcdRecursive = (firstVal, secondVal) => {
    if (secondVal === 0) {
        return firstVal;
    }
    return computeGcdRecursive(secondVal, firstVal % secondVal);
};

const findGreatestCommonDivisor = (numX, numY) => {
    return numX > numY ? computeGcdRecursive(numX, numY) : computeGcdRecursive(numY, numX);
};

const calculateArrayGcd = (numberSequence) => {
    if (numberSequence.length === 0) {
        return 0;
    }
    if (numberSequence.length === 1) {
        return numberSequence[0];
    }
    return numberSequence.reduce((accumulator, current) => findGreatestCommonDivisor(accumulator, current));
};

const executeProcessing = (rawInput) => {
    const inputLines = rawInput.split("\n");
    const firstLineData = inputLines[0].split(" ");
    const elementCount = parseInt(firstLineData[0]);
    const inputNumbers = inputLines[1].split(" ").map(Number);

    const indexedData = inputNumbers.map((val, idx) => ({ originalIndex: idx, value: val }));

    const sortedIndexedData = sortItems(indexedData);

    const initialAccumulatorState = {
        currentTotalSum: 0,
        leftBoundaryMarker: 1,
        rightBoundaryMarker: elementCount
    };

    const finalResultState = sortedIndexedData.reduceRight((accumulator, currentItem, currentIndex, fullArray) => {
        let { currentTotalSum, leftBoundaryMarker, rightBoundaryMarker } = accumulator;

        const currentOriginalIndex = currentItem.originalIndex;
        const currentItemValue = currentItem.value;

        const distanceToRightEnd = elementCount - currentOriginalIndex;
        const distanceToLeftEnd = currentOriginalIndex + 1;

        if (distanceToRightEnd < distanceToLeftEnd) {
            currentTotalSum += currentItemValue * (currentOriginalIndex - leftBoundaryMarker + 1);
            leftBoundaryMarker++;
        } else if (distanceToRightEnd > distanceToLeftEnd) {
            currentTotalSum += currentItemValue * (rightBoundaryMarker - currentOriginalIndex - 1);
            rightBoundaryMarker--;
        } else {
            const nextItemInSorted = fullArray[currentIndex + 1];
            
            const nextOriginalIndex = nextItemInSorted.originalIndex;
            const nextDistanceToRightEnd = elementCount - nextOriginalIndex;
            const nextDistanceToLeftEnd = nextOriginalIndex + 1;

            if (nextDistanceToRightEnd > nextDistanceToLeftEnd) {
                currentTotalSum += currentItemValue * (currentOriginalIndex - leftBoundaryMarker + 1);
                leftBoundaryMarker++;
            } else {
                currentTotalSum += currentItemValue * (rightBoundaryMarker - currentOriginalIndex - 1);
                rightBoundaryMarker--;
            }
        }

        return { currentTotalSum, leftBoundaryMarker, rightBoundaryMarker };
    }, initialAccumulatorState);

    console.log(finalResultState.currentTotalSum);
};

executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
