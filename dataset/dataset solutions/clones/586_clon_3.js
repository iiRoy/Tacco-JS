// A dedicated utility function to process a sequence of digits by eliminating
// any "bomb" patterns. A bomb pattern is defined as four or more consecutive
// identical digits (specifically '1', '2', or '3').
// The function iteratively removes these patterns until no more can be found,
// and then returns the length of the resulting string.
const eliminateBombSequences = (digitStringInput) => {
    // Ensure the input is treated as a string for regex operations.
    let currentProcessedString = String(digitStringInput);

    // Define the regular expression to identify "bomb" patterns.
    // This pattern looks for 4 or more '1's, OR 4 or more '2's, OR 4 or more '3's.
    // The 'g' flag ensures all occurrences are matched, not just the first.
    const destructionPattern = /(1{4,}|2{4,}|3{4,})/g;

    // Loop until no more "bomb" patterns are present in the string.
    // The test() method checks for existence, and replace() performs the removal.
    while (destructionPattern.test(currentProcessedString)) {
        currentProcessedString = currentProcessedString.replace(destructionPattern, "");
        // A potential optimization or guard for very long strings or complex regex:
        // if (currentProcessedString.length === previousLength) break;
        // previousLength = currentProcessedString.length;
    }

    // Return the final length of the string after all removals.
    return currentProcessedString.length;
};

// --- Main Program Execution Block ---

// Acquire the Node.js file system module for reading input.
const fsModule = require('fs');

// Read the entire standard input stream as a UTF-8 encoded string.
const rawDataFromStdin = fsModule.readFileSync('/dev/stdin', 'utf8');

// Prepare the input data: trim leading/trailing whitespace and split into an array of lines.
const inputDataLines = rawDataFromStdin.trim().split("\n");

// Maintain an index to track the current line being processed from the input array.
let currentInputLinePointer = 0;

// The program processes multiple test cases, each starting with an element count.
// This outer loop continues until a specific termination condition is met.
while (true) {
    // Attempt to read the number of elements for the current test case.
    // Use the pointer to get the current line and then increment it.
    const datasetSizeLine = inputDataLines[currentInputLinePointer++];

    // Robustness check: If no more lines are available or the line is empty, exit.
    if (datasetSizeLine === undefined || datasetSizeLine.trim() === '') {
        break;
    }

    // Convert the read line (which is a string) into an integer.
    const numberOfElements = Number(datasetSizeLine);

    // The problem statement specifies that an input of '0' for the element count
    // signifies the end of all test cases.
    if (numberOfElements === 0) {
        break; // Exit the main processing loop.
    }

    // Initialize an array to store the sequence of digits for the current test case.
    const digitSequenceArray = [];

    // Populate the digit sequence array by reading 'numberOfElements' lines.
    for (let k = 0; k < numberOfElements; k++) {
        const sequenceValueLine = inputDataLines[currentInputLinePointer++];
        // Another robustness check for unexpected end of input or malformed data.
        if (sequenceValueLine === undefined) {
            console.error("Error: Premature end of input while reading sequence values.");
            return; // Terminate execution if input is severely malformed.
        }
        // Convert each line to a number and add it to our array.
        digitSequenceArray.push(Number(sequenceValueLine));
    }

    // Initialize a variable to keep track of the smallest length found
    // after processing all possible modifications for the current test case.
    let minimumFinalLength = Number.POSITIVE_INFINITY;

    // Iterate through each position in the original digit sequence.
    // For each position, we simulate two types of modifications.
    for (let currentPos = 0; currentPos < numberOfElements; currentPos++) {
        // Create two distinct copies of the original sequence for independent modification.
        // Using the spread operator `...` for a clean shallow copy.
        const scenarioOneSequence = [...digitSequenceArray];
        const scenarioTwoSequence = [...digitSequenceArray];

        // --- Scenario One: Modify the element at `currentPos` to be its right neighbor's value. ---
        // This modification is only possible if `currentPos` is not the last element.
        if (currentPos < numberOfElements - 1) {
            scenarioOneSequence[currentPos] = scenarioOneSequence[currentPos + 1];
        }
        // If `currentPos` is the last element, it remains unchanged in this scenario,
        // mirroring the original problem's implicit behavior.

        // --- Scenario Two: Modify the element at `currentPos` to be its left neighbor's value. ---
        // This modification is only possible if `currentPos` is not the first element.
        if (currentPos > 0) {
            scenarioTwoSequence[currentPos] = scenarioTwoSequence[currentPos - 1];
        }
        // If `currentPos` is the first element, it remains unchanged in this scenario.

        // Convert the first modified sequence into a single string.
        const stringForScenarioOne = scenarioOneSequence.join("");
        // Process the string to eliminate bomb sequences and update the minimum length.
        minimumFinalLength = Math.min(minimumFinalLength, eliminateBombSequences(stringForScenarioOne));

        // Convert the second modified sequence into a single string.
        const stringForScenarioTwo = scenarioTwoSequence.join("");
        // Process the string and update the minimum length.
        minimumFinalLength = Math.min(minimumFinalLength, eliminateBombSequences(stringForScenarioTwo));
    }

    // After evaluating all modification scenarios for the current test case,
    // print the overall minimum length found to standard output.
    console.log(minimumFinalLength);
}