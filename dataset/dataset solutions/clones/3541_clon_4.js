'use strict';

const processInputAndCalculate = (sourceData) => {
    const dataLines = sourceData.split('\n');
    const parameters = dataLines[0].split(' ').map(Number);
    const itemQuantity = parameters[0];
    const unitConstant = parameters[1];
    const itemValues = dataLines[1].split(' ').slice(0, itemQuantity).map(Number);

    const calculateRecursiveCost = (currentItems, totalAccumulatedCost) => {
        if (currentItems.length === 0) {
            return totalAccumulatedCost;
        }

        const lastItemValue = currentItems[currentItems.length - 1];
        let currentGroupTotal = 5 * lastItemValue + 2 * unitConstant;
        let groupedItemCount = 1;

        // Generate a sequence of potential preceding items to evaluate for grouping
        const potentialPrecedingItems = Array.from({ length: currentItems.length - 1 }, (_, index) => {
            const offsetValue = index + 1; // This 'offsetValue' corresponds to 'k' in the original logic
            const actualItemIndex = currentItems.length - 1 - offsetValue;
            return {
                value: currentItems[actualItemIndex],
                offset: offsetValue
            };
        });

        // Use reduce to functionally simulate the inner loop's conditional accumulation
        const groupEvaluationResult = potentialPrecedingItems.reduce((accumulator, itemData) => {
            if (accumulator.stopped) {
                return accumulator; // Early exit simulation
            }

            const individualValuation = 5 * itemData.value + 2 * unitConstant;
            const groupedValuation = (2 * itemData.offset + 3) * itemData.value + unitConstant;

            if (individualValuation < groupedValuation) {
                return { ...accumulator, stopped: true }; // Condition met to stop grouping
            } else {
                return {
                    accumulatedSum: accumulator.accumulatedSum + groupedValuation,
                    accumulatedLength: accumulator.accumulatedLength + 1,
                    stopped: false
                };
            }
        }, { accumulatedSum: currentGroupTotal, accumulatedLength: groupedItemCount, stopped: false });

        const segmentLengthFound = groupEvaluationResult.accumulatedLength;
        const segmentExpenseFound = groupEvaluationResult.accumulatedSum;

        const remainingSegment = currentItems.slice(0, currentItems.length - segmentLengthFound);
        return calculateRecursiveCost(remainingSegment, totalAccumulatedCost + segmentExpenseFound);
    };

    const finalResult = calculateRecursiveCost(itemValues, 0);
    console.log(finalResult);
};

const programSwitch = false; // Renamed isTest

if (programSwitch) {
    processInputAndCalculate('2 100\n1 10');
    processInputAndCalculate('5 1\n1 999999997 999999998 999999999 1000000000');
    processInputAndCalculate('10 8851025\n38 87 668 3175 22601 65499 90236 790604 4290609 4894746');
    processInputAndCalculate('16 10\n1 7 12 27 52 75 731 13856 395504 534840 1276551 2356789 9384806 19108104 82684732 535447408');
} else {
    processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
}