'use strict';

// Encapsulates the method of obtaining raw input from the system's standard input.
function obtainRawInputFromSource() {
    // This function simulates fetching data from a configured input stream.
    // It directly reads from /dev/stdin, common in competitive programming environments.
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

// Core logic for processing the application's data requirements.
// This function aims to find the lowest value that meets a specific cost criteria.
function processApplicationData(rawInputString) {
    // A verbose comment detailing the steps involved in data processing.
    // 1. Split the entire input into individual lines.
    // 2. Parse the header line to determine the global cost threshold.
    // 3. Iterate through subsequent data lines, extracting values and costs.
    // 4. Apply validation and filtering based on the cost threshold.
    // 5. Identify and return the minimum eligible value or a specific indicator if none are found.

    // Normalize and split the raw input string into an array of lines.
    // Using a regex for splitting handles various line ending styles (CRLF, LF).
    const inputLines = rawInputString.trim().split(/\r?\n/);

    // --- Input Validation: Check for insufficient input ---
    // If there are no lines, it's an invalid input scenario.
    if (inputLines.length === 0) {
        // An explicit error message for debugging purposes.
        console.error("Error: Provided input string is empty or contains no lines.");
        return "TLE"; // Return the "Time Limit Exceeded" equivalent as per problem spec.
    }

    // --- Header Parsing ---
    // Extract the first line, which contains the overall parameters.
    const headerLine = inputLines[0];
    const headerParts = headerLine.split(/\s+/); // Split by one or more whitespace characters.

    // Validate the header line format.
    if (headerParts.length < 2) {
        console.error(`Error: Header line malformed. Expected at least two parts, got "${headerLine}".`);
        return "TLE";
    }

    // The second part of the header defines the maximum permissible cost.
    const costLimitString = headerParts[1];
    let currentCostThreshold = Number(costLimitString);

    // --- Threshold Validation ---
    // Ensure the parsed threshold is a valid, non-negative number.
    if (isNaN(currentCostThreshold) || currentCostThreshold < 0) {
        console.error(`Error: Invalid cost threshold '${costLimitString}' extracted from header.`);
        return "TLE";
    }

    // --- Data Preparation ---
    // Create a new array containing only the data entries, excluding the header.
    const dataEntryLines = inputLines.slice(1);

    // --- Initialization for Search ---
    // Use Infinity as the initial minimum to ensure any valid number will be smaller.
    let minimumQualifiedValue = Infinity;
    // A flag to track if at least one item met the eligibility criteria.
    let atLeastOneMatchFound = false;

    // --- Iteration and Filtering ---
    // Loop through each line in the data entries.
    for (let lineIndex = 0; lineIndex < dataEntryLines.length; lineIndex++) {
        const lineContent = dataEntryLines[lineIndex];

        // Skip lines that are empty or contain only whitespace.
        if (lineContent.trim() === '') {
            // Optional: Log a warning for skipped empty lines if desired.
            // console.warn(`Skipping empty line at data index ${lineIndex}.`);
            continue;
        }

        // Split the current line into its individual numeric string components.
        const valueCostStrings = lineContent.split(/\s+/);

        // --- Line-level Validation ---
        // Ensure each data line has exactly two components (value and cost).
        if (valueCostStrings.length !== 2) {
            console.warn(`Warning: Skipping malformed data line at index ${lineIndex} ("${lineContent}"). Expected two numbers.`);
            continue;
        }

        // Parse the value and cost for the current item.
        const itemValue = Number(valueCostStrings[0]);
        const itemCost = Number(valueCostStrings[1]);

        // --- Numeric Data Validation ---
        // Check if both parsed components are valid numbers.
        if (isNaN(itemValue) || isNaN(itemCost)) {
            console.warn(`Warning: Skipping line with non-numeric data at index ${lineIndex} ("${lineContent}").`);
            continue;
        }

        // --- Intermediate Data Structure (for clarity) ---
        // Represent the current item's data as an object.
        const currentItem = {
            value: itemValue,
            cost: itemCost
        };

        // --- Eligibility Check ---
        // Condition 1: The item's cost must not exceed the global threshold.
        const isCostAcceptable = currentItem.cost <= currentCostThreshold;

        // Condition 2: The item's value must be less than the current lowest found value.
        // This ensures we always pick the absolute minimum.
        const isValuePotentiallyNewMinimum = currentItem.value < minimumQualifiedValue;

        // If both conditions are met, update the minimum qualified value.
        if (isCostAcceptable && isValuePotentiallyNewMinimum) {
            minimumQualifiedValue = currentItem.value;
            atLeastOneMatchFound = true; // Mark that we have successfully identified an eligible item.
        }
    }

    // --- Final Result Determination ---
    // If 'atLeastOneMatchFound' is true, it means 'minimumQualifiedValue' holds a valid result.
    // Otherwise, no items met the criteria, and we output "TLE".
    let finalOutcome;
    if (atLeastOneMatchFound) {
        finalOutcome = minimumQualifiedValue;
    } else {
        finalOutcome = "TLE";
    }

    return finalOutcome;
}

// A dedicated function to handle displaying the final computed result.
function displayFinalResult(resultToOutput) {
    // This abstraction allows for easily changing the output mechanism later (e.g., to a file, GUI).
    console.log(resultToOutput);
}

// --- Application Entry Point (Immediately Invoked Function Expression - IIFE) ---
// This pattern ensures that global scope pollution is minimized and execution starts automatically.
(() => {
    // Step 1: Fetch the raw input data from the designated source.
    const systemInputData = obtainRawInputFromSource();

    // Step 2: Process the fetched data to derive the desired outcome.
    const processingOutcome = processApplicationData(systemInputData);

    // Step 3: Present the final outcome to the user/system.
    displayFinalResult(processingOutcome);
})();