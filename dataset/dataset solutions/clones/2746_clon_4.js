((sourceInput) => {
    let parsedNumericData = sourceInput.trim().split(/\s+/).map(numStr => Number(numStr));
    let principalFigure = parsedNumericData.shift();
    let remainingNumericItems = parsedNumericData;

    let isPrincipalDivisibleByThree = (principalFigure % 3 === 0);
    let areAllRemainingItemsZero = (remainingNumericItems.every(val => val === 0));

    if (!isPrincipalDivisibleByThree && !areAllRemainingItemsZero) {
        console.log("No");
        return;
    }
    if (areAllRemainingItemsZero) {
        console.log("Yes");
        return;
    }

    const recursiveItemProcessor = (iterationsLeft, currentItemPointer, uniqueElementsList, occurrenceCounts, sourceCollection) => {
        if (iterationsLeft === 0) {
            return {
                uniques: uniqueElementsList,
                counts: occurrenceCounts
            };
        }

        if (uniqueElementsList.length > 3) {
            throw new Error("TOO_MANY_UNQUES");
        }

        let workingPointer = currentItemPointer;
        let workingUniques = [...uniqueElementsList];
        let workingCounts = [...occurrenceCounts];

        let itemForInnerScan = sourceCollection[workingPointer];

        let internalScanIndex = 0;
        while (internalScanIndex < workingUniques.length) {
            if (itemForInnerScan === workingUniques[internalScanIndex]) {
                workingCounts[internalScanIndex]++;
                workingPointer++;
                itemForInnerScan = sourceCollection[workingPointer];
                internalScanIndex = 0;
            } else {
                internalScanIndex++;
            }
        }

        workingUniques.push(itemForInnerScan);
        if (uniqueElementsList.length < 3) {
            if (workingCounts[uniqueElementsList.length] === 0) {
                workingCounts[uniqueElementsList.length]++;
            }
        }

        return recursiveItemProcessor(
            iterationsLeft - 1,
            workingPointer + 1,
            workingUniques,
            workingCounts,
            sourceCollection
        );
    };

    let processingOutcome;
    try {
        processingOutcome = recursiveItemProcessor(principalFigure, 0, [], [0, 0, 0], remainingNumericItems);
    } catch (signal) {
        if (signal.message === "TOO_MANY_UNQUES") {
            console.log("No");
            return;
        }
        throw signal;
    }

    const finalUniqueValues = processingOutcome.uniques;
    const finalFrequencies = processingOutcome.counts;

    if (finalUniqueValues.length > 3) {
        console.log("No");
        return;
    }

    const areAllFrequenciesIdentical = (finalFrequencies[0] === finalFrequencies[1] && finalFrequencies[1] === finalFrequencies[2]);
    const isSpecialFrequencyPattern = (finalFrequencies[2] === 0 && ((finalFrequencies[0] === (2 * finalFrequencies[1])) || (finalFrequencies[1] === (2 * finalFrequencies[0]))));

    if (!areAllFrequenciesIdentical && !isSpecialFrequencyPattern) {
        console.log("No");
        return;
    }

    const exclusiveOrSumIsZero = ((finalUniqueValues[0] ^ finalUniqueValues[1] ^ finalUniqueValues[2]) === 0);

    if (!exclusiveOrSumIsZero) {
        console.log("No");
        return;
    } else {
        console.log("Yes");
        return;
    }

})(require("fs").readFileSync("/dev/stdin", "utf8"));