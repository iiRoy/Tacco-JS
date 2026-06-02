const parseInitialParameters = (lineContent) => {
    const parts = lineContent.split(" ");
    return {
        itemCount: parseInt(parts[0], 10),
        timeLimit: parseInt(parts[1], 10)
    };
};

const parseItemDetails = (detailStringArray) => {
    return detailStringArray.map(element => parseInt(element, 10));
};

function ProcessInput(rawData) {
    const allInputLines = rawData.trim().split("\n");

    const { itemCount, timeLimit } = parseInitialParameters(allInputLines[0]);

    let itemValuePairs = [];
    for (let i = 0; i < itemCount; i++) {
        itemValuePairs.push(parseItemDetails(allInputLines[i + 1].split(" ")));
    }

    itemValuePairs.sort((pairA, pairB) => pairA[1] - pairB[1]);

    const dynamicProgrammingTable = Array(itemCount + 1).fill(null).map(() => Array(timeLimit + 1).fill(0));

    for (let currentItemIndex = 0; currentItemIndex < itemCount; currentItemIndex++) {
        const itemTimeCost = itemValuePairs[currentItemIndex][0];
        const itemBenefitValue = itemValuePairs[currentItemIndex][1];

        for (let currentTimeCapacity = 0; currentTimeCapacity <= timeLimit; currentTimeCapacity++) {
            const valueWithoutCurrent = dynamicProgrammingTable[currentItemIndex][currentTimeCapacity];
            let valueIfCurrentTaken = 0;

            if (itemTimeCost <= currentTimeCapacity) {
                valueIfCurrentTaken = dynamicProgrammingTable[currentItemIndex][currentTimeCapacity - itemTimeCost] + itemBenefitValue;
                dynamicProgrammingTable[currentItemIndex + 1][currentTimeCapacity] = Math.max(valueWithoutCurrent, valueIfCurrentTaken);
            } else {
                dynamicProgrammingTable[currentItemIndex + 1][currentTimeCapacity] = valueWithoutCurrent;
            }
        }
    }

    const selectedItemIndicesForTMinus1 = [];
    let currentItemIterator = itemCount;
    let remainingCapacityForBacktrack = timeLimit - 1;

    while (currentItemIterator > 0 && remainingCapacityForBacktrack >= 0) {
        if (dynamicProgrammingTable[currentItemIterator][remainingCapacityForBacktrack] === dynamicProgrammingTable[currentItemIterator - 1][remainingCapacityForBacktrack]) {
            currentItemIterator--;
        } else {
            selectedItemIndicesForTMinus1.push(currentItemIterator - 1);
            remainingCapacityForBacktrack -= itemValuePairs[currentItemIterator - 1][0];
            currentItemIterator--;
        }
    }

    const isItemMarkedForRemoval = new Array(itemCount).fill(false);
    for (const indexToRemove of selectedItemIndicesForTMinus1) {
        isItemMarkedForRemoval[indexToRemove] = true;
    }
    const remainingItemCandidates = itemValuePairs.filter((_, index) => !isItemMarkedForRemoval[index]);

    let calculatedValueWithLastCandidate = 0;
    if (remainingItemCandidates.length > 0) {
        const lastCandidateItem = remainingItemCandidates[remainingItemCandidates.length - 1];
        calculatedValueWithLastCandidate = dynamicProgrammingTable[itemCount][timeLimit - 1] + lastCandidateItem[1];
    }

    const maximumValueAtFullCapacity = dynamicProgrammingTable[itemCount][timeLimit];
    console.log(Math.max(maximumValueAtFullCapacity, calculatedValueWithLastCandidate));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
