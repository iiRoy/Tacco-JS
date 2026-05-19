'use strict';

// Helper function to parse a line of space-separated integers into an array
const parseIntegerLine = (lineContent) => {
    return lineContent.split(" ").map(strVal => parseInt(strVal, 10));
};

// Helper function to determine if a number is an integer
const isInteger = (num) => {
    return Number.isInteger(num);
};

// Function to simplify a ratio (a:b) to its lowest terms and return as a string "a b"
const getSimplifiedRatioString = (valA, valB) => {
    let reducedA = valA;
    let reducedB = valB;
    const smallerValue = Math.min(valA, valB);

    // Iterate from 1 up to the smaller value to find common divisors
    for (let divisor = 1; divisor <= smallerValue; divisor++) {
        const quotientA = valA / divisor;
        const quotientB = valB / divisor;

        // If both quotients are integers, this is a common divisor
        if (isInteger(quotientA) && isInteger(quotientB)) {
            reducedA = quotientA;
            reducedB = quotientB;
        }
    }
    return `${reducedA} ${reducedB}`;
};

// Main processing function
const processInputAndSolve = (inputString) => {
    const trimmedLines = inputString.trim().split("\n");
    
    // Parse the configuration line
    const parsedConfig = parseIntegerLine(trimmedLines[0]);
    const numItems = parsedConfig[0];
    const targetRatio = parsedConfig.slice(1); // [targetRatioA, targetRatioB]

    // Extract the data lines for individual items
    const itemDataLines = trimmedLines.slice(1, numItems + 1);
    let bestCombination = []; // Stores the combination of items with the minimum cost that meets the ratio

    // Helper function to calculate the sum of 'a', 'b', and 'cost' for a given array of items
    const calculateCombinationTotals = (combinationArray) => {
        let totalA = 0;
        let totalB = 0;
        let totalCost = 0;
        for (const item of combinationArray) {
            totalA += item.a;
            totalB += item.b;
            totalCost += item.cost;
        }
        return { totalA, totalB, totalCost };
    };

    // Recursive function to explore all possible combinations of items
    const exploreCombinations = (currentLine, currentCombination, currentIndex) => {
        // Guard clause: If the current index is out of bounds or the line is empty, stop recursion
        if (currentIndex >= numItems || !currentLine) {
            return;
        }

        // Parse the current item's data
        const parsedItem = parseIntegerLine(currentLine);
        const newItem = { 
            a: parsedItem[0], 
            b: parsedItem[1], 
            cost: parsedItem[2]
        };
        
        // Create a new combination by adding the current item
        const nextCombination = [...currentCombination, newItem];

        // Calculate totals for the new combination
        const { totalA: currentTotalA, totalB: currentTotalB, totalCost: currentTotalCost } = calculateCombinationTotals(nextCombination);

        // Determine the cost of the best combination found so far
        let minBestCost = Infinity;
        if (bestCombination.length > 0) {
            minBestCost = calculateCombinationTotals(bestCombination).totalCost;
        }

        // Pruning: If a best combination exists and the current combination's cost already exceeds it,
        // there's no need to explore further down this path.
        if (bestCombination.length > 0 && currentTotalCost > minBestCost) {
            return;
        }

        // Check if the current combination's ratio matches the target ratio
        const currentRatioString = getSimplifiedRatioString(currentTotalA, currentTotalB);
        const targetRatioString = `${targetRatio[0]} ${targetRatio[1]}`;

        if (currentRatioString === targetRatioString) {
            // If this combination is the first valid one, or has a lower cost than the current best, update bestCombination
            if (bestCombination.length === 0 || currentTotalCost < minBestCost) {
                bestCombination = nextCombination;
            }
        } 
        
        // Recursively call for the next item in the data set
        const nextIndex = currentIndex + 1;
        if (nextIndex < numItems) { // Ensure the next index is within bounds
            exploreCombinations(itemDataLines[nextIndex], nextCombination, nextIndex);
        }
    };

    // Start exploring combinations by considering each item as a potential starting point
    for (let idx = 0; idx < numItems; idx++) {
        const initialCombination = []; // Each starting point begins with an empty combination
        exploreCombinations(itemDataLines[idx], initialCombination, idx);
    }

    // Calculate the final result cost based on the best combination found
    const finalResultCost = bestCombination.length === 0 ? -1 : calculateCombinationTotals(bestCombination).totalCost;
    console.log(finalResultCost);
};

// Read input from stdin and pass it to the main processing function
processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
