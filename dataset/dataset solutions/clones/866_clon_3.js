const fileSystemUtil = require('fs');

/**
 * Reads all content from standard input synchronously and decodes it as UTF-8.
 * @returns {string} The content read from stdin.
 */
function readStandardInputContent() {
    // File descriptor 0 typically refers to stdin.
    // Using readFileSync for simplicity, assuming input size is manageable.
    try {
        return fileSystemUtil.readFileSync(0, 'utf8');
    } catch (error) {
        console.error("Failed to read from standard input:", error.message);
        return ''; // Return empty string on error
    }
}

/**
 * Safely converts a string to a number, logging an error if conversion fails.
 * @param {string} inputString - The string to convert.
 * @param {string} context - A description of what the number represents for error logging.
 * @returns {number} The parsed number, or NaN if parsing failed.
 */
function parseNumericValue(inputString, context = 'value') {
    const value = Number(inputString);
    if (isNaN(value)) {
        console.error(`Warning: Could not parse ${context} from "${inputString}".`);
    }
    return value;
}

/**
 * Creates and initializes a 2D array (matrix) of specified dimensions with a given value.
 * @param {number} numRows - The number of rows in the matrix.
 * @param {number} numCols - The number of columns in each row.
 * @param {*} initialCellValue - The value to initialize each element with.
 * @returns {Array<Array<*>>} A newly constructed 2D array.
 */
function initialize2DArray(numRows, numCols, initialCellValue) {
    // Basic validation for array dimensions.
    if (numRows <= 0 || numCols <= 0) {
        // Return an empty array or throw an error for invalid dimensions based on strictness.
        // For this problem, dimensions are expected to be positive.
        return [];
    }

    const twoDimensionalCollection = [];
    // Populate rows.
    for (let currentRowsIndex = 0; currentRowsIndex < numRows; currentRowsIndex++) {
        // Create and fill each row.
        const currentRow = Array(numCols).fill(initialCellValue);
        twoDimensionalCollection.push(currentRow);
    }
    return twoDimensionalCollection;
}

/**
 * Calculates the maximum achievable score for a given target duration
 * using a collection of available musical segments. This employs a dynamic programming approach.
 * @param {number} targetTotalDuration - The overall duration to aim for.
 * @param {Array<Array<number>>} segmentDefinitions - A list of segments, each defined by [start_time, length, points].
 * @returns {number} The maximum accumulated score, or 0 if no combination yields points.
 */
function calculateMaxScore(targetTotalDuration, segmentDefinitions) {
    // Guard clause for invalid target duration.
    if (targetTotalDuration <= 0) {
        return 0;
    }
    // Guard clause for empty or invalid segment definitions.
    if (!segmentDefinitions || segmentDefinitions.length === 0) {
        return 0;
    }

    const numberOfSegments = segmentDefinitions.length;
    // DP table: dynamicProgressionMatrix[i][j] stores max score using first 'i' segments for duration 'j'.
    const dynamicProgressionMatrix = initialize2DArray(numberOfSegments + 1, targetTotalDuration + 1, 0);

    // Iterate through each segment available for consideration.
    for (let segmentIndex = 0; segmentIndex < numberOfSegments; segmentIndex++) {
        // Iterate through all possible durations up to the target.
        for (let currentCombinedDuration = 0; currentCombinedDuration <= targetTotalDuration; currentCombinedDuration++) {
            // Extract properties of the current segment using array destructuring.
            const [segmentStartTime, segmentSpanLength, segmentAwardPoints] = segmentDefinitions[segmentIndex];

            // Check if the current segment's start time can fit within the current combined duration.
            if (segmentStartTime <= currentCombinedDuration) {
                // Determine the range of previous durations that could precede this segment.
                // The lower bound for a preceding duration is (currentCombinedDuration - segmentSpanLength).
                // It cannot be less than 0.
                const precedingDurationLowerBound = Math.max(0, currentCombinedDuration - segmentSpanLength);
                // The upper bound for a preceding duration is (currentCombinedDuration - segmentStartTime).
                const precedingDurationUpperBound = currentCombinedDuration - segmentStartTime;

                // Extract a slice of scores from the previous row of the DP table.
                // These represent the maximum scores achievable for the relevant preceding durations.
                const scoresFromPreviousStates = dynamicProgressionMatrix[segmentIndex].slice(
                    precedingDurationLowerBound,
                    precedingDurationUpperBound + 1
                );

                let scoreIfUsingCurrentSegment = -Infinity; // Represents an unachievable state initially.
                // If there are valid previous states to build upon, calculate the maximum score.
                if (scoresFromPreviousStates.length > 0) {
                    scoreIfUsingCurrentSegment = Math.max(...scoresFromPreviousStates) + segmentAwardPoints;
                }

                // The current cell's score is the maximum of two possibilities:
                // 1. Not using the current segment (value from the cell directly above).
                // 2. Using the current segment (scoreIfUsingCurrentSegment).
                dynamicProgressionMatrix[segmentIndex + 1][currentCombinedDuration] = Math.max(
                    dynamicProgressionMatrix[segmentIndex][currentCombinedDuration],
                    scoreIfUsingCurrentSegment
                );
            } else {
                // If the segment's start time is too late for the current duration,
                // this segment cannot be used. The score remains the same as if it wasn't considered.
                dynamicProgressionMatrix[segmentIndex + 1][currentCombinedDuration] = dynamicProgressionMatrix[segmentIndex][currentCombinedDuration];
            }
        }
    }
    // The final answer is located at the bottom-right corner of the DP table.
    return dynamicProgressionMatrix[numberOfSegments][targetTotalDuration];
}

