const establishOrderlyItems = (itemCollection) => {
    const distinctItems = new Set(itemCollection);
    const sortedDistinctItems = Array.from(distinctItems).sort((a, b) => a - b);
    return sortedDistinctItems;
};

const calculateOptimalArrangementCost = (itemSequence, sequenceLength, costContainer, targetOrder) => {
    let currentAccumulatedCost = 0;
    const itemCurrentPositions = new Map();

    const refreshItemPositions = () => {
        itemCurrentPositions.clear();
        for (let k = 0; k < sequenceLength; k++) {
            itemCurrentPositions.set(itemSequence[k], k);
        }
    };

    refreshItemPositions();

    while (true) {
        let misplacedElementCount = 0;
        let smallestMisplacedElement = Infinity;
        
        for (let i = 0; i < sequenceLength; i++) {
            if (itemSequence[i] !== targetOrder[i]) {
                misplacedElementCount++;
                if (itemSequence[i] < smallestMisplacedElement) {
                    smallestMisplacedElement = itemSequence[i];
                }
            }
        }

        if (misplacedElementCount === 0) {
            break;
        }

        let elementToOperate = smallestMisplacedElement;
        let elementToOperateCurrentIndex = itemCurrentPositions.get(elementToOperate);

        if (itemSequence[0] === 0 && misplacedElementCount > 2) {
            const zeroValueIndex = itemCurrentPositions.get(0); // Should be 0
            const smallestMisplacedElementActualIndex = itemCurrentPositions.get(smallestMisplacedElement);

            // Swap 0 (at index 0) with smallestMisplacedElement (at its current index)
            [itemSequence[0], itemSequence[smallestMisplacedElementActualIndex]] = 
            [itemSequence[smallestMisplacedElementActualIndex], itemSequence[0]];

            // Update position map for the swapped elements
            itemCurrentPositions.set(0, smallestMisplacedElementActualIndex);
            itemCurrentPositions.set(smallestMisplacedElement, zeroValueIndex);

            currentAccumulatedCost += smallestMisplacedElement;
            elementToOperate = 0; // For the next main swap, 0 is the element to move
            elementToOperateCurrentIndex = zeroValueIndex; // And its index is 0
        }

        // Main swap logic
        const valueExpectedAtElementToOperateIndex = targetOrder[elementToOperateCurrentIndex];
        const actualIndexForExpectedValue = itemCurrentPositions.get(valueExpectedAtElementToOperateIndex);

        const valueAtActualIndexForExpectedValue = itemSequence[actualIndexForExpectedValue];
        
        // Perform the swap using destructuring
        [itemSequence[elementToOperateCurrentIndex], itemSequence[actualIndexForExpectedValue]] = 
        [itemSequence[actualIndexForExpectedValue], itemSequence[elementToOperateCurrentIndex]];

        // Update position map for the swapped elements
        itemCurrentPositions.set(elementToOperate, actualIndexForExpectedValue);
        itemCurrentPositions.set(valueAtActualIndexForExpectedValue, elementToOperateCurrentIndex);

        currentAccumulatedCost += elementToOperate + valueAtActualIndexForExpectedValue;
    }
    costContainer[0] = currentAccumulatedCost;
};

const processInputAndCalculate = (inputData) => {
    const inputLines = inputData.split("\n");
    const collectionSize = Number(inputLines.shift());
    const initialCollection = inputLines[0].split(' ').map(Number);
    const finalCostHolder = [0];
    
    const desiredArrangement = establishOrderlyItems(initialCollection);

    calculateOptimalArrangementCost(initialCollection, collectionSize, finalCostHolder, desiredArrangement);
    console.log(finalCostHolder[0]);
};

processInputAndCalculate(require("node:fs").readFileSync("/dev/stdin", "utf8"));
