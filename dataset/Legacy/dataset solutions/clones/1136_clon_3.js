function processKnapsackInput(rawInputStr) {
    const parsedLines = rawInputStr.split('\n').filter(line => line.length > 0);

    const firstLineData = parsedLines.shift();
    const [itemCount, capacityLimit] = firstLineData.split(' ').map(Number);

    const parseItemLine = (lineContent) => lineContent.split(' ').map(Number);
    const itemDetails = parsedLines.map(parseItemLine);

    const finalKnapsackState = calculateOptimalKnapsack(itemDetails, capacityLimit);

    console.log(finalKnapsackState[0]);
}

function createInitialKnapsackStates(size) {
    return Array.from({ length: size }, () => [0, 0]);
}

function calculateOptimalKnapsack(availableItems, currentCapacityLimit) {
    let currentKnapsackStates = createInitialKnapsackStates(currentCapacityLimit + 1);
    let previousKnapsackStates = [];

    const getBetterState = (stateA, stateB) => {
        if (stateA[0] >= stateB[0]) {
            return stateA;
        }
        return stateB;
    };

    for (let itemIndex = 0; itemIndex < availableItems.length; itemIndex++) {
        previousKnapsackStates = currentKnapsackStates.map(arr => arr.slice());

        const currentItem = availableItems[itemIndex];
        const currentItemValue = currentItem[0];
        const currentItemWeight = currentItem[1];

        for (let currentWeightCapacity = 0; currentWeightCapacity <= currentCapacityLimit; currentWeightCapacity++) {
            if (currentWeightCapacity === 0) {
                currentKnapsackStates[currentWeightCapacity] = [0, 0];
                continue;
            }

            let bestStateForCurrentCapacity = previousKnapsackStates[currentWeightCapacity];

            if (currentWeightCapacity >= currentItemWeight) {
                if (bestStateForCurrentCapacity[0] < currentItemValue) {
                    bestStateForCurrentCapacity = currentItem.slice();
                }
            }

            const remainingCapacityAfterCurrentItem = currentWeightCapacity - currentItemWeight;
            if (remainingCapacityAfterCurrentItem >= 0) {
                const stateFromPreviousItems = previousKnapsackStates[remainingCapacityAfterCurrentItem];

                if (stateFromPreviousItems !== undefined) {
                    const combinedValueWeight = [
                        stateFromPreviousItems[0] + currentItemValue,
                        stateFromPreviousItems[1] + currentItemWeight
                    ];
                    bestStateForCurrentCapacity = getBetterState(bestStateForCurrentCapacity, combinedValueWeight);
                }
            }
            currentKnapsackStates[currentWeightCapacity] = bestStateForCurrentCapacity;
        }
    }
    return currentKnapsackStates[currentCapacityLimit];
}

const STD_IN_FILE_PATH = '/dev/stdin';
const fileSystemModule = require('fs');

processKnapsackInput(fileSystemModule.readFileSync(STD_IN_FILE_PATH, 'utf8'));