/**
 * Main function to orchestrate the program flow: input reading, processing, and result output.
 */
function orchestrateProcessing() {
    // Read all input and split into lines. Filter out any empty lines.
    const allInputContent = readStandardInputContent();
    const inputLinesQueue = allInputContent.split('\n').filter(line => line.trim() !== '');

    // Read the total number of segments.
    const totalSegmentsQuantity = parseNumericValue(inputLinesQueue.shift(), 'total segments quantity');
    if (isNaN(totalSegmentsQuantity) || totalSegmentsQuantity < 0) {
        console.error("Error: Invalid or missing total segments quantity. Exiting.");
        return;
    }

    const musicalSegmentData = [];
    // Populate the list of musical segment definitions.
    for (let segmentCounter = 0; segmentCounter < totalSegmentsQuantity; segmentCounter++) {
        const currentSegmentLine = inputLinesQueue.shift();
        if (!currentSegmentLine) {
            console.error(`Error: Expected ${totalSegmentsQuantity} segment definitions, but ran out of input after ${segmentCounter}.`);
            break;
        }
        const segmentDetails = currentSegmentLine.split(' ').map(s => parseNumericValue(s, `segment detail for line "${currentSegmentLine}"`));

        // Validate segment details: must have 3 numbers and no NaNs.
        if (segmentDetails.length === 3 && !segmentDetails.some(isNaN)) {
            musicalSegmentData.push(segmentDetails);
        } else {
            console.error(`Warning: Skipping malformed segment definition: "${currentSegmentLine}".`);
        }
    }

    // Read the number of melodies to evaluate.
    const numberOfMelodiesToProcess = parseNumericValue(inputLinesQueue.shift(), 'number of melodies to process');
    if (isNaN(numberOfMelodiesToProcess) || numberOfMelodiesToProcess < 0) {
        console.error("Error: Invalid or missing number of melodies to process. Exiting.");
        return;
    }

    const melodyTargetDurations = [];
    // Populate the list of target durations for each melody.
    for (let melodyCounter = 0; melodyCounter < numberOfMelodiesToProcess; melodyCounter++) {
        const currentMelodyDurationLine = inputLinesQueue.shift();
        if (!currentMelodyDurationLine) {
            console.error(`Error: Expected ${numberOfMelodiesToProcess} melody durations, but ran out of input after ${melodyCounter}.`);
            break;
        }
        const durationValue = parseNumericValue(currentMelodyDurationLine, `melody duration for line "${currentMelodyDurationLine}"`);
        if (!isNaN(durationValue)) {
            melodyTargetDurations.push(durationValue);
        } else {
            console.error(`Warning: Skipping invalid melody duration: "${currentMelodyDurationLine}".`);
        }
    }

    const computedFinalScores = [];
    let anyMelodyResultedInZeroScore = false;

    // Process each target melody duration.
    for (const individualMelodyTarget of melodyTargetDurations) {
        // If the target duration is not positive, it cannot yield any meaningful score.
        if (individualMelodyTarget <= 0) {
            computedFinalScores.push(0); // Or handle as an error/special case if required.
            anyMelodyResultedInZeroScore = true; // Consistent with original logic if 0 means 'invalid'
            continue;
        }

        // Invoke the dynamic programming solver.
        const currentCalculatedMaxScore = calculateMaxScore(individualMelodyTarget, musicalSegmentData);

        // If a melody results in a 0 score, it indicates it cannot be achieved
        // with the given segments, and the problem asks for -1 in such cases.
        if (currentCalculatedMaxScore === 0) {
            anyMelodyResultedInZeroScore = true;
        }
        computedFinalScores.push(currentCalculatedMaxScore);
    }

    // Output the results based on whether any melody was unachievable (score of 0).
    if (anyMelodyResultedInZeroScore) {
        console.log(-1);
    } else {
        // If all melodies yielded a non-zero score, print each score individually.
        for (const scoreOutput of computedFinalScores) {
            console.log(scoreOutput);
        }
    }
}

// Initiate the program execution.
orchestrateProcessing();