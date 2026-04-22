"use strict";

/**
 * Core function to find integer solutions for the Diophantine equation related to reciprocals:
 * 4/N = 1/h + 1/n + 1/w.
 * This function processes the provided input string to extract N, then iteratively
 * searches for the smallest positive integer triplet (h, n, w) that satisfies the equation.
 * It outputs the first solution found and terminates.
 *
 * @param {string} rawInputString - The raw input string, expected to contain the integer N on its first line.
 */
const processInputData = (rawInputString) => {
    // Step 1: Prepare the input data.
    // Remove any leading/trailing whitespace from the input string and split it into an array of lines.
    const processedInputLines = rawInputString.trim().split('\n');

    // Parse the first element of the processed lines array to obtain the target integer value N.
    // Using Number.parseInt with radix 10 ensures correct parsing regardless of string format.
    const targetIntegerN = Number.parseInt(processedInputLines[0], 10);

    // Step 2: Define constants and flags for the search process.
    // Establish the upper boundary for the iteration variables h and n.
    const ITERATION_UPPER_BOUND = 3500;

    // A boolean flag to control early exit from nested loops once a valid solution is identified.
    let solutionFoundAndProcessed = false;

    // Step 3: Implement the nested loop search for h and n.
    // The outer loop iterates for the 'h' variable, starting from 1.
    for (let currentH = 1; currentH <= ITERATION_UPPER_BOUND; currentH++) {
        // The inner loop iterates for the 'n' variable, also starting from 1.
        for (let currentN = 1; currentN <= ITERATION_UPPER_BOUND; currentN++) {

            // Step 4: Calculate the potential 'w' value.
            // The equation 4/N = 1/h + 1/n + 1/w can be rearranged to solve for w:
            // 1/w = 4/N - 1/h - 1/n
            // 1/w = (4hn - Nn - Nh) / (Nhn)
            // w = (Nhn) / (4hn - Nn - Nh)

            // Calculate the numerator part of the 'w' formula.
            const numeratorForW = targetIntegerN * currentH * currentN;

            // Define a constant for the '4' in the denominator term for clarity.
            const FOUR_MULTIPLIER = 4;

            // Calculate the individual terms that form the denominator.
            const denominatorTermA = FOUR_MULTIPLIER * currentH * currentN;
            const denominatorTermB = targetIntegerN * currentN;
            const denominatorTermC = targetIntegerN * currentH;

            // Calculate the full denominator for 'w'.
            const denominatorForW = denominatorTermA - denominatorTermB - denominatorTermC;

            // Step 5: Validate the denominator and calculate 'w'.
            // Guard against division by zero, which would result in an invalid 'w'.
            if (denominatorForW === 0) {
                continue; // Skip this iteration if the denominator is zero.
            }

            // Compute the candidate value for 'w'.
            const candidateWValue = numeratorForW / denominatorForW;

            // Step 6: Check for a valid integer solution.
            // A valid solution requires 'w' to be a positive integer.
            if (Number.isInteger(candidateWValue) && candidateWValue > 0) {
                // If a valid triplet (h, n, w) is found, format the output string.
                const solutionTripletString = `${currentH} ${currentN} ${candidateWValue}`;

                // Print the solution to standard output.
                console.log(solutionTripletString);

                // Set the flag to true to signal that a solution has been found.
                solutionFoundAndProcessed = true;

                // Break out of the inner loop as the first solution is sufficient.
                break;
            }
        }

        // Step 7: Early exit from the outer loop if a solution was found.
        if (solutionFoundAndProcessed) {
            break; // Exit the outer loop.
        }
    }
    // The function implicitly finishes here if a solution was found, or
    // if the loops complete without finding one (which is unlikely in typical problem constraints).
};

// Step 8: Read input and execute the main processing function.
// This line reads data from standard input (e.g., from a file or piped input)
// using Node.js's file system module and passes it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));