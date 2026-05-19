"use strict";

// Helper function to apply the specific modulo logic
function calculateRemainder(currentValue) {
    if (currentValue >= 5) {
        return currentValue % 5;
    } else if (currentValue >= 4) {
        return currentValue % 4;
    } else if (currentValue >= 3) {
        return currentValue % 3;
    } else if (currentValue >= 2) {
        return currentValue % 2;
    } else if (currentValue >= 1) {
        return currentValue % 1;
    }
    // If currentValue is 0 or negative, return as is (should not happen with positive inputs)
    return currentValue;
}

const processInput = (rawInput) => {
    const inputLines = rawInput.trim().split("\n");
    const initialValueString = inputLines[0];
    const initialValue = parseInt(initialValueString, 10);

    // Early exit for values below 100
    if (initialValue < 100) {
        console.log(0);
        return;
    }

    // Extract the last two digits (tens and units place)
    // This is functionally equivalent to parseInt(X.split("").slice(-2).join(""))
    let tensAndUnits = initialValue % 100;
    let operationCount = 0;

    // Handle the special case where the last two digits are 0
    if (tensAndUnits === 0) {
        console.log(1);
        return;
    }

    // Preserve the specific behavior for tensAndUnits being 1
    // The original code sets cnt = 1 here, then the loop increments it to 2.
    if (tensAndUnits === 1) {
        operationCount = 1;
    }

    // Iteratively apply modulo operations until tensAndUnits becomes zero
    while (tensAndUnits !== 0) {
        tensAndUnits = calculateRemainder(tensAndUnits);
        operationCount++;
    }

    // Compare the calculated threshold with the initial value
    const requiredValueThreshold = 100 * operationCount;
    if (requiredValueThreshold < initialValue) {
        console.log(1);
    } else {
        console.log(0);
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
