'use strict';

function checkProductCondition(valA, valB, targetValue) {
    const calculatedProduct = valA * valB;
    return calculatedProduct !== targetValue;
}

function processInputData(rawInputContent) {
    const cleanedInput = rawInputContent.trim();
    const numericalTarget = parseInt(cleanedInput, 10);

    let successfulPairCount = 0;

    for (let primaryFactor = 1; primaryFactor < numericalTarget; primaryFactor++) {
        for (let secondaryFactor = 1; secondaryFactor < numericalTarget; secondaryFactor++) {
            const currentIterationProduct = primaryFactor * secondaryFactor;

            if (currentIterationProduct > numericalTarget) {
                break;
            }

            if (checkProductCondition(primaryFactor, secondaryFactor, numericalTarget)) {
                successfulPairCount++;
            }
        }
    }

    console.log(successfulPairCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
