// This function serves as the primary entry point for processing the provided input string.
// It analyzes numeric data to determine a specific parity-based outcome.
function processInputData(rawInputTextPayload) {
    // Step 1: Input Validation and Initial Parsing
    // Ensure the raw input string is not null, undefined, or empty after trimming.
    if (!rawInputTextPayload || typeof rawInputTextPayload !== 'string' || rawInputTextPayload.trim().length === 0) {
        console.error("Error: The provided input payload is empty or invalid. Cannot proceed with processing.");
        return; // Terminate execution if input is not viable.
    }

    // Normalize the input by trimming leading/trailing whitespace and splitting into individual lines.
    const contentLines = rawInputTextPayload.trim().split('\n');

    // Verify that we have at least two lines of input: one for count, one for numbers.
    if (contentLines.length < 2) {
        console.error("Error: Insufficient data lines provided. Expected at least two lines.");
        return;
    }

    // Helper function to robustly parse a line of space-separated integers.
    // It handles potential non-numeric entries by filtering them out.
    const extractIntegerArrayFromLine = (lineContent) => {
        return lineContent.split(' ')
                          .map(segment => {
                              const numericalValue = Number(segment.trim());
                              // Check for NaN and finite numbers to ensure valid integers.
                              if (!isNaN(numericalValue) && Number.isFinite(numericalValue)) {
                                  return Math.floor(numericalValue); // Ensure integers by flooring.
                              }
                              console.warn(`Warning: Skipping non-numeric or invalid segment '${segment}' during parsing.`);
                              return NaN; // Return NaN for invalid segments.
                          })
                          .filter(val => !isNaN(val)); // Remove all NaN entries.
    };

    // Parse the expected total count of numbers from the first line.
    const specifiedElementCount = parseInt(contentLines[0].trim(), 10);
    if (isNaN(specifiedElementCount) || specifiedElementCount < 0) {
        console.error("Error: The specified element count on the first line is invalid or negative.");
        return;
    }

    // Parse the actual array of numeric values from the second line.
    const arrayOfNumericValues = extractIntegerArrayFromLine(contentLines[1]);

    // Step 2: Data Integrity Check (Validation)
    // Compare the actual number of parsed elements with the expected count.
    if (arrayOfNumericValues.length !== specifiedElementCount) {
        console.warn(`Data Mismatch Warning: Expected ${specifiedElementCount} elements, but found ${arrayOfNumericValues.length}. Processing with available data.`);
        // The program will continue, but this warning indicates a potential issue in input.
    }

    // Step 3: Core Logic - Counting Odd Numbers
    let totalOddNumberInstances = 0; // Initialize a counter for odd numbers encountered.

    // Iterate through each number in the processed array.
    // Using a 'for...of' loop for direct element access and improved readability.
    for (const currentNumericItem of arrayOfNumericValues) {
        // Ensure the item is a valid integer before performing parity check.
        if (typeof currentNumericItem === 'number' && Number.isInteger(currentNumericItem)) {
            // Determine if the current number is odd using the modulo operator.
            const isThisNumberOdd = (currentNumericItem % 2 !== 0);
            if (isThisNumberOdd) {
                totalOddNumberInstances++; // Increment counter if it is indeed an odd number.
            }
        } else {
            console.warn(`Skipping non-integer or invalid item in array: ${currentNumericItem}`);
        }
    }

    // Step 4: Final Decision Logic
    // Evaluate the parity of the total count of odd numbers.
    const isParityOfOddCountsOdd = (totalOddNumberInstances % 2 !== 0);

    let finalSystemOutcomeMessage; // Variable to store the resulting message.

    // Assign the appropriate message based on the parity of 'totalOddNumberInstances'.
    if (isParityOfOddCountsOdd) {
        finalSystemOutcomeMessage = "NO"; // Output "NO" if the count of odd numbers is odd.
    } else {
        finalSystemOutcomeMessage = "YES"; // Output "YES" if the count of odd numbers is even.
    }

    // Display the final determined outcome.
    console.log(finalSystemOutcomeMessage);
}

// --- Execution Entry Point ---
// This block handles reading the input from standard input and invoking the main processing function.
const fileSystemModule = require("fs"); // Import the Node.js file system module.
const standardInputFile = "/dev/stdin"; // Define the path for standard input on Unix-like systems.
const textEncodingStandard = "utf8"; // Specify the character encoding for input.

try {
    // Synchronously read the entire content of the standard input file.
    const rawDataContent = fileSystemModule.readFileSync(standardInputFile, textEncodingStandard);
    // Pass the raw content to our main processing function.
    processInputData(rawDataContent);
} catch (readError) {
    // Catch and report any errors that occur during file reading.
    console.error(`FATAL ERROR: Could not read input from ${standardInputFile}. Details: ${readError.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}