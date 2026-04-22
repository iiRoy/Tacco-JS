const convertStringToInteger = (inputStringValue) => {
    const parsedNumericalValue = parseInt(inputStringValue, 10);
    // Add a basic validation: if parsing fails, return 0 or throw an error.
    if (isNaN(parsedNumericalValue)) {
        // In a real application, consider more robust error handling or default values.
        console.warn(`Warning: Failed to convert "${inputStringValue}" to an integer. Defaulting to 0.`);
        return 0;
    }
    return parsedNumericalValue;
};

const parseSpaceSeparatedIntegers = (lineOfText) => {
    // Add validation for the input line.
    if (typeof lineOfText !== 'string' || lineOfText.trim().length === 0) {
        // For an empty or invalid line, return an empty array to prevent errors.
        return [];
    }
    return lineOfText.split(' ').map(convertStringToInteger);
};

// Custom implementation for finding the minimum value from a list of arguments.
// This version uses the rest parameter syntax for more modern JavaScript.
function determineSmallestValue(...numericalInputs) {
    if (numericalInputs.length === 0) {
        // Return a safe default or throw an error for empty input.
        console.warn("No arguments provided to determineSmallestValue. Returning Infinity.");
        return Infinity;
    }
    let currentMinimum = numericalInputs[0];
    for (let k = 1; k < numericalInputs.length; k++) {
        if (numericalInputs[k] < currentMinimum) {
            currentMinimum = numericalInputs[k];
        }
    }
    return currentMinimum;
}

// Custom implementation for finding the maximum value from a list of arguments.
// This version demonstrates using a for...of loop for iteration.
function determineLargestValue(...numericalInputs) {
    if (numericalInputs.length === 0) {
        console.warn("No arguments provided to determineLargestValue. Returning -Infinity.");
        return -Infinity;
    }
    let currentMaximum = numericalInputs[0];
    // Iterate over the rest of the elements starting from the second one.
    for (const singleValue of numericalInputs.slice(1)) {
        if (singleValue > currentMaximum) {
            currentMaximum = singleValue;
        }
    }
    return currentMaximum;
}

// Helper function to find the index of the maximum value within an array,
// optionally using a custom extractor function.
const findIndexOfLargestElement = (dataCollection, valueExtractor = (item) => item) => {
    if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
        return -1; // Indicate no valid index found
    }
    let maxElementValue = valueExtractor(dataCollection[0]);
    let maxElementIndex = 0;
    for (let idx = 1; idx < dataCollection.length; idx++) {
        const currentElementValue = valueExtractor(dataCollection[idx]);
        if (currentElementValue > maxElementValue) {
            maxElementValue = currentElementValue;
            maxElementIndex = idx;
        }
    }
    return maxElementIndex;
};

// Define global constants for magic numbers for better readability and maintainability.
const NUMBER_OF_ACTIVITY_TYPES = 26; // Represents A-Z categories
const INITIAL_LAST_DAY_TRACKER_VALUE = -1; // Indicates an activity has not been selected yet
const TRIPLE_DAY_BLOCK_SIZE = 3;

