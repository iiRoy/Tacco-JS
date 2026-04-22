const processInputData = (incomingText) => {
    const textLines = incomingText.trim().split('\n');
    const initialParameters = textLines[0].split(' ').map(Number);
    const quantityOfItems = initialParameters[0];
    const weightLimit = initialParameters[1];

    const itemCollection = [];
    for (let index = 1; index <= quantityOfItems; ++index) {
        const itemDetails = textLines[index].split(' ').map(Number);
        itemCollection.push([itemDetails[0], itemDetails[1]]);
    }
    return { quantityOfItems, weightLimit, itemCollection };
};

const executeOptimization = (suppliedData) => {
    const { quantityOfItems: totalUnits, weightLimit: maximumCapacity, itemCollection: availableUnits } = suppliedData;

    availableUnits.sort((unitA, unitB) => unitB[1] - unitA[1]);

    const aggregatedLoads = new Array(totalUnits + 1).fill(0);
    const aggregatedPrizes = new Array(totalUnits + 1).fill(0);

    for (let currentPos = 0; currentPos < totalUnits; ++currentPos) {
        aggregatedLoads[currentPos + 1] = aggregatedLoads[currentPos] + availableUnits[currentPos][0];
        aggregatedPrizes[currentPos + 1] = aggregatedPrizes[currentPos] + availableUnits[currentPos][1];
    }

    let highestPrizeAchieved = 0;

    for (let windowStart = 0; windowStart < totalUnits; ++windowStart) {
        for (let windowEnd = windowStart; windowEnd < totalUnits; ++windowEnd) {
            const segmentLoad = aggregatedLoads[windowEnd + 1] - aggregatedLoads[windowStart];
            const segmentPrize = aggregatedPrizes[windowEnd + 1] - aggregatedPrizes[windowStart];

            if (segmentLoad <= maximumCapacity) {
                if (segmentPrize > highestPrizeAchieved) {
                    highestPrizeAchieved = segmentPrize;
                }
            }
        }
    }
    return highestPrizeAchieved;
};

const primaryExecution = (inputSource) => {
    const processed = processInputData(inputSource);
    const finalOutcome = executeOptimization(processed);
    console.log(finalOutcome);
};

primaryExecution(require("fs").readFileSync("/dev/stdin", "utf8"));