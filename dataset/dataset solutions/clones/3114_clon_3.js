/*
 * This function processes raw input data to generate a specific sequence of number pairs.
 * It identifies pairs (firstElement, secondElement) from 1 to itemCount (inclusive) where firstElement < secondElement,
 * excluding those pairs that sum to a particular value (itemCount + 1 for even itemCount, itemCount for odd itemCount).
 * The first line of the output represents the total count of such valid pairs.
 */
function processInputData(rawData) {
    // Ensure rawData is a string. If not, treat it as empty to prevent errors during splitting.
    const inputLines = typeof rawData === 'string' ? rawData.split("\n") : [];

    // Attempt to parse the first line of input as a numerical value for the item count.
    // Number() handles various types and returns NaN for non-numeric strings.
    const itemCount = Number(inputLines[0]);

    // Initialize an array to accumulate all parts of the final output.
    let resultSegments = [];

    // Implement robust validation for itemCount. If it's not a valid positive number,
    // handle edge cases gracefully to avoid errors and provide sensible output.
    if (isNaN(itemCount) || itemCount < 1) {
        // If itemCount is 1, no pairs can be formed.
        // For zero, negative, or invalid itemCount, also no pairs.
        resultSegments.push(0); // Indicate zero valid pairs.
        return resultSegments.join("\n"); // Return early with the result.
    }

    // Determine the parity of the item count, which dictates the exclusion rule.
    const isEvenCount = (itemCount % 2 === 0);

    // Calculate the total number of valid pairs according to the problem's logic.
    let totalValidPairsCount;

    if (isEvenCount) {
        // For an even itemCount (N):
        // Total possible unique pairs (i,j) with 1 <= i < j <= N is N*(N-1)/2.
        // Pairs to exclude are those where i + j = N + 1. There are N/2 such pairs.
        // The count of valid pairs is N*(N-1)/2 - N/2 = N*(N-2)/2.
        totalValidPairsCount = (itemCount * (itemCount - 2)) / 2;
    } else {
        // For an odd itemCount (N):
        // Total possible unique pairs (i,j) with 1 <= i < j <= N is N*(N-1)/2.
        // Pairs to exclude are those where i + j = N. There are (N-1)/2 such pairs.
        // The count of valid pairs is N*(N-1)/2 - (N-1)/2 = (N-1)*(N-1)/2.
        totalValidPairsCount = ((itemCount - 1) * (itemCount - 1)) / 2;
    }

    // Add the calculated count of valid pairs as the very first element in the output array.
    // Explicitly convert to string as all resultSegments elements will be joined by newlines.
    resultSegments.push(String(totalValidPairsCount));

    // Iterate through all possible unique pairs (firstElement, secondElement)
    // where firstElement ranges from 1 to itemCount, and secondElement is always greater than firstElement.
    for (let firstElement = 1; firstElement <= itemCount; ++firstElement) {
        for (let secondElement = firstElement + 1; secondElement <= itemCount; ++secondElement) {
            // Determine the specific sum that should be avoided for the current itemCount parity.
            const sumToExclude = isEvenCount ? (itemCount + 1) : itemCount;

            // If the sum of the current pair does NOT match the sum to be excluded,
            // then this pair is considered valid and is added to our results.
            if ((firstElement + secondElement) !== sumToExclude) {
                // Use template literals for cleaner string concatenation of the pair.
                resultSegments.push(`${firstElement} ${secondElement}`);
            }
        }
    }

    // Combine all collected output segments into a single string, separated by newline characters.
    const finalOutputString = resultSegments.join("\n");

    // Print the final generated output to the standard console.
    console.log(finalOutputString);

    // Return the generated output string, which might be used by calling functions (e.g., for testing).
    return finalOutputString;
}

/**
 * A utility function designed for debugging and testing the solution within a browser environment.
 * It fetches input and expected output from specific DOM elements and displays the test outcome.
 * @param {number} testCaseIdentifier - A unique numerical ID for the test case (e.g., 1, 2, 3, etc.).
 */
function testSolution(testCaseIdentifier) {
    // Helper arrow function to safely retrieve a DOM element by its ID.
    const getDomElementById = (elementId) => document.getElementById(elementId);

    // Construct the IDs for the input, expected output, and result display elements.
    const inputElementId = `input${testCaseIdentifier}`;
    const expectedOutputElementId = `output${testCaseIdentifier}`;
    const resultDisplayElementId = `result${testCaseIdentifier}`;

    // Fetch the actual DOM elements using the generated IDs.
    const inputDomElement = getDomElementById(inputElementId);
    const expectedOutputDomElement = getDomElementById(expectedOutputElementId);
    const resultDomElement = getDomElementById(resultDisplayElementId);

    // Implement guard clauses to ensure all necessary DOM elements are present.
    // This prevents runtime errors if the HTML structure is incomplete or incorrect.
    if (!inputDomElement || !expectedOutputDomElement || !resultDomElement) {
        console.error(`Critical: One or more DOM elements missing for test case ${testCaseIdentifier}.
            Input: ${inputElementId}, Expected Output: ${expectedOutputElementId}, Result Display: ${resultDisplayElementId}`);
        return; // Abort the test if required elements are not found.
    }

    // Extract the raw input string from the input DOM element.
    const currentTestCaseInput = inputDomElement.value;

    // Execute the main logic with the extracted input to get the actual result.
    const generatedActualOutput = processInputData(currentTestCaseInput);

    // Retrieve the full expected output string from its respective DOM element.
    const expectedResultString = expectedOutputDomElement.value;

    // Compare the actual generated output with the expected output using strict equality.
    let testOutcomeStatus = "WA"; // Default status: "Wrong Answer".
    if (generatedActualOutput === expectedResultString) {
        testOutcomeStatus = "AC"; // Update status to "Accepted" if they match.
    }

    // Update the inner HTML of the result display element to show the test outcome.
    resultDomElement.innerHTML = testOutcomeStatus;

    // Log a detailed summary of the test case to the console for comprehensive debugging.
    console.log(`Test Case ${testCaseIdentifier} Summary:
        Input: '${currentTestCaseInput.replace(/\n/g, '\\n')}'
        Expected Output: '${expectedResultString.replace(/\n/g, '\\n')}'
        Actual Output: '${generatedActualOutput.replace(/\n/g, '\\n')}'
        Result: ${testOutcomeStatus}`);
}

// This self-executing anonymous function serves as the primary entry point
// when the script is run in a Node.js environment (e.g., for competitive programming platforms).
(function executeOnStandardInput() {
    try {
        // Dynamically import the 'fs' (file system) module, which is standard in Node.js.
        const fileSystemModule = require("fs");

        // Read the entire content of the standard input stream (/dev/stdin) as a UTF-8 encoded string.
        const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

        // Invoke the core processing function with the data read from standard input.
        processInputData(standardInputData);
    } catch (error) {
        // Catch and log any errors that occur during the file reading or processing phase.
        console.error("An error occurred during standard input processing:", error.message);
        // Exit the Node.js process with a non-zero status code to indicate an abnormal termination.
        process.exit(1);
    }
})();