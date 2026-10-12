var DATA_PARSER = (function () {
    // This function serves as the primary entry point for creating a new parser instance.
    function createParser(sourceString) {
        return new InputProcessor(sourceString);
    }

    // The InputProcessor class handles parsing of the input string.
    function InputProcessor(rawString) {
        // Store the input string, trimmed and split into individual lines.
        this._inputLines = rawString.trim().split("\n");
    }

    // Retrieves a specific line by its index.
    InputProcessor.prototype.getLineValue = function (lineNum) {
        return this._inputLines[lineNum];
    };

    // Retrieves a specific line, splits it by spaces, and converts elements to numbers or strings.
    InputProcessor.prototype.getLineAsArray = function (lineNum) {
        return this.stringToArray(this._inputLines[lineNum]);
    };

    // Extracts a slice of lines, converting each line to a number or string.
    InputProcessor.prototype.extractValues = function (startIndex, countLimit) {
        // The `+countLimit + startIndex || void 0` handles the case where countLimit might be undefined or 0.
        return this._inputLines.slice(startIndex, +countLimit + startIndex || void 0).map(val => this.stringToValue(val));
    };

    // Extracts a slice of lines, converting each line into an array of numbers or strings.
    InputProcessor.prototype.extractArrays = function (startIndex, countLimit) {
        return this._inputLines.slice(startIndex, +countLimit + startIndex || void 0).map(val => this.stringToArray(val));
    };

    // Helper function to split a string by spaces and convert its parts.
    InputProcessor.prototype.stringToArray = function (inputStr) {
        return inputStr.split(" ").map(val => this.stringToValue(val));
    };

    // Helper function to convert a string to a number if possible, otherwise return the original string.
    InputProcessor.prototype.stringToValue = function (strVal) {
        var numericVal = +strVal;
        // Check if the conversion resulted in a valid number (not NaN).
        return (numericVal === numericVal) ? numericVal : strVal;
    };

    return createParser;
})();

// Read input from standard input using the custom parser.
var inputData = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main processing logic and print the result to console.
console.log(processInput());

/**
 * Main function to process the input data and find the minimum cost.
 * @returns {number} The minimum cost to achieve the target combination, or -1 if impossible.
 */
function processInput() {
    // Parse the first line to get N and M.
    var firstLineParts = inputData.getLineAsArray(0);
    var numItems = firstLineParts[0]; // N
    var numPairs = firstLineParts[1]; // M

    // Read the subsequent lines containing item details.
    var itemDetails = inputData.extractArrays(1);
    var itemCombinations = []; // Stores processed item data (cost and bitmask).
    var targetMask = 0; // The target bitmask representing all items.

    // Calculate the target bitmask: 1 for each item from 1 to N.
    for (var itemIndex = numItems; itemIndex > 0; itemIndex--) {
        targetMask += 0b1 << itemIndex;
    }

    // Process item details into a more usable format.
    for (var pairIndex = 0; numPairs * 0x2 > pairIndex; pairIndex = pairIndex + 2) {
        itemCombinations.push({
            cost: itemDetails[pairIndex][0], // The cost of this item.
            combinationMask: itemDetails[pairIndex + 1].reduce(function (accumulator, currentBit) {
                // Combine item bits into a single mask using bitwise OR.
                return accumulator | 0b1 << currentBit;
            }, 0x0) // Initial accumulator value is 0.
        });
    }

    // Call the recursive function to find all possible costs.
    var possibleCosts = calculateMinCost(targetMask, itemCombinations);

    // If no combinations achieve the target, return -1.
    if (possibleCosts.length === 0) {
        return -1;
    }

    // Sort the found costs in ascending order.
    var sortedCosts = possibleCosts.sort(function (costA, costB) {
        return costA - costB;
    });

    // Return the smallest cost.
    return sortedCosts[0];
}

/**
 * Recursively calculates all possible costs to achieve the target mask.
 * @param {number} targetMask - The desired bitmask representing all items.
 * @param {Array<Object>} availableKeys - Array of objects, each with 'cost' and 'combinationMask'.
 * @param {Object} [currentCombination] - The current accumulated cost and combination mask in the recursion.
 * @returns {Array<number>} An array of costs that achieve the target mask.
 */
function calculateMinCost(targetMask, availableKeys, currentCombination) {
    // Initialize current accumulation based on the provided currentCombination or default to zero.
    var currentAccumulation = {
        cost: !!currentCombination ? currentCombination.cost : 0x0,
        combinationMask: !!currentCombination ? currentCombination.combinationMask : 0x0
    };

    var foundCosts = []; // Stores costs that successfully reach the target mask.

    // Iterate through the available keys (item combinations).
    for (var comboIndex = 0; availableKeys.length > comboIndex; comboIndex++) {
        var currentKey = availableKeys[comboIndex]; // The key being considered in this iteration.

        // Calculate the new accumulated cost and combination mask.
        var nextAccumulation = {
            cost: currentAccumulation.cost + currentKey.cost,
            combinationMask: currentAccumulation.combinationMask | currentKey.combinationMask
        };

        // If the target mask is achieved, add the accumulated cost to the results.
        if (nextAccumulation.combinationMask === targetMask) {
            foundCosts.push(nextAccumulation.cost);
        }

        // Recursively call with the remaining keys and the new accumulated value.
        // The `slice(1)` ensures that each key is used at most once in a direct path,
        // but combinations of different keys are explored.
        foundCosts = foundCosts.concat(calculateMinCost(targetMask, availableKeys.slice(0b1), nextAccumulation));
    }

    return foundCosts;
}
