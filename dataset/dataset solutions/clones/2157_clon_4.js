"use strict";

let sourceDataBuffer = "";
process.stdin.on('data', (inputChunk) => { sourceDataBuffer += inputChunk; });
process.stdin.on('end', () => {
    const parsedNumericTokens = sourceDataBuffer.split(/\s+/).filter(Boolean).map(Number);
    const finalOutcome = coreCalculationEngine(parsedNumericTokens);
    if (finalOutcome !== undefined) {
        console.log(finalOutcome);
    }
});

function coreCalculationEngine(rawData) {
    let tokenCursorPosition = 0;
    const retrieveNextBigInt = () => BigInt(rawData[tokenCursorPosition++]);

    const elementQuantity = retrieveNextBigInt();
    const desiredOrdinalRank = retrieveNextBigInt();

    const positiveValueCollection = [];
    const negativeValueCollection = [];
    let zeroElementQuantity = 0n;

    for (let idx = 0; idx < elementQuantity; ++idx) {
        const currentVal = retrieveNextBigInt();
        if (currentVal === 0n) {
            zeroElementQuantity++;
        } else if (currentVal < 0n) {
            negativeValueCollection.push(currentVal);
        } else {
            positiveValueCollection.push(currentVal);
        }
    }

    negativeValueCollection.sort((a, b) => Number(a - b));
    positiveValueCollection.sort((a, b) => Number(a - b));

    const negativePositiveProductTotal = BigInt(negativeValueCollection.length) * BigInt(positiveValueCollection.length);
    const zeroProductTotal = (elementQuantity - zeroElementQuantity) * zeroElementQuantity + (zeroElementQuantity * (zeroElementQuantity - 1n)) / 2n;

    if (desiredOrdinalRank <= negativePositiveProductTotal) {
        return findKthSmallestNegativeProduct(negativeValueCollection, positiveValueCollection, desiredOrdinalRank).toString();
    } else if (desiredOrdinalRank <= negativePositiveProductTotal + zeroProductTotal) {
        return "0";
    } else {
        return findKthSmallestPositiveProduct(negativeValueCollection, positiveValueCollection, desiredOrdinalRank - (negativePositiveProductTotal + zeroProductTotal)).toString();
    }
}

function findKthSmallestNegativeProduct(negativesArray, positivesArray, requestedRank) {
    let rangeMinimum = -1000000000n * 1000000000n - 1n; // Max possible negative product + a bit more
    let rangeMaximum = 0n; // Products are negative or can be 0 (but 0 is handled separately for ranking)

    while (rangeMinimum < rangeMaximum) {
        const currentMidpoint = rangeMinimum + (rangeMaximum - rangeMinimum) / 2n;
        let accumulatedCount = 0n;
        
        let negativeCollectionScanIndex = 0;
        for (const iteratedPositiveValue of positivesArray) {
            // For a negative number `currentNegativeValue` and positive `iteratedPositiveValue`,
            // we want `currentNegativeValue * iteratedPositiveValue <= currentMidpoint`.
            // Since `currentNegativeValue` values are sorted ascending (e.g., -10, -5, -2),
            // and `iteratedPositiveValue` is positive, as `currentNegativeValue` increases,
            // the product `currentNegativeValue * iteratedPositiveValue` also increases (becomes less negative).
            // We need to count `currentNegativeValue`s from `negativesArray` that satisfy the condition.
            while (negativeCollectionScanIndex < negativesArray.length && (negativesArray[negativeCollectionScanIndex] * iteratedPositiveValue) <= currentMidpoint) {
                negativeCollectionScanIndex++;
            }
            accumulatedCount += BigInt(negativeCollectionScanIndex);
        }

        if (accumulatedCount >= requestedRank) {
            rangeMaximum = currentMidpoint;
        } else {
            rangeMinimum = currentMidpoint + 1n;
        }
    }
    return rangeMaximum;
}

function findKthSmallestPositiveProduct(negativesArray, positivesArray, requestedRank) {
    let rangeMinimum = 1n; // Smallest possible positive product
    let rangeMaximum = 1000000000n * 1000000000n + 1n; // Max possible positive product + a bit more

    while (rangeMinimum < rangeMaximum) {
        const currentMidpoint = rangeMinimum + (rangeMaximum - rangeMinimum) / 2n;
        let accumulatedCount = 0n;

        // Count products from positive numbers (positivesArray[i] * positivesArray[j])
        let rightPositivesIndex = positivesArray.length - 1;
        for (let leftPositivesIndex = 0; leftPositivesIndex < positivesArray.length; leftPositivesIndex++) {
            while (rightPositivesIndex > leftPositivesIndex && (positivesArray[leftPositivesIndex] * positivesArray[rightPositivesIndex]) > currentMidpoint) {
                rightPositivesIndex--;
            }
            if (rightPositivesIndex <= leftPositivesIndex) {
                break;
            }
            accumulatedCount += BigInt(rightPositivesIndex - leftPositivesIndex);
        }

        // Count products from negative numbers (negativesArray[i] * negativesArray[j])
        // `negativesArray` is sorted ascending (e.g., [-10, -5, -2]).
        // We want to count pairs `(negativesArray[i] * negativesArray[j]) <= currentMidpoint` where `i < j`.
        // `negativesArray[leftNegativesIndex]` is more negative than `negativesArray[rightNegativesIndex]`.
        // Their product is positive.
        let rightNegativesIndex = negativesArray.length - 1;
        for (let leftNegativesIndex = 0; leftNegativesIndex < negativesArray.length; leftNegativesIndex++) {
            while (rightNegativesIndex > leftNegativesIndex && (negativesArray[leftNegativesIndex] * negativesArray[rightNegativesIndex]) > currentMidpoint) {
                rightNegativesIndex--;
            }
            if (rightNegativesIndex <= leftNegativesIndex) {
                break;
            }
            accumulatedCount += BigInt(rightNegativesIndex - leftNegativesIndex);
        }

        if (accumulatedCount >= requestedRank) {
            rangeMaximum = currentMidpoint;
        } else {
            rangeMinimum = currentMidpoint + 1n;
        }
    }
    return rangeMaximum;
}