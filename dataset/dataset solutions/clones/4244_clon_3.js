const calculateMagnitude = (valueA, valueB) => Math.abs(valueA - valueB);

function analyzeInputData(sourceText) {
    // Standardize input by trimming whitespace and splitting into individual lines.
    const dataLines = sourceText.trim().split('\n');

    // Ensure adequate input lines are present for processing.
    if (dataLines.length < 2) {
        console.error("Error: Insufficient input lines provided.");
        return;
    }

    // Parse the first line to extract configuration parameters (N, Z, W).
    // Using Number() for parsing is a concise alternative to parseInt().
    const configurationValues = dataLines.shift().split(' ').map(Number);

    // Validate the number of configuration parameters.
    if (configurationValues.length < 3) {
        console.error("Error: Expected three configuration values (N, Z, W).");
        return;
    }

    // Assign parsed configuration values to more descriptive variable names.
    const expectedElementCount = configurationValues[0]; // Represents 'N'
    const firstReferenceValue = configurationValues[1];  // Represents 'Z'
    const secondReferenceValue = configurationValues[2]; // Represents 'W'

    // Parse the second line to obtain the main numeric sequence (array A).
    const numericSequence = dataLines.shift().split(' ').map(Number);

    // Initial check for an empty sequence, which would lead to undefined array accesses.
    if (numericSequence.length === 0) {
        // If the sequence is empty, accessing A[N-1] results in undefined,
        // leading to NaN in calculations. Mimic this behavior.
        process.stdout.write(NaN.toString() + '\n');
        return;
    }

    // Extract the last element of the sequence for multiple comparisons.
    const ultimateElement = numericSequence[numericSequence.length - 1];

    // Initialize variables for calculated differences.
    let differenceOfLastTwo = NaN; // Default to NaN to reflect original behavior if insufficient elements.
    let penultimateElement;

    // Calculate the difference between the last two elements only if the sequence has at least two.
    if (numericSequence.length >= 2) {
        penultimateElement = numericSequence[numericSequence.length - 2];
        differenceOfLastTwo = calculateMagnitude(ultimateElement, penultimateElement);
    }
    // If numericSequence.length < 2, differenceOfLastTwo remains NaN,
    // which aligns with the original code's behavior for A[N-2] being undefined.

    // Calculate the primary difference between the two reference values (Z and W).
    const primaryReferenceDifference = calculateMagnitude(firstReferenceValue, secondReferenceValue);

    // Calculate the difference between the ultimate element of the sequence and the second reference value (W).
    const ultimateElementVsReferenceDifference = calculateMagnitude(ultimateElement, secondReferenceValue);

    // Collect all calculated magnitudes into an array for easy maximum determination.
    const allCalculatedMagnitudes = [
        primaryReferenceDifference,
        differenceOfLastTwo,
        ultimateElementVsReferenceDifference
    ];

    // Determine the maximum value among all calculated magnitudes.
    // Math.max handles NaN values by returning NaN if any argument is NaN.
    const finalMaximumResult = Math.max(...allCalculatedMagnitudes);

    // Output the computed maximum value to standard output, followed by a newline.
    process.stdout.write(finalMaximumResult.toString() + '\n');
}

// Entry point: Read input from standard input and pass it to the analysis function.
// This structure is common in competitive programming environments.
analyzeInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));