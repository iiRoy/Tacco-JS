const calculateElementFrequencies = (inputSeries) => {
    // Validate the input series to ensure it's an array and not empty.
    // If the input is not a proper array or has no elements, return empty lists.
    if (!Array.isArray(inputSeries) || inputSeries.length === 0) {
        return { uniqueElements: [], elementCounts: [] };
    }

    // Initialize data structures to hold the distinct items and their corresponding counts.
    // 'uniqueElements' will store each distinct value found in the series.
    const uniqueElements = [];
    // 'elementCounts' will store the frequency of each corresponding unique element.
    const elementCounts = [];
    // 'previousItem' helps in comparing consecutive elements after sorting.
    let previousItem = undefined;

    // Create a mutable copy and sort it numerically to group identical elements together.
    // This ensures that all occurrences of a number are adjacent, simplifying counting.
    const sortedSeries = [...inputSeries].sort((valA, valB) => valA - valB);

    // Iterate through the sorted data set to aggregate frequencies.
    // 'currentIdx' is the index of the element being processed in the current iteration.
    for (let currentIdx = 0; currentIdx < sortedSeries.length; ++currentIdx) {
        const currentItem = sortedSeries[currentIdx];

        // Check if the current element is different from the previously processed one.
        // This condition identifies the first occurrence of a new distinct element.
        if (currentItem !== previousItem) {
            // This is a new distinct element. Add it to our unique list.
            uniqueElements.push(currentItem);
            // Initialize its count to one, as this is its first observed occurrence.
            elementCounts.push(1);
        } else {
            // The current element is a repeat of the previous one. Increment its count.
            // Access the last element in the counts array and update it.
            const lastIndexInCounts = elementCounts.length - 1;
            // A safety check, though 'lastIndexInCounts' should always be valid here.
            if (lastIndexInCounts >= 0) {
                elementCounts[lastIndexInCounts]++;
            }
        }
        // Update 'previousItem' to the 'currentItem' for the next iteration's comparison.
        previousItem = currentItem;
    }

    // Return an object containing the two processed lists for clarity and easier access.
    return { uniqueElements, elementCounts };
};

// This is the primary execution function responsible for processing the application's logic.
const processApplicationData = (consoleInput) => {
    // Convert the raw input to a string and split it into individual lines.
    const linesOfInput = String(consoleInput).split('\n');

    // Basic validation: Ensure there are at least two lines of input (N and the numbers).
    if (linesOfInput.length < 2) {
        console.error("Error: Insufficient input lines provided for processing.");
        return; // Terminate execution if input is malformed.
    }

    // The first line (linesOfInput[0]) typically contains 'N', the number of elements.
    // In this specific problem's logic, 'N' is not directly used after parsing the array,
    // so it can be omitted or used for an additional validation if needed.
    // const initialCount = parseInt(linesOfInput[0], 10); // Example: If 'N' were to be used.

    // Extract the numerical data from the second line of input.
    const numericalDataString = linesOfInput[1];
    let parsedNumbers = numericalDataString
        .split(' ') // Split the string of numbers by spaces.
        .map(str => {
            // Parse each string segment into an integer. Trim whitespace before parsing.
            const numVal = parseInt(str.trim(), 10);
            // Add a validation step: If parsing results in NaN, default to 0.
            // This handles cases of non-numeric input gracefully.
            return isNaN(numVal) ? 0 : numVal;
        })
        .filter(num => typeof num === 'number'); // Filter out any non-numeric results (e.g., if default 0 was not desired).

    // If, after parsing and filtering, no valid numbers remain, output 0 and exit.
    if (parsedNumbers.length === 0) {
        console.log(0);
        return;
    }

    // Perform frequency analysis on the prepared numerical data using the helper function.
    const analysisOutput = calculateElementFrequencies(parsedNumbers);
    // Destructure the result object for direct access to unique elements and their counts.
    const { uniqueElements, elementCounts } = analysisOutput;

    // Initialize a variable to accumulate the final computed sum of discrepancies.
    let discrepancySum = 0;

    // A guard clause to ensure data integrity: unique elements list and count list should match in length.
    // If they don't, it indicates an issue in the frequency calculation logic.
    if (uniqueElements.length !== elementCounts.length) {
        console.warn("Data integrity warning: Mismatch between unique elements list length and count list length.");
        // Depending on requirements, one might throw an error or adjust iteration limit.
    }

    // Determine the safe iteration limit, considering potential length mismatches.
    const iterationLimit = Math.min(uniqueElements.length, elementCounts.length);

    // Iterate over the unique elements and their corresponding frequencies to calculate the sum.
    for (let currentIterationIndex = 0; currentIterationIndex < iterationLimit; ++currentIterationIndex) {
        const valueUnderConsideration = uniqueElements[currentIterationIndex];
        const observedFrequency = elementCounts[currentIterationIndex];

        // Check for a discrepancy between the numeric value itself and its observed frequency.
        if (valueUnderConsideration !== observedFrequency) {
            // Scenario 1: The value is less than its frequency.
            if (valueUnderConsideration < observedFrequency) {
                // The frequency is higher than the value. We need to reduce the count.
                // The amount to add to the sum is the excess frequency.
                const excessFrequency = observedFrequency - valueUnderConsideration;
                discrepancySum += excessFrequency;
            }
            // Scenario 2: The value is greater than its frequency.
            // This is handled as a separate 'if' block, similar to the original structure.
            if (valueUnderConsideration > observedFrequency) {
                // The value is higher than its frequency. In this case, all observed instances
                // of this value contribute to the sum, effectively "removing" them.
                discrepancySum += observedFrequency;
            }
        }
    }

    // Output the final computed discrepancy sum to the console.
    console.log(discrepancySum);
};

// This immediately-invoked function expression (IIFE) handles the standard input/output.
// It reads the entire content from /dev/stdin and passes it to the main processing function.
// This structure is common in competitive programming environments for script execution.
(() => {
    // Acquire the Node.js file system module for reading input files.
    const fileSystemModule = require("fs");
    // Specify the standard input file path, common in Unix-like systems.
    const standardInputFilePath = "/dev/stdin";
    // Read the entire content of the standard input file synchronously.
    // The content is decoded as UTF-8 to handle various character encodings.
    const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, "utf8");
    // Invoke the core application logic with the retrieved raw input data.
    processApplicationData(rawInputContent);
})();