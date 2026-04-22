// This script processes a series of daily activity records to compute cumulative scores.
// It reads data from standard input, parses it, and then calculates and reports
// accumulated scores for each successive period.

// Global buffer to collect incoming standard input data.
let incomingDataBuffer = '';

/**
 * Initiates the core calculation logic after all input has been received and processed.
 * This function serves as the entry point for the main business logic.
 * @param {string[]} processedLines - An array where each element is a line from the original input.
 */
function initiateCalculation(processedLines) {
    // Validate that we actually received some input lines.
    if (!processedLines || processedLines.length < 1) {
        console.error("Error: No input lines provided for processing.");
        return; // Exit if no data to process.
    }

    // Attempt to parse the first line to determine the total number of periods (days).
    const totalPeriodsString = processedLines[0];
    const totalPeriodsCount = parseInt(totalPeriodsString, 10);

    // Basic validation for the parsed period count.
    if (isNaN(totalPeriodsCount) || totalPeriodsCount <= 0) {
        console.error(`Validation Error: Expected a positive integer for total periods, but received "${totalPeriodsString}".`);
        return; // Cannot proceed without a valid period count.
    }

    // --- Data Extraction and Parsing ---

    // The original code had a second line (input[1]) that was parsed but never used.
    // For a Type III clone, we can delete such non-essential statements.
    // Therefore, the parsing of the second line is intentionally omitted here.

    // Define indices for slicing the input array to extract score data.
    // Since the second line (index 1) is now effectively skipped/ignored in terms of its content,
    // the score data starts from the line *after* the total periods count.
    const scoreDataStartLineIndex = 1;
    const scoreDataEndLineIndex = scoreDataStartLineIndex + totalPeriodsCount;

    // Extract the raw lines corresponding to daily scores.
    const rawDailyScoreLines = processedLines.slice(scoreDataStartLineIndex, scoreDataEndLineIndex);

    // Process each raw score line into an array of numbers.
    // Added a filter to handle potential empty strings from `split()` for robustness.
    const dailyScoreMatrix = rawDailyScoreLines.map((lineContent, lineIdx) => {
        const parsedScores = lineContent.split(' ')
                                     .filter(segment => segment !== '') // Remove empty strings
                                     .map(scoreStr => parseInt(scoreStr, 10)); // Parse to integer

        // Optional: Add validation for parsed scores for each day.
        if (parsedScores.some(isNaN)) {
            console.warn(`Warning: Non-numeric score detected in line ${scoreDataStartLineIndex + lineIdx + 1}.`);
        }
        return parsedScores;
    });

    // Define indices for slicing the input array to extract chosen item indices.
    const chosenItemDataStartLineIndex = scoreDataEndLineIndex;
    const chosenItemDataEndLineIndex = chosenItemDataStartLineIndex + totalPeriodsCount;

    // Extract the raw lines corresponding to chosen item indices for each day.
    const rawChosenItemLines = processedLines.slice(chosenItemDataStartLineIndex, chosenItemDataEndLineIndex);

    // Process each raw chosen item line into a single number.
    const selectedOptionPerPeriod = rawChosenItemLines.map((lineContent, lineIdx) => {
        const chosenIndex = parseInt(lineContent, 10);
        // Optional: Add validation for the chosen index.
        if (isNaN(chosenIndex)) {
            console.warn(`Warning: Non-numeric chosen index detected in line ${chosenItemDataStartLineIndex + lineIdx + 1}.`);
        }
        return chosenIndex;
    });

    // --- Core Calculation Loop ---

    let currentAccumulatedValue = 0; // Initialize the running total.
    const allCumulativeResults = []; // Store each period's cumulative result for potential later use.

    // Iterate through each period (day) to calculate the cumulative score.
    for (let periodIterator = 0; periodIterator < totalPeriodsCount; periodIterator++) {
        const scoresForCurrentPeriod = dailyScoreMatrix[periodIterator];
        const selectedChoiceIndex = selectedOptionPerPeriod[periodIterator];

        // Add robust checks for array bounds and valid indices.
        if (!scoresForCurrentPeriod) {
            console.error(`Critical Error: Score data missing for period ${periodIterator + 1}. Skipping.`);
            allCumulativeResults.push(currentAccumulatedValue); // Push last valid sum.
            continue;
        }

        if (selectedChoiceIndex === undefined || selectedChoiceIndex < 0 || selectedChoiceIndex >= scoresForCurrentPeriod.length) {
            console.error(`Critical Error: Invalid choice index (${selectedChoiceIndex}) for period ${periodIterator + 1}. Skipping.`);
            allCumulativeResults.push(currentAccumulatedValue); // Push last valid sum.
            continue;
        }

        // Retrieve the score based on the chosen option for the current period.
        const scoreForThisSpecificPeriod = scoresForCurrentPeriod[selectedChoiceIndex];

        // Accumulate the score.
        currentAccumulatedValue += scoreForThisSpecificPeriod;

        // Store the cumulative result.
        allCumulativeResults.push(currentAccumulatedValue);

        // Output the cumulative score for the current period.
        // The output format has been changed to be more descriptive.
        console.log(`Cumulative Score After Period ${periodIterator + 1}: ${currentAccumulatedValue}`);
    }

    // Optional: Log a final summary message.
    // console.log("All period calculations completed successfully.");
    // console.log("Final Total Accumulated Value:", currentAccumulatedValue);
}

// --- Standard Input Handling ---

// Resume standard input stream.
process.stdin.resume();

// Set the encoding for incoming data.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function(dataPiece) {
    incomingDataBuffer += dataPiece; // Append new data to the buffer.
});

// Event listener for the end of the input stream.
process.stdin.on('end', function() {
    // Split the accumulated buffer into an array of lines.
    // Filter out any empty lines that might result from trailing newlines.
    const finalProcessedLines = incomingDataBuffer.split('\n').filter(line => line.trim() !== '');

    // Invoke the main calculation function with the processed input lines.
    initiateCalculation(finalProcessedLines);
});