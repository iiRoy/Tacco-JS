const InputProcessor = (function() {
    function createStreamHandler(sourceText) {
        if (typeof sourceText !== 'string') {
            throw new Error("Input source must be a string value.");
        }
        return new DataStream(sourceText);
    }

    class DataStream {
        #inputLines;
        #linePointer;

        constructor(rawSource) {
            this.#inputLines = rawSource.trim().split("\n");
            this.#linePointer = 0;
            for (let i = 0; i < this.#inputLines.length; i++) {
                this.#inputLines[i] = this.#inputLines[i].split(" ");
            }
        }

        fetchNextToken(asString = false) {
            if (this.#linePointer >= this.#inputLines.length) {
                return undefined;
            }

            let currentLineTokens = this.#inputLines[this.#linePointer];

            while (currentLineTokens.length === 0 && this.#linePointer < this.#inputLines.length - 1) {
                this.#linePointer++;
                currentLineTokens = this.#inputLines[this.#linePointer];
            }

            if (currentLineTokens.length === 0 || this.#linePointer >= this.#inputLines.length) {
                return undefined;
            }

            const tokenValue = currentLineTokens.pop();

            if (currentLineTokens.length === 0) {
                this.#linePointer++;
            }

            return asString ? tokenValue : Number(tokenValue);
        }

        readFullLine(returnStrings = false) {
            if (this.#linePointer >= this.#inputLines.length) {
                return [];
            }

            const lineData = this.#inputLines[this.#linePointer++];

            if (lineData.length === 0) {
                return [];
            }

            return returnStrings ? lineData : lineData.map(val => Number(val));
        }

        readDataMatrix(count, asStrings = false) {
            const matrixLines = this.#inputLines.slice(this.#linePointer, this.#linePointer + count);
            this.#linePointer += count;

            return matrixLines.map(lineTokens => {
                return asStrings ? lineTokens : lineTokens.map(val => Number(val));
            });
        }

        readLineBlock(count, keepAsStrings = false) {
            const rawLines = this.#inputLines.slice(this.#linePointer, this.#linePointer + count).map(lineTokens => lineTokens.join(" "));
            this.#linePointer += count;

            return keepAsStrings ? rawLines : rawLines.map(val => Number(val));
        }
    }

    return createStreamHandler;
})();

/**
 * Dynamically creates a multi-dimensional array with a specified initial value.
 * @param {*} initialVal - The value to initialize all elements with.
 * @param {...number} dimensions - A variable number of arguments representing the size of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeNestedArray(initialVal, ...dimensions) {
    if (!dimensions || dimensions.length === 0 || dimensions.some(d => typeof d !== 'number' || d < 0)) {
        if (dimensions.length === 0) return initialVal;
        throw new Error("Invalid dimensions provided for initializeNestedArray.");
    }

    function buildArray(dimIndex) {
        if (dimIndex === dimensions.length - 1) {
            return Array(dimensions[dimIndex]).fill(initialVal);
        } else {
            return Array(dimensions[dimIndex]).fill(0).map(() => buildArray(dimIndex + 1));
        }
    }

    return buildArray(0);
}

// --- Main Program Execution ---

let dataStreamHandler;
try {
    const fs = require("fs");
    const rawInputContent = fs.readFileSync("/dev/stdin", "utf8");
    dataStreamHandler = InputProcessor(rawInputContent);
} catch (error) {
    console.error("Failed to read input from /dev/stdin:", error);
    process.exit(1);
}

console.log(executeMainLogic());

/**
 * Orchestrates the main problem-solving flow.
 * Reads initial parameters, filters item pairs based on conditions,
 * and calls the core solver function twice to determine the optimal outcome.
 * @returns {number} The final maximized resource value.
 */
function executeMainLogic() {
    const initialCapacity = dataStreamHandler.fetchNextToken();
    const deductionsArr = dataStreamHandler.readFullLine();
    const additionsArr = dataStreamHandler.readFullLine();

    if (deductionsArr.length !== 3 || additionsArr.length !== 3) {
        console.error("Input arrays for deductions/additions must have exactly 3 elements.");
        return initialCapacity;
    }

    // First Pass: Identify items where the deduction is less than the addition.
    // These represent items that yield a net positive gain.
    const positiveImpactDeductions = [];
    const positiveImpactAdditions = [];

    for (let itemIndex = 0; itemIndex < 3; ++itemIndex) {
        const currentDeduction = deductionsArr[itemIndex];
        const currentAddition = additionsArr[itemIndex];

        if (currentDeduction < currentAddition) {
            positiveImpactDeductions.push(currentDeduction);
            positiveImpactAdditions.push(currentAddition);
        }
    }

    const interimResult = calculateBestOutcome(initialCapacity, positiveImpactDeductions, positiveImpactAdditions);

    // Second Pass: Identify items where the addition is less than the deduction.
    // In this context, the original addition acts as the new deduction, and original deduction as new addition.
    const negativeImpactDeductions = [];
    const negativeImpactAdditions = [];

    for (let itemIndex = 0; itemIndex < 3; ++itemIndex) {
        const currentDeduction = deductionsArr[itemIndex];
        const currentAddition = additionsArr[itemIndex];

        if (currentAddition < currentDeduction) {
            negativeImpactDeductions.push(currentAddition);
            negativeImpactAdditions.push(currentDeduction);
        }
    }

    return calculateBestOutcome(interimResult, negativeImpactDeductions, negativeImpactAdditions);
}

