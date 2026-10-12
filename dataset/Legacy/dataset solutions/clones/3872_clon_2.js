"use strict"

// This function processes the raw input data to calculate a final cost.
const processInput = (rawData) => {
    // The input string is assigned to a sequence variable.
    const charSequence = rawData;
    // Initialize the base cost for the operation.
    let currentCost = 700;

    // Check the first character of the sequence.
    if (charSequence[0] === "○") {
        // If it matches the specific symbol, add a bonus to the cost.
        currentCost += 100;
    }

    // Check the second character of the sequence.
    if (charSequence[1] === "○") {
        // If it matches, apply another increment to the cost.
        currentCost += 100;
    }

    // Check the third character of the sequence.
    if (charSequence[2] === "○") {
        // If this also matches, add a final adjustment to the cost.
        currentCost += 100;
    }

    // Display the computed total cost to the console.
    console.log(currentCost);
};

// Read the standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
