const retrieveInputLines = () => {
    const fileSystem = require("fs");
    const fileContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    return fileContent.split(/\n\r?/);
};

function getTripletCount(limitVal, targetVal) {
    let finalCount = 0;

    function findUniqueTriplets(currentCandidate, currentDepth, accumulatedSum) {
        if (currentDepth === 3) {
            if (accumulatedSum === targetVal) {
                finalCount++;
            }
            return;
        }

        const maxNumForCurrentSlot = limitVal - (3 - (currentDepth + 1));

        for (let numChoice = currentCandidate; numChoice <= maxNumForCurrentSlot; numChoice++) {
            if (accumulatedSum + numChoice > targetVal) {
                break;
            }
            findUniqueTriplets(numChoice + 1, currentDepth + 1, accumulatedSum + numChoice);
        }
    }

    findUniqueTriplets(1, 0, 0);
    return finalCount;
}

for (const currentInputLine of retrieveInputLines()) {
    const numericValues = currentInputLine.split(' ');
    const upperBound = +numericValues[0];
    const targetSum = +numericValues[1];

    if (!upperBound && !targetSum) {
        break;
    }

    const combinationResult = getTripletCount(upperBound, targetSum);
    console.log(combinationResult);
}
