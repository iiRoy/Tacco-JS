function ProcessInput(rawData) {
    const allInputLines = rawData.trim().split("\n");

    const [numItemsStr, timeLimitStr] = allInputLines[0].split(" ");
    const itemCount = parseInt(numItemsStr, 10);
    const timeLimit = parseInt(timeLimitStr, 10);

    const itemsData = [];
    for (let lineIndex = 1; lineIndex <= itemCount; lineIndex++) {
        const itemParts = allInputLines[lineIndex].split(" ");
        const itemTime = parseInt(itemParts[0], 10);
        const itemValue = parseInt(itemParts[1], 10);
        itemsData.push([itemTime, itemValue]);
    }

    itemsData.sort((itemA, itemB) => itemA[0] - itemB[0]);

    const memoTable = Array.from({ length: itemCount + 1 }, () =>
        Array.from({ length: timeLimit }, () => [0, 0])
    );

    for (let itemIdx = 0; itemIdx < itemCount; itemIdx++) {
        const currentItem = itemsData[itemIdx];
        const currentItemTime = currentItem[0];
        const currentItemValue = currentItem[1];

        for (let currentTimeSlot = 0; currentTimeSlot < timeLimit; currentTimeSlot++) {
            const prevRowCurrentSlotState = memoTable[itemIdx][currentTimeSlot];
            const currentRowCurrentSlotState = memoTable[itemIdx + 1][currentTimeSlot];

            let valueIfSkipped = prevRowCurrentSlotState[0];
            let valueIfTaken = 0;

            if (currentItemTime <= currentTimeSlot) {
                const prevRowRemainingSlotState = memoTable[itemIdx][currentTimeSlot - currentItemTime];
                valueIfTaken = prevRowRemainingSlotState[0] + currentItemValue;
            }
            currentRowCurrentSlotState[0] = Math.max(valueIfSkipped, valueIfTaken);

            let prevMaxState1 = prevRowCurrentSlotState[1];
            let currentItemAddedToPrevState0 = prevRowCurrentSlotState[0] + currentItemValue;
            currentRowCurrentSlotState[1] = Math.max(prevMaxState1, currentItemAddedToPrevState0);
        }
    }

    console.log(memoTable[itemCount][timeLimit - 1][1]);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
