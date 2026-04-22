// This module orchestrates the processing of raw textual data received from a standard input stream.
// It aims to determine a specific pattern within a set of three numerical values.
function ProcessInputData(sourceTextData) {
    // Initialize a string variable to hold the final verdict, defaulting to 'No'.
    let outputVerdict = 'No';

    // --- Input Validation and Pre-processing (Type III Addition) ---
    // Perform initial checks for the integrity and presence of the input data.
    if (!sourceTextData || typeof sourceTextData !== 'string' || sourceTextData.trim().length === 0) {
        // If the input is empty, not a string, or only whitespace, output the default verdict and exit.
        console.log(outputVerdict);
        return;
    }

    // Split the raw input into individual lines. We are primarily interested in the first line.
    const linesOfData = sourceTextData.trim().split("\n");

    // Ensure that at least one line of meaningful data exists after trimming.
    if (linesOfData.length === 0 || linesOfData[0].trim().length === 0) {
        console.log(outputVerdict);
        return;
    }

    // Extract the first line, which is expected to contain space-separated numbers.
    // Use a regular expression to split by one or more whitespace characters for robustness.
    // Filter out any empty strings that might result from multiple spaces.
    const rawNumberStrings = linesOfData[0].split(/\s+/).filter(Boolean);

    // --- Helper Function for Numerical Parsing (Type III Addition) ---
    // Define an internal utility function to safely convert string representations to numbers.
    const parseNumberSafely = (strValue) => {
        const numericalRepresentation = Number(strValue); // Use Number() for conversion.
        // In a competitive programming context, inputs are usually guaranteed valid.
        // However, for robustness, one might handle NaN or non-integer cases.
        if (isNaN(numericalRepresentation)) {
            // For this specific problem, we assume valid integer inputs.
            // A more complex solution might throw an error or assign a default.
            return 0; // Returning 0 as a fallback, though ideally, input would be clean.
        }
        return numericalRepresentation;
    };

    // --- Data Transformation (Type III Update) ---
    // Convert the array of string numbers into an array of actual numerical values.
    let numericValues = [];
    for (const strElement of rawNumberStrings) {
        numericValues.push(parseNumberSafely(strElement));
    }

    // --- Structural Validation (Type III Addition - Guard Clause) ---
    // The problem implies exactly three numbers are provided. Validate this assumption.
    if (numericValues.length !== 3) {
        // If the count of numbers is not exactly three, the specific logic cannot apply.
        // Output the default 'No' and terminate processing for this input.
        console.log(outputVerdict);
        return;
    }

    // --- Core Logic: Sorting and Frequency Analysis (Type III Rewrite) ---
    // Sort the numerical values in ascending order to simplify comparisons later.
    // This maintains the original intent of ordering but is integrated into a new logic flow.
    numericValues.sort((firstVal, secondVal) => firstVal - secondVal);

    // Utilize a Map to count the occurrences of each unique number.
    // This is a significant structural change from direct indexed comparisons.
    const valueFrequencies = new Map();
    for (const currentNumber of numericValues) {
        // Increment the count for the current number, initializing to 0 if not present.
        valueFrequencies.set(currentNumber, (valueFrequencies.get(currentNumber) || 0) + 1);
    }

    // Extract the counts of unique values into an array.
    // Example: For [1, 1, 2], valueFrequencies will be {1: 2, 2: 1}, and frequencyCounts will be [2, 1].
    // Example: For [1, 2, 3], valueFrequencies will be {1: 1, 2: 1, 3: 1}, and frequencyCounts will be [1, 1, 1].
    // Example: For [1, 1, 1], valueFrequencies will be {1: 3}, and frequencyCounts will be [3].
    const frequencyCounts = Array.from(valueFrequencies.values());

    // Evaluate the conditions to determine if exactly two numbers are identical and one is different.
    // This condition translates to having two unique numbers in the input set,
    // where one appears once and the other appears twice.
    const hasExactlyTwoDistinctValues = frequencyCounts.length === 2;
    const containsOneOccurrence = frequencyCounts.includes(1);
    const containsTwoOccurrences = frequencyCounts.includes(2);

    // If all three sub-conditions are met, then the pattern "two numbers are the same, one is different" is found.
    if (hasExactlyTwoDistinctValues && containsOneOccurrence && containsTwoOccurrences) {
        outputVerdict = 'Yes';
    }

    // --- Output Generation ---
    // Display the final determination.
    console.log(outputVerdict);
}

// --- Standard Input/Output Integration (Typically untouched in competitive programming) ---
// This segment reads all data from standard input and passes it to the main processing function.
// It's crucial for the execution environment but not part of the problem's core logic.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

// For local development and testing with a specific file, the following line can be uncommented:
// ProcessInputData(require('fs').readFileSync('./local_test_data.txt', 'utf-8'));