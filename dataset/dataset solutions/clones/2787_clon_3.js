const processDataSeries = (sourceLines) => {
    // Validate that required input lines are present
    if (!Array.isArray(sourceLines) || sourceLines.length < 2) {
        console.error("Input error: Insufficient data lines provided.");
        return;
    }

    // Parse the total count of numbers from the first line
    const elementCount = Number(sourceLines[0]);

    // Validate the parsed count: must be a positive, even integer
    if (isNaN(elementCount) || elementCount <= 0 || elementCount % 2 !== 0) {
        console.error("Input error: Invalid or non-even count of elements detected.");
        return;
    }

    // Process the second line to extract individual numerical values
    // Using a more robust split and parseFloat for flexibility
    let numericalValues = sourceLines[1]
        .split(/\s+/) // Splits by one or more whitespace characters
        .filter(segment => segment.trim() !== '') // Removes any empty strings resulting from split
        .map(strValue => parseFloat(strValue)); // Converts each string segment to a floating-point number

    // Validate the parsed numerical array
    if (numericalValues.some(val => isNaN(val)) || numericalValues.length !== elementCount) {
        console.error("Input error: Data sequence contains non-numeric entries or count mismatch.");
        return;
    }

    // Sort the collected numerical values in ascending order
    numericalValues.sort((valueA, valueB) => {
        // Standard comparison function for numerical sorting
        return valueA - valueB;
    });

    // Determine the central indices for an even-sized array
    const centralIndexLower = (elementCount / 2) - 1; // Index of the first middle element
    const centralIndexUpper = elementCount / 2;       // Index of the second middle element

    // Retrieve the two specific middle elements from the sorted array
    const valueAtLowerMiddle = numericalValues[centralIndexLower];
    const valueAtUpperMiddle = numericalValues[centralIndexUpper];

    // Calculate the absolute difference between these two central values
    const calculatedDifference = Math.abs(valueAtUpperMiddle - valueAtLowerMiddle);

    // Output the computed result to standard output
    console.log(calculatedDifference);
};

// --- Execution Block ---
// Helper function to fetch input from the standard input stream
const acquireStandardInput = () => {
    try {
        // Synchronously read the entire content of stdin
        const fileContentBuffer = require("fs").readFileSync("/dev/stdin");
        // Convert buffer to UTF-8 string and split into an array of lines
        return fileContentBuffer.toString('utf8').split('\n');
    } catch (ioError) {
        // Log any errors encountered during file reading
        console.error(`File system error: Could not read from /dev/stdin. Details: ${ioError.message}`);
        // Return an empty array to gracefully handle the error in the main processing logic
        return [];
    }
};

// Invoke the main data processing function with the acquired input
processDataSeries(acquireStandardInput());