const createInputReader = (function() {
    // Helper function to safely parse values to numbers
    const parseValue = (value, asString) => asString ? value : Number(value);

    class InputReader {
        constructor(sourceString) {
            this.sourceLines = sourceString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        // Reads a single value from the current line.
        // If the line is exhausted, it moves to the next.
        readSingleValue(returnAsString = false) {
            let currentLineContent = this.sourceLines[this.currentLineIndex];

            // If the current line hasn't been processed into an array of values yet, do it.
            // The original code's `reverse().pop()` is equivalent to `split(" ").shift()`
            // for getting the first element and modifying the array in place.
            if (typeof currentLineContent === "string") {
                this.sourceLines[this.currentLineIndex] = currentLineContent.split(" ");
            }

            const valueToReturn = this.sourceLines[this.currentLineIndex].shift();

            // If the line is now empty, advance to the next line.
            if (!this.sourceLines[this.currentLineIndex].length) {
                this.currentLineIndex++;
            }

            return parseValue(valueToReturn, returnAsString);
        }

        // Reads all values from the current line, then advances to the next line.
        readLineValues(returnAsString = false) {
            const lineValues = this.sourceLines[this.currentLineIndex++].split(" ");
            return returnAsString ? lineValues : lineValues.map(val => Number(val));
        }

        // Reads N lines, splitting each into values, forming a matrix.
        readMatrix(numRows, returnAsString = false) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
            this.currentLineIndex += numRows;
            return returnAsString ?
                matrixRows.map(row => row.split(" ")) :
                matrixRows.map(row => row.split(" ").map(val => Number(val)));
        }

        // Reads N lines as raw strings or numbers.
        readRows(numRows, returnAsString = false) {
            const rows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
            this.currentLineIndex += numRows;
            return returnAsString ? rows : rows.map(val => Number(val));
        }
    }
    return function(sourceString) {
        return new InputReader(sourceString);
    };
})();

