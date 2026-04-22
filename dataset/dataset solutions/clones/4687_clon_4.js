const resourceProvider = require('fs');

class GroupingAlgorithm {
    constructor(capacityLimit, rangeThreshold) {
        this.capacityLimit = capacityLimit;
        this.rangeThreshold = rangeThreshold;
    }

    processNumericItems(numericItems) {
        if (!Array.isArray(numericItems) || numericItems.length === 0) {
            return 0;
        }

        const sortedElements = [...numericItems].sort((valueA, valueB) => valueA - valueB);

        let currentScanIndex = 0;
        let totalDistinctGroups = 0;
        const totalElements = sortedElements.length;

        while (currentScanIndex < totalElements) {
            totalDistinctGroups++;
            const groupFirstValue = sortedElements[currentScanIndex];
            let currentGroupSlots = this.capacityLimit - 1;
            currentScanIndex++;

            while (currentScanIndex < totalElements && currentGroupSlots > 0) {
                const nextPotentialElement = sortedElements[currentScanIndex];
                if (nextPotentialElement <= groupFirstValue + this.rangeThreshold) {
                    currentGroupSlots--;
                    currentScanIndex++;
                } else {
                    break;
                }
            }
        }
        return totalDistinctGroups;
    }
}

const parseNumericString = (textualValue) => Number(textualValue);

try {
    const rawFileContent = resourceProvider.readFileSync('/dev/stdin', 'utf8');
    const contentLines = rawFileContent.split('\n');

    const mainConfiguration = contentLines[0].split(' ').map(parseNumericString);
    const itemQuantity = mainConfiguration[0];
    const groupMaxCapacity = mainConfiguration[1];
    const allowedValueDifference = mainConfiguration[2];

    const allItemData = contentLines.slice(1, itemQuantity + 1).map(parseNumericString);

    const groupCalculator = new GroupingAlgorithm(groupMaxCapacity, allowedValueDifference);
    const finalTally = groupCalculator.processNumericItems(allItemData);

    console.log(finalTally);

} catch (processingIssue) {
    console.error("An operational error occurred:", processingIssue.message);
    process.exit(1);
}