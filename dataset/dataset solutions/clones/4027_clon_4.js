"use strict";

function computeCardDifference(inputData) {
    const valueLineMatch = inputData.match(/\n(.+)/);
    if (!valueLineMatch || valueLineMatch.length < 2) {
        return 0; // Handle malformed input gracefully, though problem constraints usually prevent this
    }
    const valueLine = valueLineMatch[1];

    const numericalItems = valueLine.match(/\d+/g).map(numStr => Number(numStr));

    numericalItems.sort((first, second) => first - second).reverse();

    function determineScoreDifference(itemsCollection, currentIndex, currentP1Sum, currentP2Sum, isP1Next) {
        if (currentIndex >= itemsCollection.length) {
            return currentP1Sum - currentP2Sum;
        }

        const chosenValue = itemsCollection[currentIndex];

        if (isP1Next) {
            return determineScoreDifference(itemsCollection, currentIndex + 1, currentP1Sum + chosenValue, currentP2Sum, false);
        } else {
            return determineScoreDifference(itemsCollection, currentIndex + 1, currentP1Sum, currentP2Sum + chosenValue, true);
        }
    }

    return determineScoreDifference(numericalItems, 0, 0, 0, true);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
const finalResult = computeCardDifference(rawInputContent);

console.log(finalResult);