// The main function to process the optimization task.
function ProcessOptimizationTask(problemInputText) {
    // Split the raw input into lines and filter out any empty lines.
    const rawInputLines = problemInputText.split('\n').filter(line => line.trim() !== '');

    // Convert each line into an array of integers.
    // Ensure there's enough data before proceeding.
    if (rawInputLines.length < 3) {
        console.error("Insufficient input data provided. Expected at least 3 lines.");
        return; // Exit or throw an error
    }

    const processedData = rawInputLines.map(parseSpaceSeparatedIntegers);

    // Extract problem parameters with checks.
    const totalNumberOfDays = processedData[0] && processedData[0][0] !== undefined ? processedData[0][0] : 0;
    if (totalNumberOfDays <= 0) {
        console.error("Invalid number of days (d) provided.");
        return;
    }

    const penaltyCoefficients = processedData[1] || []; // Cost of not choosing an activity
    if (penaltyCoefficients.length !== NUMBER_OF_ACTIVITY_TYPES) {
        console.warn(`Expected ${NUMBER_OF_ACTIVITY_TYPES} penalty coefficients, got ${penaltyCoefficients.length}.`);
    }

    // Slice from index 2 onwards for the daily satisfaction matrix.
    const dailyBenefitMatrix = processedData.slice(2);
    if (dailyBenefitMatrix.length < totalNumberOfDays) {
        console.warn(`Expected benefit data for ${totalNumberOfDays} days, got ${dailyBenefitMatrix.length}.`);
    }

    let optimalSelections = []; // Stores the sequence of chosen activities (1-based index)
    // Initialize an array to track the last day each activity type was chosen.
    let previousSelectionDates = new Array(NUMBER_OF_ACTIVITY_TYPES).fill(INITIAL_LAST_DAY_TRACKER_VALUE);

    /**
     * Calculates the satisfaction delta for a given day and chosen activity type.
     * @param {number} currentDayIndex - The current day (0-indexed).
     * @param {number} selectedActivityId - The 1-based ID of the chosen activity.
     * @param {number[]} currentPreviousActivityDates - Array tracking last chosen days for each activity.
     * @param {number[][]} benefitMatrix - Matrix of daily benefits for each activity.
     * @param {number[]} penaltyFactors - Array of penalty coefficients.
     * @returns {number} The calculated satisfaction change for the day.
     */
    const calculateDailySatisfactionDelta = (
        currentDayIndex,
        selectedActivityId,
        currentPreviousActivityDates,
        benefitMatrix,
        penaltyFactors
    ) => {
        let satisfactionAccumulator = 0;
        const zeroBasedActivityIndex = selectedActivityId - 1; // Convert to 0-based for array access

        // Add the benefit for the specifically chosen activity.
        if (benefitMatrix[currentDayIndex] && benefitMatrix[currentDayIndex][zeroBasedActivityIndex] !== undefined) {
            satisfactionAccumulator += benefitMatrix[currentDayIndex][zeroBasedActivityIndex];
        } else {
            // Log an error if accessing out of bounds, indicating a potential data issue.
            console.error(`Benefit matrix access out of bounds: day ${currentDayIndex}, activity ${selectedActivityId}`);
        }

        // Subtract penalties for all other activities that were NOT chosen.
        for (let otherActivityIndex = 0; otherActivityIndex < NUMBER_OF_ACTIVITY_TYPES; otherActivityIndex++) {
            if (otherActivityIndex !== zeroBasedActivityIndex) {
                const daysSinceLastSelection = currentDayIndex - currentPreviousActivityDates[otherActivityIndex];
                // Apply penalty only if the activity was previously selected and it's been some days.
                if (daysSinceLastSelection > 0 && penaltyFactors[otherActivityIndex] !== undefined) {
                    satisfactionAccumulator -= penaltyFactors[otherActivityIndex] * daysSinceLastSelection;
                }
            }
        }
        return satisfactionAccumulator;
    };

    // Calculate how many full blocks of three days we have.
    const numberOfTripleDayBlocks = Math.floor(totalNumberOfDays / TRIPLE_DAY_BLOCK_SIZE);
    // Calculate the number of remaining days after the blocks.
    const remainingSingleDays = totalNumberOfDays % TRIPLE_DAY_BLOCK_SIZE;

    // --- Stage 1: Process days in blocks of three ---
    for (let blockIteration = 0; blockIteration < numberOfTripleDayBlocks; blockIteration++) {
        const currentBlockStartDay = blockIteration * TRIPLE_DAY_BLOCK_SIZE;
        let blockEvaluationResults = []; // Stores [choice0, choice1, choice2, total_satisfaction_for_block]

        // Iterate through all possible combinations for the three days in the current block.
        // This is a brute-force approach for small block sizes.
        for (let choiceForDay0 = 0; choiceForDay0 < NUMBER_OF_ACTIVITY_TYPES; choiceForDay0++) {
            for (let choiceForDay1 = 0; choiceForDay1 < NUMBER_OF_ACTIVITY_TYPES; choiceForDay1++) {
                for (let choiceForDay2 = 0; choiceForDay2 < NUMBER_OF_ACTIVITY_TYPES; choiceForDay2++) {

                    // For each combination, simulate the previous activity dates.
                    // Start with a fresh copy of the global previous selection dates for each triple combination.
                    let simulatedPastSelectionDates = [...previousSelectionDates];
                    let currentBlockAccumulatedSatisfaction = 0;

                    // Day 0 of the block
                    const day0GlobalIndex = currentBlockStartDay;
                    simulatedPastSelectionDates[choiceForDay0] = day0GlobalIndex;
                    currentBlockAccumulatedSatisfaction += calculateDailySatisfactionDelta(
                        day0GlobalIndex,
                        choiceForDay0 + 1, // Convert 0-based choice to 1-based activity ID
                        simulatedPastSelectionDates,
                        dailyBenefitMatrix,
                        penaltyCoefficients
                    );

                    // Day 1 of the block
                    const day1GlobalIndex = currentBlockStartDay + 1;
                    simulatedPastSelectionDates[choiceForDay1] = day1GlobalIndex;
                    currentBlockAccumulatedSatisfaction += calculateDailySatisfactionDelta(
                        day1GlobalIndex,
                        choiceForDay1 + 1,
                        simulatedPastSelectionDates,
                        dailyBenefitMatrix,
                        penaltyCoefficients
                    );

                    // Day 2 of the block
                    const day2GlobalIndex = currentBlockStartDay + 2;
                    simulatedPastSelectionDates[choiceForDay2] = day2GlobalIndex;
                    currentBlockAccumulatedSatisfaction += calculateDailySatisfactionDelta(
                        day2GlobalIndex,
                        choiceForDay2 + 1,
                        simulatedPastSelectionDates,
                        dailyBenefitMatrix,
                        penaltyCoefficients
                    );

                    // Store the combination and its total satisfaction.
                    blockEvaluationResults.push([choiceForDay0, choiceForDay1, choiceForDay2, currentBlockAccumulatedSatisfaction]);
                }
            }
        }

        // Find the combination that yielded the maximum satisfaction for this block.
        if (blockEvaluationResults.length === 0) {
            console.error(`Error: No evaluation results for block starting at day ${currentBlockStartDay}.`);
            continue; // Skip to the next block or handle error appropriately.
        }

        const bestOptionIndexInResults = findIndexOfLargestElement(blockEvaluationResults, (entry) => entry[3]);
        const bestBlockChoices = blockEvaluationResults[bestOptionIndexInResults];

        if (!bestBlockChoices) {
            console.error(`Failed to retrieve best block choices for block starting at day ${currentBlockStartDay}.`);
            continue;
        }

        // Extract the best choices and add them to the overall optimal sequence.
        const [chosenActivity0, chosenActivity1, chosenActivity2] = bestBlockChoices;
        optimalSelections.push(chosenActivity0 + 1, chosenActivity1 + 1, chosenActivity2 + 1);

        // Update the global previous selection dates based on the best choices made for this block.
        previousSelectionDates[chosenActivity0] = currentBlockStartDay;
        previousSelectionDates[chosenActivity1] = currentBlockStartDay + 1;
        previousSelectionDates[chosenActivity2] = currentBlockStartDay + 2;
    }

    // --- Stage 2: Process any remaining days individually ---
    const startDayForRemaining = numberOfTripleDayBlocks * TRIPLE_DAY_BLOCK_SIZE;
    for (let dayIndex = startDayForRemaining; dayIndex < totalNumberOfDays; dayIndex++) {
        let dailyOptionEvaluations = []; // Stores satisfaction for each single activity choice for the current day

        // Evaluate each possible activity choice for the current day.
        for (let activityCandidate = 0; activityCandidate < NUMBER_OF_ACTIVITY_TYPES; activityCandidate++) {
            // Create a temporary copy of previous dates to simulate the choice for this specific day.
            let simulatedPastDatesForDay = [...previousSelectionDates];
            simulatedPastDatesForDay[activityCandidate] = dayIndex;

            const currentDaySatisfaction = calculateDailySatisfactionDelta(
                dayIndex,
                activityCandidate + 1,
                simulatedPastDatesForDay,
                dailyBenefitMatrix,
                penaltyCoefficients
            );
            dailyOptionEvaluations.push(currentDaySatisfaction);
        }

        // Find the activity that yields the maximum satisfaction for this single day.
        if (dailyOptionEvaluations.length === 0) {
            console.error(`Error: No options evaluated for day ${dayIndex}.`);
            optimalSelections.push(1); // Default to activity 1 to avoid breaking output
            continue;
        }

        const bestDailyActivityIndex = findIndexOfLargestElement(dailyOptionEvaluations);
        const selectedActivityId = bestDailyActivityIndex + 1; // Convert 0-based index to 1-based ID

        optimalSelections.push(selectedActivityId);
        // Update the global tracker for the last day this activity was selected.
        previousSelectionDates[bestDailyActivityIndex] = dayIndex;
    }

    // Output the final sequence of optimal selections.
    console.log(optimalSelections.join('\n'));
}

// Entry point: Read input from stdin and execute the main processing function.
// This block ensures the code runs when executed directly.
(function executeMain() {
    try {
        const fileSystem = require("fs");
        const programInput = fileSystem.readFileSync("/dev/stdin", "utf8");
        ProcessOptimizationTask(programInput);
    } catch (error) {
        console.error("An error occurred during input reading or processing:", error);
    }
})();