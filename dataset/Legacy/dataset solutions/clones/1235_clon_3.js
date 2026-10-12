"use strict";

const parseLineToNumbers = (lineString) => {
    // Handle potential empty lines or lines with only whitespace
    if (!lineString || lineString.trim() === "") {
        // Returning an empty array ensures that accessing [0] or [1] results in undefined,
        // which correctly leads to NaN when summed, matching original termination logic.
        return [];
    }
    return lineString.split(" ").map(Number);
};

function processInputData(rawInputContent) {
    const inputLines = rawInputContent.split("\n");
    
    // Transform all input lines into arrays of numbers using the helper function
    const numericDataRows = inputLines.map(parseLineToNumbers);
    
    let accumulatedOutput = "";
    
    // Iterate through the numeric data rows.
    // The loop continues as long as the current row exists AND
    // the sum of its first two elements is a truthy value (not 0, NaN, null, undefined, or false).
    // This precisely replicates the original loop's termination condition.
    for (let currentIdx = 0; numericDataRows[currentIdx] && (numericDataRows[currentIdx][0] + numericDataRows[currentIdx][1]); currentIdx++) {
        const currentRow = numericDataRows[currentIdx];
        
        // Create a shallow copy of the current row to sort.
        // This ensures the original array in `numericDataRows` remains unchanged,
        // although in this specific problem, it's not strictly necessary as `currentRow` isn't reused.
        const rowForSorting = [...currentRow]; 
        
        // Perform default lexicographical sort, which matches the original `Array.prototype.sort()` behavior
        // when no comparator function is provided.
        rowForSorting.sort(); 
        
        // Join the sorted numbers into a space-separated string and append a newline character.
        const formattedLine = rowForSorting.join(" ");
        accumulatedOutput += formattedLine + "\n";
    }
    
    console.log(accumulatedOutput);
}

// This function is intended for a browser-based debug environment and is not part of the main Node.js execution.
function activateDebugMode() {
	const inputElement = document.getElementById("input");
    // Safely check if the input element exists before trying to access its value.
    if (inputElement) {
        const debugInputValue = inputElement.value;
        processInputData(debugInputValue);
    } else {
        // Log a warning if the debug input element is not found, to aid development.
        console.warn("Debug input element with ID 'input' not found. Cannot run debug mode.");
    }
}

// Main entry point for the Node.js environment.
// Reads input from standard input and passes it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
