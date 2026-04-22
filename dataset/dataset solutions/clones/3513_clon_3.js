// This module defines a function for processing a specific type of textual input data.
// It analyzes patterns within the data and computes a numerical result based on
// the frequencies of distinct elements and the overall count.

/**
 * Processes raw textual input to calculate a specific value based on
 * element frequencies and input structure.
 *
 * The input is expected to be a string with two lines:
 * - The first line contains a single integer representing a total count.
 * - The second line contains space-separated elements (strings or numbers).
 *
 * @param {string} rawTextInput The complete input string from which to extract data.
 * @returns {number} The calculated numerical result.
 */
function processInputData(rawTextInput) {
    // A nested helper function to encapsulate the initial parsing logic.
    // This improves readability by separating data extraction from main processing.
    const extractStructuredInput = (textSource) => {
        // Split the input string into individual lines.
        const sourceLines = textSource.split('\n');

        // Parse the first line to get the total count. Using Number() for type conversion.
        // .trim() is added for robustness against leading/trailing whitespace.
        const overallElementCount = Number(sourceLines[0].trim());

        // Parse the second line to get the list of data elements.
        // Elements are expected to be space-separated.
        const dataElementStrings = sourceLines[1].trim().split(' ');

        // Return an object containing the parsed components.
        return { overallElementCount, dataElementStrings };
    };

    // Destructure the results from the parsing helper for easier access.
    const { overallElementCount, dataElementStrings } = extractStructuredInput(rawTextInput);

    // Initialize a Map to store the frequency of each unique data element.
    // Maps are efficient for key-value pairs and handle non-string keys well,
    // though here keys are strings.
    const elementFrequencyMap = new Map();

    // Iterate through each element in the parsed list to build the frequency map.
    // Using a 'for...of' loop for modern iteration over array elements.
    for (const currentItem of dataElementStrings) {
        // Increment the count for the current item. If the item is encountered for the first time,
        // its count is initialized to 0, then incremented to 1.
        elementFrequencyMap.set(currentItem, (elementFrequencyMap.get(currentItem) || 0) + 1);
    }

    // Convert the keys (the unique elements) from the frequency map into an array.
    // This array will be used for sorting and conditional logic.
    let uniqueElementKeys = Array.from(elementFrequencyMap.keys());

    // Define a comparison function for sorting. This function will sort elements
    // based on their frequencies in descending order (most frequent first).
    const compareElementsByFrequencyDescending = (itemA, itemB) => {
        // Retrieve frequencies from the map. Use '|| 0' as a safeguard if a key is missing
        // (though it shouldn't be for keys derived from the map itself).
        const frequencyOfA = elementFrequencyMap.get(itemA) || 0;
        const frequencyOfB = elementFrequencyMap.get(itemB) || 0;
        return frequencyOfB - frequencyOfA; // Descending order
    };

    let calculatedOutcome; // Declare a variable to hold the final computed result.

    // Implement the core logic based on the number of unique elements found.
    // This is a multi-way conditional structure.
    if (uniqueElementKeys.length === 1) {
        // Scenario 1: Only one type of element is present.
        // The result is half of the total count.
        calculatedOutcome = overallElementCount / 2;
    } else if (uniqueElementKeys.length === 2) {
        // Scenario 2: Exactly two unique elements are present.
        // Sort these two elements to identify the one with higher frequency (or equal).
        uniqueElementKeys.sort(compareElementsByFrequencyDescending);

        // Extract the two elements and their frequencies.
        const topElement = uniqueElementKeys[0];
        const secondElement = uniqueElementKeys[1];
        const topFrequency = elementFrequencyMap.get(topElement);
        const secondFrequency = elementFrequencyMap.get(secondElement);

        // If both elements have the same frequency, the outcome is zero.
        if (topFrequency === secondFrequency) {
            calculatedOutcome = 0;
        } else {
            // Otherwise, the outcome is half the difference between their frequencies.
            calculatedOutcome = (topFrequency - secondFrequency) / 2;
        }
    } else { // Scenario 3: More than two unique elements are present (uniqueElementKeys.length > 2).
        // Sort all unique elements by frequency in descending order.
        uniqueElementKeys.sort(compareElementsByFrequencyDescending);

        // Create a new array containing all elements EXCEPT the two most frequent ones.
        // `slice(2)` is an efficient way to achieve this without modifying the original array.
        const elementsForSummation = uniqueElementKeys.slice(2);

        let aggregateFrequencySum = 0; // Initialize accumulator for the sum.

        // Sum the frequencies of the remaining elements.
        for (const itemKeyToSum of elementsForSummation) {
            aggregateFrequencySum += elementFrequencyMap.get(itemKeyToSum);
        }
        calculatedOutcome = aggregateFrequencySum;
    }

    // The function returns the final computed numerical result.
    return calculatedOutcome;
}

// This section handles the execution environment, specifically reading input
// from standard input and printing the result to standard output.
try {
    // Use Node.js 'fs' module to synchronously read the entire content
    // of '/dev/stdin' (standard input) as a UTF-8 string.
    const fileContentFromStdin = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the main processing function with the read content.
    const finalComputedValue = processInputData(fileContentFromStdin);

    // Print the computed value to standard output.
    // .toString() is used to ensure that even numerical results like 0 are
    // outputted as a string, matching potential original behavior for "0".
    console.log(finalComputedValue.toString());
} catch (inputReadError) {
    // Basic error handling for issues during file reading or processing.
    console.error("An error occurred while handling input or processing data:", inputReadError.message);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
}