const ProcessInputData = (rawDataContent) => {
    // Validate that the provided input is a non-empty string.
    if (!rawDataContent || typeof rawDataContent !== 'string' || rawDataContent.trim().length === 0) {
        console.error("Input processing error: Received invalid or empty data.");
        // For robustness, output 0 in case of critical input errors.
        console.log(0);
        return;
    }

    // Split the entire input block into separate lines for easier parsing.
    const inputLinesArray = rawDataContent.split("\n");

    // A minimum of two lines are expected: one for parameters (N, K) and one for the numbers list.
    if (inputLinesArray.length < 2) {
        console.error("Input processing error: Not enough lines in the input. Expected at least two.");
        console.log(0);
        return;
    }

    // Define the radix for integer parsing to avoid unexpected behavior.
    const NUMERIC_RADIX = 10;

    // Parse the first line to extract the two key parameters: total count (N) and elements to discard (K).
    const parameterTokens = inputLinesArray[0].split(" ");

    // Ensure both N and K parameters are present.
    if (parameterTokens.length < 2) {
        console.error("Input processing error: Missing N or K parameter on the first line.");
        console.log(0);
        return;
    }

    const totalElementCount = parseInt(parameterTokens[0], NUMERIC_RADIX);
    const elementsToExcludeCount = parseInt(parameterTokens[1], NUMERIC_RADIX);

    // Parse the second line, converting all space-separated string representations of numbers into actual integers.
    const rawNumberStrings = inputLinesArray[1].split(" ");
    const parsedNumericList = rawNumberStrings.map(str => parseInt(str, NUMERIC_RADIX));

    // A critical validation: ensure the actual number of parsed values matches the declared totalElementCount (N).
    // If N is 0, it's a special case where no elements are expected.
    if (totalElementCount > 0 && parsedNumericList.length !== totalElementCount) {
        console.error(`Data integrity warning: Declared N (${totalElementCount}) does not match actual count of numbers (${parsedNumericList.length}).`);
        // In such a scenario, the result might be ambiguous, so output 0 as a safe default.
        console.log(0);
        return;
    }

    let finalAccumulatedSum = 0; // This variable will store the computed sum.

    // --- Conditional Logic for Summation ---

    // Condition 1: If the number of elements to discard is greater than or equal to the total elements.
    // In this case, all elements are discarded, leaving nothing to sum.
    if (totalElementCount <= elementsToExcludeCount) {
        console.log(0);
    }
    // Condition 2: If no elements are to be discarded (K is zero).
    // Sum all available elements up to 'totalElementCount'.
    else if (elementsToExcludeCount === 0) {
        for (let currentPosition = 0; currentPosition < totalElementCount; ++currentPosition) {
            finalAccumulatedSum += parsedNumericList[currentPosition];
        }
        console.log(finalAccumulatedSum);
    }
    // Condition 3: A positive number of elements (K > 0) are to be discarded, but not all (K < N).
    // This implies we need to sum the smallest (N - K) elements.
    else {
        // Create a shallow copy of the array and sort it in ascending numerical order.
        // This ensures that the smallest values are at the beginning of the array.
        const numericallySortedList = [...parsedNumericList].sort((valA, valB) => valA - valB);

        // Determine how many elements need to be summed (total elements minus those to discard).
        const elementsToIncludeInSum = totalElementCount - elementsToExcludeCount;

        // Iterate through the sorted list and sum the first 'elementsToIncludeInSum' values.
        for (let sumIndex = 0; sumIndex < elementsToIncludeInSum; ++sumIndex) {
            finalAccumulatedSum += numericallySortedList[sumIndex];
        }
        console.log(finalAccumulatedSum);
    }
};

// --- Standard Input Handling ---
// This part is responsible for reading data from standard input and invoking the main processing function.
// As per instructions, this section should typically remain unedited to ensure compatibility with judge systems.
const fileSystemInterface = require("fs");
const standardInputDevicePath = "/dev/stdin";
const defaultEncodingScheme = "utf8";

// Read the entire content from standard input synchronously and pass it to the processing function.
ProcessInputData(fileSystemInterface.readFileSync(standardInputDevicePath, defaultEncodingScheme));