const inputData = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let arrayCreationString = `Array(args[${--argCount}]).fill(0).map(x => {return ${initialValue};})`;
    while (--argCount) {
        arrayCreationString = `Array(args[${argCount}]).fill(0).map(x => ${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

// Constants for item data structure after initial processing
const ITEM_INITIAL_CAPACITY_INDEX = 0;
const ITEM_COST_PER_UNIT_INDEX = 1;
const ITEM_ADDITIONAL_COST_PER_UNIT_INDEX = 2;
const ITEM_CALCULATED_ADDITIONAL_COST_INDEX = 3; // (targetCapacity - initialCapacity) * additionalCostPerUnit
const ITEM_CALCULATED_BASE_COST_INDEX = 4;       // initialCapacity * costPerUnit
const ITEM_CALCULATED_TOTAL_COST_INDEX = 5;      // calculatedAdditionalCost + calculatedBaseCost

console.log(main());

function main() {
    const numItems = inputData.readSingleValue();
    const targetCapacity = inputData.readSingleValue();
    const itemDetails = inputData.readMatrix(numItems); // 'b' in original

    let totalBaseCostSum = 0; // 's' in original

    // Helper function to calculate cost for a given item and capacity
    // This function is used in two places in the binary search loop.
    const calculateCostForCapacity = (item, currentCapacity) => {
        if (currentCapacity < item[ITEM_INITIAL_CAPACITY_INDEX]) {
            return item[ITEM_COST_PER_UNIT_INDEX] * currentCapacity;
        } else {
            return item[ITEM_CALCULATED_BASE_COST_INDEX] + (currentCapacity - item[ITEM_INITIAL_CAPACITY_INDEX]) * item[ITEM_ADDITIONAL_COST_PER_UNIT_INDEX];
        }
    };

    // Initial processing of items: calculate costs and append to each item's array
    for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
        const currentItem = itemDetails[itemIndex];
        const baseCost = currentItem[ITEM_INITIAL_CAPACITY_INDEX] * currentItem[ITEM_COST_PER_UNIT_INDEX];
        const additionalCost = (targetCapacity - currentItem[ITEM_INITIAL_CAPACITY_INDEX]) * currentItem[ITEM_ADDITIONAL_COST_PER_UNIT_INDEX];

        totalBaseCostSum += baseCost;
        currentItem.push(additionalCost, baseCost, additionalCost + baseCost);
    }

    // Sort items by their calculated total cost in descending order
    itemDetails.sort((itemA, itemB) => itemB[ITEM_CALCULATED_TOTAL_COST_INDEX] - itemA[ITEM_CALCULATED_TOTAL_COST_INDEX]);

    let upperBound = numItems * targetCapacity; // 'ok' in original
    let lowerBound = -1; // 'ng' in original

    // Binary search for the optimal capacity
    while (upperBound - lowerBound > 1) {
        const midCapacity = Math.floor((upperBound + lowerBound) / 2); // 'm' in original

        let currentRemainingCost = totalBaseCostSum; // 'u' in original
        let remainingCapacityToDistribute = midCapacity; // 'k' in original
        const capacityRemainder = midCapacity % targetCapacity; // 'z' in original

        let maxCostForRemainder = 0; // 'u0' in original
        let maxCostItemIndex = 0; // 'i0' in original

        // First pass: Find the item that yields the maximum cost for the 'capacityRemainder'
        for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
            const itemCostAtRemainder = calculateCostForCapacity(itemDetails[itemIndex], capacityRemainder);
            if (itemCostAtRemainder > maxCostForRemainder) {
                maxCostForRemainder = itemCostAtRemainder;
                maxCostItemIndex = itemIndex;
            }
        }

        // Second pass: Distribute remaining capacity and adjust costs
        // The outer loop's 'itemIndex' is used and advanced by this loop.
        for (let itemIndex = 0; itemIndex < numItems && remainingCapacityToDistribute > 0 && currentRemainingCost > 0; itemIndex++) {
            const currentItem = itemDetails[itemIndex];

            if (targetCapacity <= remainingCapacityToDistribute) {
                // If we can fully cover a 'targetCapacity' block, subtract its total cost
                currentRemainingCost -= currentItem[ITEM_CALCULATED_TOTAL_COST_INDEX];
                remainingCapacityToDistribute -= targetCapacity;
            } else { // remainingCapacityToDistribute < targetCapacity
                if (itemIndex <= maxCostItemIndex) {
                    // If current item is among those considered for maxCostForRemainder,
                    // subtract the maxCostForRemainder and exhaust remainingCapacityToDistribute
                    currentRemainingCost -= maxCostForRemainder;
                    remainingCapacityToDistribute = 0;
                } else {
                    // This is the complex part from the original code.
                    // It adjusts 'currentRemainingCost' based on differences and then
                    // performs an inner search to find an item that makes the cost non-positive.

                    let adjustedCostForComparison = currentRemainingCost;
                    adjustedCostForComparison += itemDetails[maxCostItemIndex][ITEM_CALCULATED_TOTAL_COST_INDEX] - currentItem[ITEM_CALCULATED_TOTAL_COST_INDEX] - maxCostForRemainder;

                    if (adjustedCostForComparison <= 0) {
                        currentRemainingCost = adjustedCostForComparison;
                        continue; // Skip to next item in outer loop
                    }

                    // The original inner loop `for(v = u; i < n && v > 0; i++){ v = u; ... }`
                    // effectively finds the first item (starting from current `itemIndex`)
                    // that, when its cost for `remainingCapacityToDistribute` is subtracted from `currentRemainingCost`,
                    // makes the result non-positive.
                    // The outer loop's `itemIndex` is advanced by this inner search.

                    let tempV = currentRemainingCost; // This is the 'v' from the original code, initialized with 'u'
                    
                    for (/* itemIndex continues from outer loop */; itemIndex < numItems; itemIndex++) {
                        // CRITICAL: 'v = u' in original. So tempV is reset to currentRemainingCost each iteration.
                        tempV = currentRemainingCost;
                        const currentInnerItem = itemDetails[itemIndex];
                        let costReductionForCurrentItem;

                        // Calculate cost reduction for the current item based on remainingCapacityToDistribute
                        if (remainingCapacityToDistribute < currentInnerItem[ITEM_INITIAL_CAPACITY_INDEX]) {
                            costReductionForCurrentItem = currentInnerItem[ITEM_COST_PER_UNIT_INDEX] * remainingCapacityToDistribute;
                        } else {
                            costReductionForCurrentItem = currentInnerItem[ITEM_CALCULATED_BASE_COST_INDEX] + (remainingCapacityToDistribute - currentInnerItem[ITEM_INITIAL_CAPACITY_INDEX]) * currentInnerItem[ITEM_ADDITIONAL_COST_PER_UNIT_INDEX];
                        }

                        tempV -= costReductionForCurrentItem; // Apply the reduction

                        if (tempV <= 0) {
                            // Found the item that makes the cost non-positive.
                            break; // Exit this inner search loop
                        }
                        // If tempV is still positive, continue to the next item.
                        // The outer loop's `itemIndex` will be incremented by the `for` loop's `i++`
                        // after this iteration, so no explicit `itemIndex++` here.
                    }

                    currentRemainingCost = tempV; // 'u = v' from original
                    remainingCapacityToDistribute = 0; // 'k = 0' from original
                }
            }
        }

        if (currentRemainingCost > 0) {
            lowerBound = midCapacity;
        } else {
            upperBound = midCapacity;
        }
    }
    return upperBound;
}
