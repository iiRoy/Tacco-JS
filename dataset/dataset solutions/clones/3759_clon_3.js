const processData = function(entryData) {
    // Define a constant for separating lines within the input string.
    const LINE_SEPARATOR = '\n';
    // Define a constant for separating individual values on a line.
    const VALUE_DELIMITER = ' ';

    // Split the raw input into an array of lines.
    // We filter out any lines that are empty or contain only whitespace to ensure clean data.
    const inputLines = entryData.split(LINE_SEPARATOR).filter(line => line.trim() !== '');

    // --- Input Validation: Check for presence of data ---
    if (inputLines.length === 0) {
        // If no data lines are found, log an error and terminate processing.
        console.error("Error: The provided input data is completely empty or malformed.");
        return; // Exit the function gracefully.
    }

    // The first line typically contains configuration parameters (e.g., number of items and selection limit).
    // Split this configuration line into its constituent string parts.
    const configurationStrings = inputLines[0].split(VALUE_DELIMITER);

    // --- Input Validation: Check configuration line integrity ---
    if (configurationStrings.length < 2) {
        console.error("Error: Configuration line is incomplete. Expected at least two parameters (N and M).");
        return;
    }

    // Convert the string parameters from the configuration line into numbers.
    // 'itemCount' (N) specifies how many data lines to process.
    // 'topSelectionLimit' (M) specifies how many top scores to sum.
    const itemCount = Number(configurationStrings[0]);
    const topSelectionLimit = Number(configurationStrings[1]);

    // --- Input Validation: Validate configuration parameter values ---
    if (isNaN(itemCount) || isNaN(topSelectionLimit) || itemCount <= 0 || topSelectionLimit <= 0) {
        console.error(`Error: Invalid numeric configuration detected. N=${configurationStrings[0]}, M=${configurationStrings[1]}. Both must be positive integers.`);
        return;
    }

    // Initialize an array to store the processed scores for each data item.
    let computedScores = [];
    // Data processing starts from the second line (index 1) of the input.
    const FIRST_DATA_LINE_INDEX = 1;

    // Iterate through the data lines, from the first data line up to the specified 'itemCount'.
    for (let currentDataItemIndex = FIRST_DATA_LINE_INDEX; currentDataItemIndex <= itemCount; currentDataItemIndex++) {
        // --- Input Validation: Check if the expected data line actually exists ---
        if (currentDataItemIndex >= inputLines.length) {
            console.error(`Warning: Data line for item ${currentDataItemIndex} is missing. Expected ${itemCount} data lines but found fewer. Processing available data.`);
            break; // Stop processing if we run out of lines prematurely.
        }

        // Get the current data line and split it into individual string fields.
        const currentLineFields = inputLines[currentDataItemIndex].split(VALUE_DELIMITER);
        // Convert all string fields on the current line to numbers.
        const numericDataPoints = currentLineFields.map(field => Number(field));

        // --- Input Validation: Check for non-numeric values within data points ---
        if (numericDataPoints.some(isNaN)) {
            console.warn(`Warning: Non-numeric data encountered on line ${currentDataItemIndex}. This line will be skipped.`);
            continue; // Skip to the next line if invalid data is found.
        }

        // --- Input Validation: Ensure sufficient data points for calculation ---
        // The original logic assumes at least three numeric values per data line.
        const REQUIRED_DATA_POINTS = 3;
        if (numericDataPoints.length < REQUIRED_DATA_POINTS) {
            console.warn(`Warning: Insufficient data points on line ${currentDataItemIndex}. Expected at least ${REQUIRED_DATA_POINTS} values. Skipping this line.`);
            continue;
        }

        // Calculate the raw sum of the first three numeric data points.
        const rawScoreAggregate = numericDataPoints[0] + numericDataPoints[1] + numericDataPoints[2];

        // Ensure the score is always non-negative by taking its absolute value.
        const finalItemScore = Math.abs(rawScoreAggregate);

        // Add the calculated score to our collection.
        computedScores.push(finalItemScore);
    }

    // Sort the collected scores in descending order.
    // This puts the highest scores at the beginning of the array.
    computedScores.sort((scoreA, scoreB) => scoreB - scoreA);

    // Initialize a variable to store the sum of the top scores.
    let accumulatedTotalScore = 0;
    // Determine the actual number of scores to sum, ensuring we don't exceed the available scores.
    const effectiveSelectionCount = Math.min(topSelectionLimit, computedScores.length);

    // Sum the 'effectiveSelectionCount' highest scores.
    for (let selectionIdx = 0; selectionIdx < effectiveSelectionCount; selectionIdx++) {
        accumulatedTotalScore += computedScores[selectionIdx];
    }

    // Output the final calculated total to the console.
    console.log(accumulatedTotalScore);
};

// The following line executes the 'processData' function.
// It reads the entire content from standard input ('/dev/stdin'),
// decodes it as UTF-8 text, and then trims any leading or trailing whitespace
// before passing it to the processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8").trim());