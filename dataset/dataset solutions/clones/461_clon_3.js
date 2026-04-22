const fileSystemProcessor = require('fs'); // Obtain the necessary file system module.

// Read the entire content from standard input, interpreting it as UTF-8 text.
// This block initializes the raw data source for subsequent processing.
const rawContentFromStandardInput = fileSystemProcessor.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove any leading/trailing whitespace, then divide into individual lines.
// Each line will be an element in the 'processedInputSegments' array.
const processedInputSegments = rawContentFromStandardInput.trim().split('\n');

// Define a static mapping for digit transformations.
// This structure centralizes the replacement rules for clarity and maintainability.
const digitReplacementRules = {
    '7': '9', // Replace digit 7 with 9
    '6': '8', // Replace digit 6 with 8
    '5': '7', // Replace digit 5 with 7
    '4': '5'  // Replace digit 4 with 5
};

// Initialize a flag to control the main processing loop.
// The loop continues as long as this flag remains true.
let shouldContinueLoop = true;

// Begin the primary data processing loop.
// This loop iterates through the input segments until a specific termination condition is met.
while (shouldContinueLoop) {
    // Extract the next line from the beginning of the array.
    // The 'shift()' method also removes the element from the array.
    const currentSegmentString = processedInputSegments.shift();

    // --- Guard Clause: Handle empty input or end of stream ---
    // If 'currentSegmentString' is undefined (meaning no more elements in the array)
    // or if the trimmed string is empty, we consider it the end of valid input.
    if (currentSegmentString === undefined || currentSegmentString.trim() === '') {
        shouldContinueLoop = false; // Set flag to terminate the loop.
        break;                     // Exit the loop immediately.
    }

    // Attempt to convert the current string segment into a numeric value.
    // Using Number() provides explicit type conversion.
    const numericalInterpretation = Number(currentSegmentString);

    // --- Guard Clause: Handle non-numeric input ---
    // If the conversion results in NaN (Not-a-Number), it indicates invalid input.
    // In such cases, we log a warning and skip to the next iteration without processing.
    if (isNaN(numericalInterpretation)) {
        console.error("Warning: Non-numeric input detected. Skipping line: " + currentSegmentString);
        continue; // Move to the next iteration of the loop.
    }

    // --- Termination Condition: Check for zero value ---
    // If the extracted numerical value is 0, this signifies the end of the data set
    // according to problem specifications.
    if (numericalInterpretation === 0) {
        shouldContinueLoop = false; // Set flag to terminate the loop.
        break;                     // Exit the loop immediately.
    }

    // Convert the valid numerical value into its octal (base-8) string representation.
    // The 'toString(8)' method handles this conversion directly.
    let octalStringEquivalent = numericalInterpretation.toString(8);

    // Apply the defined digit transformations to the octal string.
    // This is done efficiently using a single 'replace' call with a callback function.
    // The regex `/[4567]/g` matches all occurrences of digits 4, 5, 6, or 7.
    const finalTransformedString = octalStringEquivalent.replace(/[4567]/g, (matchedCharacter) => {
        // The callback function looks up the matched digit in our 'digitReplacementRules' map.
        // If a rule exists, it returns the replacement digit; otherwise, it returns the original character.
        return digitReplacementRules[matchedCharacter] || matchedCharacter;
    });

    // Output the resulting transformed octal string to the console.
    console.log(finalTransformedString);
}

// The program concludes execution once 'shouldContinueLoop' becomes false.