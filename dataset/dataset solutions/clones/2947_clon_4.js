"use strict";

(() => {
    // --- Utility for coordinate compression ---
    function createValueIndexer(initialValues) {
        // Collect unique values and sort them
        const distinctSortedValues = [...new Set(initialValues)].sort((valA, valB) => valA - valB);
        
        // Create a map from original value to its 0-based compressed index
        const valueToCompressedIndexMap = new Map();
        distinctSortedValues.forEach((val, idx) => valueToCompressedIndexMap.set(val, idx));

        return {
            // Converts a 0-based compressed index back to its original value
            originalValueFromIndex: (idx) => distinctSortedValues[idx],
            // Converts an original value to its 0-based compressed index
            compressedIndexFromValue: (val) => valueToCompressedIndexMap.get(val),
            // The total count of unique values
            countOfUniqueValues: distinctSortedValues.length
        };
    }

    // --- Utility for Fenwick Tree / Binary Indexed Tree ---
    function createPartialSumTracker(maximumSize) {
        // The internal storage for the Fenwick tree, 1-indexed
        const treeDataStore = new Array(maximumSize + 1).fill(0);

        return {
            // Adds a 'delta' to the value at 'index' (1-based)
            updateValue: (index, delta) => {
                let currentPos = index;
                while (currentPos <= maximumSize) {
                    treeDataStore[currentPos] += delta;
                    currentPos += (currentPos & -currentPos); // Move to the next relevant index
                }
            },
            // Retrieves the prefix sum up to 'index' (1-based)
            querySumUpTo: (index) => {
                let accumulatedSum = 0;
                let currentPos = index;
                while (currentPos > 0) {
                    accumulatedSum += treeDataStore[currentPos];
                    currentPos -= (currentPos & -currentPos); // Move to the previous relevant index
                }
                return accumulatedSum;
            }
        };
    }

    // --- Utility for parsing number strings ---
    function parseNumbersFromString(inputLine) {
        return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(Number);
    }

    // --- Main processing logic ---
    function executeSolution(rawInputText) {
        const inputLines = rawInputText.split("\n");

        const firstInputNumbers = parseNumbersFromString(inputLines[0]);
        const numberOfOperations = firstInputNumbers[0];

        const allUserOperations = inputLines.slice(1, numberOfOperations + 1).map(line => {
            const parts = parseNumbersFromString(line);
            return {
                operationType: parts[0], // Corresponds to 't'
                operandA: parts[1],    // Corresponds to 'a'
                operandB: parts[2]     // Corresponds to 'b'
            };
        });

        // Extract all 'a' values from type 1 operations for coordinate compression
        const valuesToCompress = allUserOperations
            .filter(op => op.operationType === 1)
            .map(op => op.operandA);

        const coordinateTranslator = createValueIndexer(valuesToCompress);
        const balanceTracker = createPartialSumTracker(coordinateTranslator.countOfUniqueValues);

        let aggregateValue = 0;
        let currentBalancePointIndex = null; // This will store a 1-based compressed index

        // --- Binary search to find the specific "balance point" ---
        // This function closely mimics the original's unique binary search behavior.
        function findEquilibriumPoint() {
            let searchLower = 1; // 1-based index
            let searchUpper = coordinateTranslator.countOfUniqueValues + 1; // Exclusive upper bound for 1-based search

            while (searchLower < searchUpper) {
                const midSearchIndex = Math.floor((searchLower + searchUpper) / 2);
                const sumAtMidPoint = balanceTracker.querySumUpTo(midSearchIndex);

                if (sumAtMidPoint > 0) {
                    searchUpper = midSearchIndex; // Candidate is mid or to its left
                } else if (sumAtMidPoint === 0) {
                    searchLower = midSearchIndex; // Found a zero-sum point, this is our target.
                    break; // Critical: breaks early if a zero sum is encountered
                } else { // sumAtMidPoint < 0
                    searchLower = midSearchIndex + 1; // Must be to the right
                }
            }
            return searchLower; // Returns a 1-based compressed index
        }

        // Process each operation
        for (let i = 0; i < numberOfOperations; i++) {
            const operationDetails = allUserOperations[i];
            const typeOfOperation = operationDetails.operationType;
            const argValueA = operationDetails.operandA;
            const argValueB = operationDetails.operandB;

            if (typeOfOperation === 1) {
                // Determine the previous balance point for value calculation
                let priorBalancePointForCalculation; // This will be 1-based
                if (currentBalancePointIndex === null) {
                    priorBalancePointForCalculation = 1; // Default to the first point if none set
                } else {
                    // Check if sum up to currentBalancePointIndex is zero
                    priorBalancePointForCalculation = (balanceTracker.querySumUpTo(currentBalancePointIndex) === 0)
                                                    ? (currentBalancePointIndex + 1) // If zero, consider the next point
                                                    : currentBalancePointIndex;       // Otherwise, use current point
                }

                // Get 1-based compressed index for argValueA
                const compressedIndexForA = coordinateTranslator.compressedIndexFromValue(argValueA) + 1;

                // Update the Fenwick tree
                balanceTracker.updateValue(1, -1);
                balanceTracker.updateValue(compressedIndexForA, 2);

                // Update the aggregate value
                if (currentBalancePointIndex === null) {
                    aggregateValue = argValueB;
                } else {
                    // 'priorBalancePointForCalculation' is 1-based, convert to 0-based for coordinateTranslator
                    aggregateValue += Math.abs(argValueA - coordinateTranslator.originalValueFromIndex(priorBalancePointForCalculation - 1)) + argValueB;
                }
                
                // Find the new balance point
                currentBalancePointIndex = findEquilibriumPoint(); // This returns a 1-based index
            } else { // typeOfOperation === 2
                // 'currentBalancePointIndex' is 1-based, convert to 0-based for coordinateTranslator
                console.log(`${coordinateTranslator.originalValueFromIndex(currentBalancePointIndex - 1)} ${aggregateValue}`);
            }
        }
    }

    // Read input from standard input and execute the solution
    executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
})();