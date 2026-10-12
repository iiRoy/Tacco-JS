function processInput(rawDataStr) {
    let processedLines = rawDataStr.trim().split("\n").map(rowStr => rowStr.split(" "));

    let lineOffset = 1;

    const performGreedyAssignment = (dataSet, currentAccumulatedSum, totalAvailableSlots) => {
        let slotTracker = new Array(totalAvailableSlots).fill(false);
        let updatedSum = currentAccumulatedSum;

        for (let k = 0; k < dataSet.length; k++) {
            const currentItem = dataSet[k];
            let potentialSlot = currentItem[0] - 1;
            const gainValue = currentItem[1] - currentItem[2];

            while (potentialSlot >= 0 && slotTracker[potentialSlot]) {
                potentialSlot--;
            }

            if (potentialSlot >= 0) {
                slotTracker[potentialSlot] = true;
                updatedSum += gainValue;
            }
        }
        return updatedSum;
    };

    while (processedLines[lineOffset]) {
        const currentN = parseInt(processedLines[lineOffset][0], 10);
        let firstSet = [];
        let secondSet = [];
        let baseSum = 0;
        let remainingCount = currentN;

        for (let idx = 0; idx < currentN; idx++) {
            const rawLineParts = processedLines[lineOffset + idx + 1];
            const parsedLineValues = rawLineParts.map(val => +val);

            const kVal = parsedLineValues[0];
            const lVal = parsedLineValues[1];
            const rVal = parsedLineValues[2];
            
            if (kVal === currentN) {
                baseSum += lVal;
                remainingCount--;
            } else if (lVal > rVal) {
                firstSet.push(parsedLineValues);
                baseSum += rVal;
            } else if (lVal < rVal) {
                const transformedLine = [currentN - kVal, rVal, lVal];
                secondSet.push(transformedLine);
                baseSum += rVal;
            } else {
                baseSum += lVal;
                remainingCount--;
            }
        }

        const compareItems = (itemA, itemB) => itemA[0] - itemB[0];
        firstSet.sort(compareItems);
        secondSet.sort(compareItems);

        let finalResult = baseSum;

        finalResult = performGreedyAssignment(firstSet, finalResult, remainingCount);
        finalResult = performGreedyAssignment(secondSet, finalResult, remainingCount);
        
        console.log(finalResult);

        lineOffset += currentN + 1;
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
