function getArrayElements(sourceIterable, limitCount) {
    if (Array.isArray(sourceIterable)) {
        return sourceIterable;
    }

    let extractedElements = [];
    let iterationCompleted = false;
    let iterationErrored = false;
    let caughtError = undefined;
    let currentIterator;

    try {
        currentIterator = sourceIterable[Symbol.iterator]();

        for (
            let iteratorResult;
            !(iterationCompleted = (iteratorResult = currentIterator.next()).done) &&
            (extractedElements.push(iteratorResult.value), !limitCount || extractedElements.length !== limitCount);
            iterationCompleted = true
        ) {
            // Elements are pushed in the loop condition.
        }
    } catch (err) {
        iterationErrored = true;
        caughtError = err;
    } finally {
        try {
            if (!iterationCompleted && currentIterator != null && typeof currentIterator.return === 'function') {
                currentIterator.return();
            }
        } finally {
            if (iterationErrored) {
                throw caughtError;
            }
        }
    }
    return extractedElements;
}

const MINIMUM_HALVING_THRESHOLD = 4;

function processCompetitionData(inputLines) {
    const firstLineValues = inputLines[0].split(" ").map(Number);
    const [itemCount, maxHalvingOperations] = getArrayElements(firstLineValues, 2);

    const itemScores = inputLines[1].split(" ").map(Number);

    itemScores.sort((a, b) => b - a);

    let totalFinalScore = 0;
    let remainingHalvingBudget = maxHalvingOperations;

    for (let currentItemIndex = 0; currentItemIndex < itemCount; currentItemIndex++) {
        let currentItemScore = itemScores[currentItemIndex];
        let nextItemComparisonValue = 0;

        if (currentItemIndex < itemCount - 1) {
            nextItemComparisonValue = Math.min(itemScores[currentItemIndex + 1], MINIMUM_HALVING_THRESHOLD);
        }

        while (remainingHalvingBudget > 0 && currentItemScore >= nextItemComparisonValue) {
            currentItemScore = Math.floor(currentItemScore / 2);
            remainingHalvingBudget--;
        }
        totalFinalScore += currentItemScore;
    }

    console.log(totalFinalScore);
}

const fileSystemModule = require("fs");

const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");

const inputDataLines = rawInputContent.split("\n");

processCompetitionData(inputDataLines);
