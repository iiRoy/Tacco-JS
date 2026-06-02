const createGameCard = (symbol, num) => ({
    designator: String(symbol),
    rankValue: Number(num)
});

const areIdenticalUnits = (unitA, unitB) =>
    unitA.rankValue === unitB.rankValue && unitA.designator === unitB.designator;

const determineRelativeRank = (unitA, unitB) => {
    if (unitA.rankValue === unitB.rankValue) return 0;
    return unitA.rankValue < unitB.rankValue ? -1 : 1;
};

const renderPiece = (unit) => `${unit.designator} ${unit.rankValue}`;

(function processGameData() {
    const fileSystem = require('fs');
    const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    const itemCount = Number(inputLines.shift());

    const sourceItems = inputLines.map(lineContent => {
        const pieceParts = lineContent.split(' ');
        return createGameCard(pieceParts[0], pieceParts[1]);
    });

    const processedCollection = sortUnitsByMerge(Array.from(sourceItems), determineRelativeRank);

    let stabilityOutcome = true;
    const indexedSource = sourceItems.map((originalPiece, originalPosition) => ({
        pieceValue: originalPiece,
        originalPosition: originalPosition
    }));

    const stableReference = indexedSource.sort((unitA, unitB) => {
        const rankComparison = determineRelativeRank(unitA.pieceValue, unitB.pieceValue);
        if (rankComparison !== 0) {
            return rankComparison;
        }
        return unitA.originalPosition - unitB.originalPosition;
    });

    for (let k = 0; k < itemCount; k++) {
        const referencePiece = stableReference[k].pieceValue;
        const sortedPiece = processedCollection[k];
        if (!areIdenticalUnits(referencePiece, sortedPiece)) {
            stabilityOutcome = false;
            break;
        }
    }

    console.log(stabilityOutcome ? 'Stable' : 'Not stable');
    console.log(processedCollection.map(renderPiece).join('\n'));
})();

function sortUnitsByMerge(collection, comparisonFunction) {
    function combineSortedHalves(leftSegment, rightSegment, compFn) {
        const mergedResult = [];
        let leftPointer = 0;
        let rightPointer = 0;

        while (leftPointer < leftSegment.length && rightPointer < rightSegment.length) {
            if (compFn(leftSegment[leftPointer], rightSegment[rightPointer]) <= 0) {
                mergedResult.push(leftSegment[leftPointer]);
                leftPointer++;
            } else {
                mergedResult.push(rightSegment[rightPointer]);
                rightPointer++;
            }
        }
        return mergedResult.concat(leftSegment.slice(leftPointer)).concat(rightSegment.slice(rightPointer));
    }

    function performRecursiveMergeSort(currentArray) {
        if (currentArray.length <= 1) {
            return currentArray;
        }

        const midPoint = Math.floor(currentArray.length / 2);
        const leftHalf = currentArray.slice(0, midPoint);
        const rightHalf = currentArray.slice(midPoint);

        return combineSortedHalves(
            performRecursiveMergeSort(leftHalf),
            performRecursiveMergeSort(rightHalf),
            comparisonFunction
        );
    }

    return performRecursiveMergeSort(collection);
}
