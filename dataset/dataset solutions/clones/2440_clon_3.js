function processInputData(rawDataContent) {
    // Expert's Note: This function computes the maximum possible benefit
    // from a set of activities within a given time capacity.
    // It employs a dynamic programming approach, with a special consideration
    // for the last activity in the sorted list.

    // --- Phase 1: Input Parsing and Initial Validation ---
    // Remove leading/trailing whitespace and split the raw input into individual lines.
    const dataLines = rawDataContent.trim().split('\n');

    // If no data lines are provided, there's nothing to process.
    if (dataLines.length === 0) {
        console.log(0);
        return;
    }

    // A helper utility to parse numeric values from a string array.
    const parseNumericArray = (strArr) => strArr.map(Number);

    // Process the first line to extract configuration parameters: item count and time limit.
    const configNumbers = parseNumericArray(dataLines[0].split(' '));

    // Ensure the configuration line has exactly two valid numbers.
    if (configNumbers.length !== 2 || configNumbers.some(isNaN)) {
        console.error("Error: Invalid configuration line. Expected two numbers (item count, time limit).");
        return;
    }

    const totalActivities = configNumbers[0]; // Corresponds to 'N' in original
    const timeCapacityLimit = configNumbers[1]; // Corresponds to 'T' in original

    // Basic validation for the extracted parameters.
    if (totalActivities <= 0 || timeCapacityLimit <= 0) {
        console.log(0); // If no activities or no capacity, the maximum benefit is 0.
        return;
    }

    // --- Phase 2: Activity Data Preparation ---
    // Store activity details (duration and benefit) in a structured array.
    const activitySchedule = [];
    const START_DATA_LINE_INDEX = 1; // Activity data starts from the second line (index 1).

    for (let currentActivityIndex = 0; currentActivityIndex < totalActivities; currentActivityIndex++) {
        const lineIndex = START_DATA_LINE_INDEX + currentActivityIndex;
        if (lineIndex >= dataLines.length) {
            console.error(`Error: Missing activity data for activity number ${currentActivityIndex + 1}.`);
            return;
        }

        const activityNumericValues = parseNumericArray(dataLines[lineIndex].split(' '));

        // Validate each activity's data format.
        if (activityNumericValues.length !== 2 || activityNumericValues.some(isNaN)) {
            console.error(`Error: Invalid activity data format on line ${lineIndex + 1}. Expected two numbers (duration, benefit).`);
            return;
        }

        activitySchedule.push({
            duration: activityNumericValues[0], // 'A' value in original
            benefit: activityNumericValues[1]   // 'B' value in original
        });
    }

    // Sort the activities based on their benefit in ascending order.
    // This sorting strategy is crucial for the problem's specific solution logic.
    activitySchedule.sort((firstActivity, secondActivity) => firstActivity.benefit - secondActivity.benefit);

    // --- Phase 3: Dynamic Programming Table Construction ---
    // Initialize a 2D array (memoization table) to store maximum benefits.
    // 'valueCache[i][j]' will store the max benefit using the first 'i' activities
    // with a total time capacity of 'j'.
    // The table size is `totalActivities` rows (for 0 to totalActivities-1 items)
    // and `timeCapacityLimit + 1` columns (for capacities 0 to timeCapacityLimit).
    const valueCache = Array(totalActivities);

    // The first row (index 0) represents considering zero activities.
    // In this case, the benefit is always 0, regardless of capacity.
    valueCache[0] = Array(timeCapacityLimit + 1).fill(0);

    // Fill the DP table for the first `totalActivities - 1` items.
    // The loop iterates from the first activity (index 0) up to the second-to-last activity
    // (index `totalActivities - 2`).
    for (let itemOrdinal = 0; itemOrdinal < totalActivities - 1; itemOrdinal++) {
        // Initialize the current row for the `itemOrdinal + 1`-th activity.
        valueCache[itemOrdinal + 1] = Array(timeCapacityLimit + 1);

        const currentActivity = activitySchedule[itemOrdinal];
        const activityDuration = currentActivity.duration;
        const activityBenefit = currentActivity.benefit;

        // Iterate through all possible time capacities for the current activity.
        for (let currentCapacitySlot = 0; currentCapacitySlot <= timeCapacityLimit; currentCapacitySlot++) {
            // Option 1: Do NOT include the current activity.
            // The maximum benefit is carried over from the previous set of activities
            // at the same capacity.
            const benefitIfSkipped = valueCache[itemOrdinal][currentCapacitySlot];

            // Option 2: Potentially INCLUDE the current activity.
            // This is possible only if the current capacity slot is sufficient for its duration.
            if (activityDuration <= currentCapacitySlot) {
                // Calculate the benefit if this activity is included:
                // Benefit from previous activities with remaining capacity + current activity's benefit.
                const benefitIfTaken = valueCache[itemOrdinal][currentCapacitySlot - activityDuration] + activityBenefit;
                // Take the maximum of skipping or taking the activity.
                valueCache[itemOrdinal + 1][currentCapacitySlot] = Math.max(benefitIfSkipped, benefitIfTaken);
            } else {
                // If duration exceeds current capacity, the activity cannot be taken.
                // So, only the 'skipped' option is valid.
                valueCache[itemOrdinal + 1][currentCapacitySlot] = benefitIfSkipped;
            }
        }
    }

    // --- Phase 4: Final Result Calculation with Special Last Activity Handling ---
    // The original problem statement dictates a special rule for the very last activity
    // (which is `activitySchedule[totalActivities - 1]` after sorting).
    // The final answer is the maximum of two scenarios:

    // Scenario A: The last activity is NOT included.
    // In this case, the maximum benefit is simply what was achieved using the first
    // `totalActivities - 1` activities within the full `timeCapacityLimit`.
    const maxBenefitExcludingLastActivity = valueCache[totalActivities - 1][timeCapacityLimit];

    // Scenario B: The last activity IS included, but it has a specific cost rule.
    // It consumes 1 unit of time capacity, regardless of its actual 'duration' property,
    // and provides its 'benefit'.
    const lastActivityConsidered = activitySchedule[totalActivities - 1];
    const lastActivityActualBenefit = lastActivityConsidered.benefit;

    let maxBenefitIncludingSpecialLastActivity = 0;
    // We can only consider this scenario if there's at least 1 unit of capacity for it.
    if (timeCapacityLimit > 0) {
        // The benefit is derived from the first `totalActivities - 1` activities
        // with `timeCapacityLimit - 1` capacity, plus the benefit of the last activity.
        maxBenefitIncludingSpecialLastActivity = valueCache[totalActivities - 1][timeCapacityLimit - 1] + lastActivityActualBenefit;
    }
    // If timeCapacityLimit is 0, this scenario cannot yield any positive benefit, so it remains 0.

    // The ultimate maximum benefit is the greater of these two scenarios.
    const overallOptimalBenefit = Math.max(maxBenefitExcludingLastActivity, maxBenefitIncludingSpecialLastActivity);

    console.log(overallOptimalBenefit);
}

// --- Execution Entry Point ---
// Read input from standard input using Node.js file system module.
const fileSystemInterface = require("fs");
const programInputString = fileSystemInterface.readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the obtained input.
processInputData(programInputString);