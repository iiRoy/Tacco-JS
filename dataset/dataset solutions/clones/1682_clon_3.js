function processInputData(rawData) {
    const parsedLines = rawData.trim().split("\n").map(lineStr => lineStr.split(" "));
    let currentLineIndex = 1;

    // Helper function to parse an array of strings to integers
    const parseLineElementsToInts = (elements) => elements.map(elementVal => parseInt(elementVal, 10));

    // Helper function to get unique sorted K values
    const getUniqueSortedKList = (kValues) => {
        return kValues.sort((a, b) => a - b).filter((val, idx, originalArray) => originalArray.indexOf(val) === idx);
    };

    // Helper function to initialize slot tracking data structures
    function initializeSlotTracking(kList) {
        if (kList.length === 0) {
            return { slotTracker: [[], []], kIndexMap: [] };
        }
        const maxKValue = kList[kList.length - 1];
        // kIndexMap initialized with 0s, replicating original behavior for non-explicitly mapped K values
        const kIndexMap = Array.from({ length: maxKValue + 1 }, () => 0);
        const slotTracker = [[], []]; // [available_slots, used_slots]

        let lastKProcessed = -1;
        for (let idx = 0; idx < kList.length; idx++) {
            const currentK = kList[idx];
            slotTracker[0].push(currentK - lastKProcessed); // available_slots
            slotTracker[1].push(0); // used_slots
            kIndexMap[currentK] = idx;
            lastKProcessed = currentK;
        }
        return { slotTracker, kIndexMap };
    }

    // Helper function to apply increments based on KLR items
    function applyIncrements(itemsList, kIndexMap, slotTracker, finalResultContainer) {
        const K_VAL_IDX = 0;
        const L_VAL_IDX = 1;
        const R_VAL_IDX = 2;

        for (let idx = 0; idx < itemsList.length; idx++) {
            const currentItem = itemsList[idx];
            const potentialGain = currentItem[L_VAL_IDX] - currentItem[R_VAL_IDX];
            const targetKForSlot = currentItem[K_VAL_IDX] - 1;

            let currentSlotIdx = kIndexMap[targetKForSlot];

            while (currentSlotIdx !== undefined && currentSlotIdx >= 0 && slotTracker[1][currentSlotIdx] === slotTracker[0][currentSlotIdx]) {
                currentSlotIdx--;
            }

            if (currentSlotIdx !== undefined && currentSlotIdx >= 0) {
                slotTracker[1][currentSlotIdx]++;
                finalResultContainer.value += potentialGain;
            }
        }
    }

    // Constants for KLR array indices
    const K_IDX = 0;
    const L_IDX = 1;
    const R_IDX = 2;

    while (currentLineIndex < parsedLines.length && parsedLines[currentLineIndex] !== undefined) {
        const numItems = parseInt(parsedLines[currentLineIndex][0], 10);
        if (isNaN(numItems) || numItems === 0) { // Guard clause for invalid N or end of input
            break;
        }

        const itemsTypeA = [];
        const itemsTypeB = [];
        const kValuesListA = [];
        const kValuesListB = [];
        let baseSum = 0;
        let remainingItemsCount = numItems;

        for (let idx = 0; idx < numItems; idx++) {
            const currentLineData = parseLineElementsToInts(parsedLines[currentLineIndex + idx + 1]);

            const kValue = currentLineData[K_IDX];
            const lValue = currentLineData[L_IDX];
            const rValue = currentLineData[R_IDX];

            if (kValue === numItems) {
                baseSum += lValue;
                remainingItemsCount--;
            } else if (lValue > rValue) {
                itemsTypeA.push(currentLineData);
                baseSum += rValue;
                kValuesListA.push(kValue - 1);
            } else if (lValue < rValue) {
                // Original transformation: [N - line[0], line[2], line[1]]
                const transformedItem = [numItems - kValue, rValue, lValue];
                itemsTypeB.push(transformedItem);
                baseSum += lValue; // Original adds L_IDX of original line
                kValuesListB.push(numItems - kValue - 1); // K for transformed line is N - K_orig - 1
            } else { // lValue === rValue
                baseSum += lValue;
                remainingItemsCount--;
            }
        }

        itemsTypeA.sort((a, b) => a[K_IDX] - b[K_IDX]);
        itemsTypeB.sort((a, b) => a[K_IDX] - b[K_IDX]);

        const uniqueKValuesA = getUniqueSortedKList(kValuesListA);
        const uniqueKValuesB = getUniqueSortedKList(kValuesListB);

        const { slotTracker: slotTrackerA, kIndexMap: kIndexMapA } = initializeSlotTracking(uniqueKValuesA);
        const { slotTracker: slotTrackerB, kIndexMap: kIndexMapB } = initializeSlotTracking(uniqueKValuesB);

        const finalResultContainer = { value: baseSum }; // Use an object to pass by reference

        applyIncrements(itemsTypeA, kIndexMapA, slotTrackerA, finalResultContainer);
        applyIncrements(itemsTypeB, kIndexMapB, slotTrackerB, finalResultContainer);

        console.log(finalResultContainer.value);

        currentLineIndex += numItems + 1;
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
