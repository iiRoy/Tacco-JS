function analyzeNumericSeries(rawTextContent) {
    // This function processes a multi-line string input to calculate
    // the total count of successive divisions by two for all numbers
    // in the series, until each number becomes odd.

    if (!rawTextContent || typeof rawTextContent !== 'string') {
        console.error("Error: Input content is missing or invalid.");
        return -1; // Indicate an error state
    }

    const inputSegments = rawTextContent.split("\n");

    // Ensure we have at least two lines of data
    if (inputSegments.length < 2) {
        console.warn("Warning: Insufficient input lines provided.");
        return 0; // No data to process
    }

    // Attempt to parse the first line as the expected length of the series.
    const seriesLengthStr = inputSegments[0].trim();
    const expectedSeriesLength = Number(seriesLengthStr);

    if (isNaN(expectedSeriesLength) || expectedSeriesLength < 0) {
        console.error(`Error: Invalid series length specified: '${seriesLengthStr}'. Must be a non-negative number.`);
        return -1;
    }

    // Process the second line to extract the numeric values.
    // We'll filter out any non-numeric tokens.
    const rawValues = inputSegments[1].trim().split(" ");
    const valueCollection = rawValues
        .map(token => Number(token))
        .filter(num => !isNaN(num)); // Only keep valid numbers

    // Validate if the number of parsed elements matches the expected length.
    if (valueCollection.length !== expectedSeriesLength) {
        console.warn(`Warning: Mismatch between declared length (${expectedSeriesLength}) and actual parsed element count (${valueCollection.length}). Processing available elements.`);
        // We proceed with the available elements, but a stricter implementation might throw an error.
    }

    let totalEvenDivisions = 0; // Accumulator for the final count
    let elementsProcessedCounter = 0; // Just for internal tracking, not strictly necessary for result

    // Helper function to count divisions for a single number
    const countDivisionsForElement = (inputNumber) => {
        let currentElementValue = inputNumber;
        let elementDivisionCount = 0;

        // Skip processing if the number is not positive or is zero/negative
        if (currentElementValue <= 0) {
            // console.log(`Skipping non-positive number: ${inputNumber}`);
            return 0;
        }

        // Loop while the number is even using bitwise check for efficiency
        while ((currentElementValue & 1) === 0) {
            currentElementValue >>= 1; // Equivalent to currentElementValue = currentElementValue / 2;
            elementDivisionCount++;
        }
        return elementDivisionCount;
    };

    // Iterate through each numeric value in the collection
    for (let currentIdx = 0; currentIdx < valueCollection.length; currentIdx++) {
        const val = valueCollection[currentIdx];
        const divisionsForThisElement = countDivisionsForElement(val);
        totalEvenDivisions += divisionsForThisElement;
        elementsProcessedCounter++; // Increment our internal counter
    }

    // A final check or summary could be added here if desired.
    // console.log(`Successfully processed ${elementsProcessedCounter} elements.`);

    return totalEvenDivisions;
}

// Main execution block: reads from stdin and invokes the processing function.
try {
    const fileSystem = require("fs");
    const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf-8");
    const finalResult = analyzeNumericSeries(standardInputContent);

    if (finalResult !== -1) { // Only log if no critical error occurred
        console.log(finalResult);
    } else {
        console.error("Processing failed due to input errors.");
        // Optionally, exit with a non-zero status code to indicate failure
        // process.exit(1);
    }
} catch (executionError) {
    console.error("An unexpected error occurred during execution:", executionError.message);
    // process.exit(1);
}