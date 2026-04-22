const fileSystemModule = require('fs');

const standardInputFilePath = '/dev/stdin';

// Helper function to safely parse a string into a number.
// It uses Number() for type conversion and defaults to 0 if parsing fails (NaN).
const safelyParseNumber = (stringValue, defaultValue = 0) => {
    const numericResult = Number(stringValue);
    return isNaN(numericResult) ? defaultValue : numericResult;
};

// Helper function to process a line of space-separated numeric values.
// It splits the line, filters out any empty strings (e.g., from multiple spaces),
// and then maps each part to a number using the safe parser.
const extractNumericValuesFromLine = (lineData) => {
    if (typeof lineData !== 'string' || lineData.trim() === '') {
        return []; // Return an empty array for invalid or empty lines.
    }
    return lineData.split(' ').filter(Boolean).map(safelyParseNumber);
};

// Main function to orchestrate the input processing and calculation.
const executeDigitCostCalculation = () => {
    let rawInputData;
    try {
        // Read the entire standard input file synchronously as a UTF-8 string.
        rawInputData = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
    } catch (readError) {
        console.error(`Error reading input from ${standardInputFilePath}: ${readError.message}`);
        // Terminate execution if input cannot be read.
        process.exit(1);
    }

    // Split the raw input into individual lines, trimming overall whitespace
    // to handle potential leading/trailing blank lines or spaces.
    let processedInputLines = rawInputData.trim().split('\n');

    // Validate that there is at least one line for the initial height parameter.
    if (processedInputLines.length === 0) {
        console.error("Input data is empty. Cannot proceed.");
        process.exit(1);
    }

    // Extract the first line, which contains the height parameter.
    const firstLineValues = extractNumericValuesFromLine(processedInputLines.shift());
    // The height parameter is the first number on the first line.
    const problemHeightParameter = firstLineValues.length > 0 ? firstLineValues[0] : 0;

    // Initialize the 10x10 matrix to store the direct and shortest travel costs between digits.
    // Each cell is initially set to Infinity to represent unreachable paths,
    // which is standard for the Floyd-Warshall algorithm.
    const digitTransformationCosts = Array.from({ length: 10 }, () => Array(10).fill(Infinity));

    // Populate the initial digit transformation costs matrix from the next 10 input lines.
    // Each line represents a row in the 10x10 matrix.
    for (let currentRowIndex = 0; currentRowIndex < 10; ++currentRowIndex) {
        if (processedInputLines.length === 0) {
            console.warn(`Warning: Insufficient lines provided for the 10x10 cost matrix. Expected 10 rows, but only ${currentRowIndex} were available.`);
            // Fill remaining rows with default Infinity values if input is cut short.
            break;
        }
        const currentLineDigitCosts = extractNumericValuesFromLine(processedInputLines.shift());
        for (let currentColumnIndex = 0; currentColumnIndex < 10; ++currentColumnIndex) {
            if (currentColumnIndex < currentLineDigitCosts.length) {
                // Assign the parsed cost from the input.
                digitTransformationCosts[currentRowIndex][currentColumnIndex] = currentLineDigitCosts[currentColumnIndex];
            } else {
                // If a row has fewer than 10 values, remaining cells stay Infinity.
                // This handles potentially malformed input rows.
                console.warn(`Warning: Row ${currentRowIndex} had fewer than 10 cost values. Cell [${currentRowIndex}][${currentColumnIndex}] remains Infinity.`);
            }
        }
    }

    // Initialize an array to count the occurrences of each digit (0 through 9).
    // All counts start at zero.
    const digitOccurrenceFrequencies = Array.from({ length: 10 }, () => 0);

    // Process the remaining 'problemHeightParameter' lines to count digit frequencies.
    // Each line contains multiple digits whose occurrences need to be tallied.
    for (let currentInputLineNumber = 0; currentInputLineNumber < problemHeightParameter; ++currentInputLineNumber) {
        if (processedInputLines.length === 0) {
            console.warn(`Warning: Not enough lines for digit frequency counting. Expected ${problemHeightParameter} lines, but only ${currentInputLineNumber} were processed.`);
            break;
        }
        const digitsOnCurrentLine = extractNumericValuesFromLine(processedInputLines.shift());
        digitsOnCurrentLine.forEach(digitValue => {
            // Only increment the count if the digit is within the valid range (0-9).
            if (digitValue >= 0 && digitValue <= 9) {
                digitOccurrenceFrequencies[digitValue]++;
            } else {
                // Log a warning for any digit outside the expected range.
                console.warn(`Encountered an invalid digit '${digitValue}' during frequency counting. Skipping.`);
            }
        });
    }

    // --- Floyd-Warshall Algorithm Implementation ---
    // This triple-nested loop computes the all-pairs shortest paths for digit transformations.
    // It finds the minimum cost to transform any digit 'source' to any other digit 'destination'
    // by considering all possible intermediate digits 'inter'.
    for (let interDigit = 0; interDigit < 10; ++interDigit) { // 'k' in standard FW notation
        for (let sourceDigit = 0; sourceDigit < 10; ++sourceDigit) { // 'i' in standard FW notation
            for (let destinationDigit = 0; destinationDigit < 10; ++destinationDigit) { // 'j' in standard FW notation
                // Calculate the potential new path cost: source -> inter -> destination.
                const costViaIntermediate = digitTransformationCosts[sourceDigit][interDigit] + digitTransformationCosts[interDigit][destinationDigit];

                // If the path through 'interDigit' is shorter than the currently known shortest path, update it.
                if (costViaIntermediate < digitTransformationCosts[sourceDigit][destinationDigit]) {
                    digitTransformationCosts[sourceDigit][destinationDigit] = costViaIntermediate;
                }
            }
        }
    }

    // --- Final Cost Calculation ---
    // The objective is to calculate the total minimum cost to transform all encountered digits to '1'.
    let accumulatedTotalCost = 0;

    // Iterate through all possible digits (0 to 9).
    // Using Array.from to create an array of indices [0, 1, ..., 9].
    const digitIndices = Array.from({ length: 10 }, (_, idx) => idx);

    accumulatedTotalCost = digitIndices.reduce((currentSumOfCosts, digitCategory) => {
        // Retrieve the number of times this specific digit appeared in the input.
        const frequencyOfDigit = digitOccurrenceFrequencies[digitCategory];
        // Retrieve the minimum cost to transform this specific digit to '1'.
        const shortestCostToTargetOne = digitTransformationCosts[digitCategory][1];

        // Perform a check for unreachable paths.
        if (shortestCostToTargetOne === Infinity) {
            console.warn(`Warning: Digit ${digitCategory} appears ${frequencyOfDigit} times, but there is no path to digit 1. This contribution will be effectively infinite.`);
            // Depending on problem specifics, one might treat this as an error,
            // or return a very large number, or just let it contribute Infinity if that's desired behavior.
            // For this problem, we assume valid paths for all digits to 1.
        }

        // Calculate the total cost contribution for this digit category:
        // (number of times it appeared) * (cost to transform it to '1').
        const individualDigitContribution = frequencyOfDigit * shortestCostToTargetOne;

        // Add this contribution to the running total.
        return currentSumOfCosts + individualDigitContribution;
    }, 0); // Start the accumulation with an initial sum of 0.

    // Output the final calculated total minimum cost.
    console.log(accumulatedTotalCost);
};

// Execute the main function.
executeDigitCostCalculation();