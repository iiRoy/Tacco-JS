var InputParserFactory = (function() {
    function createParser(inputString) {
        return new InputParser(inputString);
    }

    function InputParser(inputString) {
        this.inputLines = inputString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    InputParser.prototype.readItem = function(asString) {
        const currentLineContent = this.inputLines[this.currentLineIndex];
        let extractedValue;

        // If the current line is still a string, split it into an array of words and reverse it.
        // This modification is done in-place to the internal inputLines array.
        if (typeof currentLineContent === "string") {
            this.inputLines[this.currentLineIndex] = currentLineContent.trim().split(" ").reverse();
        }

        // Now, the current line is guaranteed to be an array of strings.
        const lineAsArray = this.inputLines[this.currentLineIndex];
        extractedValue = lineAsArray.pop(); // Get the last element (due to reverse)

        // If the current line becomes empty after popping, advance to the next line.
        if (!lineAsArray.length) {
            this.currentLineIndex++;
        }

        // Return the value as a string or a number based on the 'asString' flag.
        return asString ? extractedValue : +extractedValue;
    };

    InputParser.prototype.readLine = function(asString) {
        const lineContent = this.inputLines[this.currentLineIndex++].split(" ");
        return asString ? lineContent : lineContent.map(val => +val);
    };

    InputParser.prototype.readMatrix = function(numRows, asString) {
        const matrixRows = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex += numRows);
        const parsedMatrix = matrixRows.map(row => row.split(" "));
        return asString ? parsedMatrix : parsedMatrix.map(row => row.map(val => +val));
    };

    InputParser.prototype.readArray = function(numElements, asString) {
        const arrayElements = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex += numElements);
        return asString ? arrayElements : arrayElements.map(val => +val);
    };

    return createParser;
})();

var inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const dimensions = Array.from(arguments).slice(1); // Extract dimensions from arguments

    function buildNestedArray(dimIndex) {
        // Base case: if we've processed all dimensions, return the initial value
        if (dimIndex === dimensions.length) {
            return initialValue;
        }
        // Recursive step: create an array for the current dimension
        const currentDimSize = dimensions[dimIndex];
        return Array(currentDimSize).fill(0).map(() => buildNestedArray(dimIndex + 1));
    }

    return buildNestedArray(0); // Start building from the first dimension
}

console.log(solveProblem());

function solveProblem() {
    const numItems = inputReader.readItem();
    const thresholdX = inputReader.readItem();
    const itemData = inputReader.readMatrix(numItems);

    let initialSum = 0;

    // First pass: calculate initial sum and add derived property to each item
    for (let idx = 0; idx < numItems; idx++) {
        const currentItem = itemData[idx];
        const baseProduct = currentItem[0] * currentItem[1];
        initialSum += baseProduct;
        const derivedProperty = (thresholdX - currentItem[0]) * currentItem[2];
        currentItem.push(derivedProperty); // Add the derived property as the 4th element (index 3)
    }

    // Sort items based on the derived property in descending order
    itemData.sort((itemA, itemB) => itemB[3] - itemA[3]);

    let upperBound = numItems * thresholdX; // Max possible capacity
    let lowerBound = -1; // Min possible capacity (exclusive)

    // Binary search for the minimum capacity that satisfies the condition
    while (upperBound - lowerBound > 1) {
        const midValue = Math.floor((upperBound + lowerBound) / 2);

        // Check if the current midValue capacity is feasible
        if (checkFeasibility(midValue, initialSum, itemData, thresholdX)) {
            upperBound = midValue;
        } else {
            lowerBound = midValue;
        }
    }

    return upperBound;
}

// Helper function to check if a given capacity can reduce the sum to 0 or less
function checkFeasibility(capacityToCheck, totalInitialSum, items, thresholdXVal) {
    let currentSum = totalInitialSum;
    let remainingCapacity = capacityToCheck;
    const numItems = items.length;

    // Nested helper function to calculate reduction amount for an item
    const calculateItemReduction = (item, currentCapacity) => {
        if (currentCapacity < item[0]) {
            return item[1] * currentCapacity;
        } else {
            return item[0] * item[1] + (currentCapacity - item[0]) * item[2];
        }
    };

    for (let idx = 0; idx < numItems && remainingCapacity > 0 && currentSum > 0; idx++) {
        const currentItem = items[idx];

        if (thresholdXVal <= remainingCapacity) {
            // If enough capacity, apply full item reduction
            const fullItemCostReduction = currentItem[0] * currentItem[1] + currentItem[3];
            currentSum -= fullItemCostReduction;
            remainingCapacity -= thresholdXVal;
        } else {
            // This block replicates the original's complex inner loop behavior:
            // `for(var v = u; i < n && v > 0; i++){ v = u; ... } u = v;`
            // `v` is reset to `u` (currentSum) in each iteration of the inner loop.
            // The `v > 0` condition is effectively `currentSum > 0` (the value of `u` when this else block starts).
            // The `u = v` after the inner loop means `u` takes the value of `v` from the *last* iteration.
            // The `i++` in the inner loop increments the outer `idx`.

            let finalTempSumValue = currentSum; // This will store the `v` from the last iteration of the conceptual inner loop
            let tempIdxForInnerLoop = idx; // Use a temporary index to simulate the inner loop's `i`

            // Simulate the inner loop's iterations and update `finalTempSumValue`
            while (tempIdxForInnerLoop < numItems && currentSum > 0) {
                const innerLoopItem = items[tempIdxForInnerLoop];
                // The `v = u` part is implicitly handled as `currentSum` is used for calculation
                finalTempSumValue = currentSum - calculateItemReduction(innerLoopItem, remainingCapacity);
                tempIdxForInnerLoop++;
            }
            currentSum = finalTempSumValue; // Update `currentSum` with the result from the last inner iteration
            idx = tempIdxForInnerLoop - 1; // Adjust outer loop's `idx` as it will be incremented by the `for` loop
        }
    }
    return currentSum <= 0; // Return true if the sum is reduced to 0 or less
}
