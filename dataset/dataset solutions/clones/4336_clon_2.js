// This module processes input data to determine if a specific numerical condition is met.
function CalculateResult(sourceData) {
    // Step 1: Parse the raw input. It's expected to be a string with multiple lines.
    // Split the input string by newline characters to get an array of lines.
    let processedLines = sourceData.split('\n');

    // Remove the last element, which is often an empty string due to trailing newline.
    processedLines.pop();

    // Step 2: Extract the key numerical parameters from the first line of processed data.
    // The first line is expected to contain space-separated numbers.
    const numericStrings = processedLines[0].split(' ');

    // Convert the string representations to actual numbers.
    // valA: Represents the first primary numerical dimension or value.
    const valA = Number(numericStrings[0]);
    // valB: Represents the second primary numerical dimension or value.
    const valB = Number(numericStrings[1]);
    // goalNum: Represents the target numerical value that needs to be achieved.
    const goalNum = Number(numericStrings[2]);

    // Step 3: Perform an initial check for direct divisibility.
    // If the target number is perfectly divisible by either valA or valB, the condition is met.
    if (goalNum % valA === 0 || goalNum % valB === 0) {
        console.log('Yes'); // Output confirmation.
        return; // Terminate function execution early.
    }

    // Step 4: Check for a trivial "No" case.
    // If the target number is smaller than both primary dimensions, it's impossible to meet the condition
    // through the subsequent calculations, so we can immediately say 'No'.
    if (goalNum < valB && goalNum < valA) {
        console.log('No'); // Output denial.
        return; // Terminate function execution early.
    }

    // Step 5: First set of nested loops to explore combinations.
    // This loop structure iterates through potential combinations using 'idxA' and 'idxB'.
    // The outer loop runs from 1 up to 'valB'.
    for (let idxA = 1; idxA <= valB; idxA++) {
        // The inner loop runs from 1 up to 'valA'.
        for (let idxB = 1; idxB <= valA; idxB++) {
            // Check if the current combination's calculated value matches the 'goalNum'.
            // The calculation formula here is specific to the problem's logic.
            if (goalNum === (idxA * valB + idxB * (valA - 2 * idxA))) {
                console.log('Yes'); // If a match is found, output 'Yes'.
                return; // Terminate function execution.
            }
        }
    }

    // Step 6: Second set of nested loops with a slightly different iteration strategy and calculation.
    // This provides an alternative set of combinations to check.
    // The outer loop now runs from 1 up to 'valA'.
    for (let idxA = 1; idxA <= valA; idxA++) {
        // The inner loop runs from 1 up to 'valB'.
        for (let idxB = 1; idxB <= valB; idxB++) {
            // Check if this alternative combination's calculated value matches the 'goalNum'.
            // Note the slightly different formula compared to the previous loop.
            if (goalNum === (idxA * valA + idxB * (valB - 2 * idxA))) {
                console.log('Yes'); // If a match is found, output 'Yes'.
                return; // Terminate function execution.
            }
        }
    }

    // Step 7: If none of the above conditions or combinations yielded a 'Yes', then the answer is 'No'.
    console.log('No'); // Final output indicating no solution found.
    return; // Final function termination.
}

// Entry point: Read data from standard input and pass it to the main processing function.
const fileSystem = require("fs");
CalculateResult(fileSystem.readFileSync("/dev/stdin", "utf8"));