/**
 * Determines the maximum possible resource value based on a given capacity
 * and a set of item pairs (deductionAmount, gainAmount).
 * The strategy varies based on the number of item pairs available.
 * @param {number} currentCapacity - The initial or current resource capacity.
 * @param {Array<number>} deductionAmounts - Array of costs for items.
 * @param {Array<number>} gainAmounts - Array of profits/gains from items.
 * @returns {number} The maximized resource value.
 */
function calculateBestOutcome(currentCapacity, deductionAmounts, gainAmounts) {
    const numberOfPairs = deductionAmounts.length;

    if (currentCapacity < 0) {
        return 0;
    }

    if (numberOfPairs === 0) {
        return currentCapacity;
    }

    if (numberOfPairs === 1) {
        const itemCost = deductionAmounts[0];
        const itemProfit = gainAmounts[0];

        if (itemCost <= 0) {
            if (itemProfit > itemCost) {
                return Infinity;
            } else {
                return currentCapacity;
            }
        }

        const timesUsable = Math.floor(currentCapacity / itemCost);
        currentCapacity += timesUsable * (itemProfit - itemCost);
        return currentCapacity;
    }

    if (numberOfPairs === 3) {
        const maxAchievable = initializeNestedArray(-1, currentCapacity + 1);
        maxAchievable[0] = currentCapacity;

        for (let itemIdx = 0; itemIdx < numberOfPairs; ++itemIdx) {
            const itemDeduction = deductionAmounts[itemIdx];
            const itemGain = gainAmounts[itemIdx];

            for (let currentCostSum = itemDeduction; currentCostSum <= currentCapacity; ++currentCostSum) {
                if (maxAchievable[currentCostSum - itemDeduction] === -1) {
                    continue;
                }
                maxAchievable[currentCostSum] = Math.max(
                    maxAchievable[currentCostSum],
                    maxAchievable[currentCostSum - itemDeduction] + itemGain
                );
            }
        }
        return Math.max(...maxAchievable);
    }

    // This block handles the case where numberOfPairs === 2
    const item1Deduction = deductionAmounts[0];
    const item1Gain = gainAmounts[0];
    const item2Deduction = deductionAmounts[1];
    const item2Gain = gainAmounts[1];

    const ratio1 = (item1Deduction > 0) ? (item1Gain - item1Deduction) / item1Deduction : Infinity;
    const ratio2 = (item2Deduction > 0) ? (item2Gain - item2Deduction) / item2Deduction : Infinity;

    let primaryItemCost, primaryItemGain, secondaryItemCost, secondaryItemGain;

    if (ratio1 >= ratio2) {
        primaryItemCost = item1Deduction;
        primaryItemGain = item1Gain;
        secondaryItemCost = item2Deduction;
        secondaryItemGain = item2Gain;
    } else {
        primaryItemCost = item2Deduction;
        primaryItemGain = item2Gain;
        secondaryItemCost = item1Deduction;
        secondaryItemGain = item1Gain;
    }

    let maximizedResult = 0;
    const maxPossiblePrimaryItems = (primaryItemCost > 0) ? Math.floor(currentCapacity / primaryItemCost) : (primaryItemGain > primaryItemCost ? Infinity : currentCapacity);
    const ITERATION_LIMIT = 5000;

    for (let numPrimaryUsed = 0; numPrimaryUsed <= maxPossiblePrimaryItems && numPrimaryUsed <= ITERATION_LIMIT; ++numPrimaryUsed) {
        const remainingCapacityAfterPrimary = currentCapacity - (numPrimaryUsed * primaryItemCost);

        let numSecondaryUsed = 0;
        if (secondaryItemCost > 0) {
            numSecondaryUsed = Math.floor(remainingCapacityAfterPrimary / secondaryItemCost);
        } else if (secondaryItemCost === 0 && secondaryItemGain > 0) {
            maximizedResult = Infinity;
            break;
        }

        const totalValueFromItems = currentCapacity +
                                     numPrimaryUsed * (primaryItemGain - primaryItemCost) +
                                     numSecondaryUsed * (secondaryItemGain - secondaryItemCost);

        if (totalValueFromItems > maximizedResult) {
            maximizedResult = totalValueFromItems;
        }
    }

    return maximizedResult;
}