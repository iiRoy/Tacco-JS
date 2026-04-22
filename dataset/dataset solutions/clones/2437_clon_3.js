const calculateOptimalBenefit = (rawDataStr) => {
    // This function determines the maximum benefit achievable under specific conditions
    // from a list of activities, using a dynamic programming approach.
    // It considers a unique rule where one activity's duration can be ignored.

    // 1. Input Processing and Initial Validation
    // ------------------------------------------
    // Normalize the raw input string by trimming whitespace and splitting it into individual lines.
    const inputLines = rawDataStr.trim().split('\n');

    // Extract the problem's primary parameters from the first line:
    // 'numActivities' represents the total count of available activities.
    // 'maxTimeLimit' defines the maximum capacity or time duration allowed.
    const [activitiesCountStr, timeLimitStr] = inputLines[0].split(' ');
    const numActivities = parseInt(activitiesCountStr, 10);
    const maxTimeLimit = parseInt(timeLimitStr, 10);

    // Implement robust validation for the primary input parameters.
    // If the numbers are not valid integers or are negative, or if there's no capacity,
    // it's impossible to gain any benefit, so return 0 immediately.
    if (isNaN(numActivities) || isNaN(maxTimeLimit) || numActivities < 0 || maxTimeLimit < 0) {
        return 0; // Invalid input, no benefit.
    }
    if (numActivities === 0 || maxTimeLimit === 0) {
        return 0; // No activities or no time limit, no benefit.
    }

    // 2. Activity Data Preparation
    // ----------------------------
    // Parse the subsequent lines to build a list of activities.
    // Each activity consists of a 'duration' (time required) and a 'worth' (value gained).
    // We slice the inputLines array to skip the first line (N, T) and only process activity data.
    const activityRecords = inputLines.slice(1, numActivities + 1).map(line => {
        const [durationValueStr, worthValueStr] = line.split(' ');
        const duration = parseInt(durationValueStr, 10);
        const worth = parseInt(worthValueStr, 10);

        // Validate individual activity data. If an activity has invalid numbers,
        // treat it as having zero duration and zero worth to prevent errors.
        if (isNaN(duration) || isNaN(worth) || duration < 0 || worth < 0) {
            // A non-essential fragment: a warning for malformed input lines.
            console.warn(`Warning: Invalid activity data encountered, treating as [0, 0]. Line: ${line}`);
            return [0, 0];
        }
        return [duration, worth];
    });

    // Crucially, sort the activities based on their duration in ascending order.
    // This sorting step is essential for the specific logic of the original DP.
    activityRecords.sort((activityA, activityB) => activityA[0] - activityB[0]);

    // 3. Dynamic Programming Table Initialization
    // ------------------------------------------
    // Create a 2D DP table to store calculated maximum benefits.
    // The table dimensions are (numActivities + 1) rows and 'maxTimeLimit' columns.
    // Each cell `dpTable[i][j]` will store an array of two values:
    //   - `dpTable[i][j][0]`: Maximum benefit using the first `i` activities with time `j`,
    //                         where ALL activities consume their respective durations.
    //   - `dpTable[i][j][1]`: Maximum benefit using the first `i` activities with time `j`,
    //                         where EXACTLY ONE activity (among the first `i`) has its duration ignored (it's "free").
    // Initialize all entries to [0, 0].
    const dpTable = Array(numActivities + 1).fill(null).map(() =>
        Array(maxTimeLimit).fill(null).map(() => [0, 0])
    );

    // 4. Populate the Dynamic Programming Table
    // -----------------------------------------
    // Iterate through each activity, from the first to the last.
    for (let currentActivityIdx = 0; currentActivityIdx < numActivities; currentActivityIdx++) {
        const [activityDuration, activityWorth] = activityRecords[currentActivityIdx];

        // Iterate through each possible time slot (capacity) from 0 up to maxTimeLimit - 1.
        for (let currentTimeSlot = 0; currentTimeSlot < maxTimeLimit; currentTimeSlot++) {
            // Helper variables to reference previous DP states, enhancing readability.
            const prevNormalMax = dpTable[currentActivityIdx][currentTimeSlot][0];
            const prevFreeMax = dpTable[currentActivityIdx][currentTimeSlot][1];

            // --- Calculate the 'Normal Case' (dpTable[currentActivityIdx + 1][currentTimeSlot][0]) ---
            // This path considers benefits where all taken activities consume their time.
            let currentNormalBenefit = prevNormalMax; // Option 1: Don't include the current activity.
                                                      // The benefit remains the same as without it.

            // Option 2: Include the current activity if there's enough time left.
            // Add its worth to the max benefit from the previous state with reduced time.
            if (currentTimeSlot >= activityDuration) {
                const remainingTimeAfterTaking = currentTimeSlot - activityDuration;
                const benefitIfCurrentTakenNormally = dpTable[currentActivityIdx][remainingTimeAfterTaking][0] + activityWorth;
                currentNormalBenefit = Math.max(currentNormalBenefit, benefitIfCurrentTakenNormally);
            }
            // Store the maximum benefit for the normal case.
            dpTable[currentActivityIdx + 1][currentTimeSlot][0] = currentNormalBenefit;

            // --- Calculate the 'One Free Item Case' (dpTable[currentActivityIdx + 1][currentTimeSlot][1]) ---
            // This path considers benefits where exactly one activity has its duration ignored.
            let currentFreeBenefit = prevFreeMax; // Option 1: The "free" activity was one of the previous ones.
                                                  // So, the current activity is either not taken, or taken normally
                                                  // (but this state has already accounted for a free item from before).

            // Option 2: Designate the CURRENT activity as the "free" one.
            // Its worth is added to the max benefit achieved from previous activities,
            // assuming all of them consumed their time (hence, we use prevNormalMax).
            // The current activity consumes NO time.
            const benefitIfCurrentIsDesignatedFree = prevNormalMax + activityWorth;
            currentFreeBenefit = Math.max(currentFreeBenefit, benefitIfCurrentIsDesignatedFree);
            // Store the maximum benefit for the one-free-item case.
            dpTable[currentActivityIdx + 1][currentTimeSlot][1] = currentFreeBenefit;
        }
    }

    // 5. Final Result Retrieval
    // -------------------------
    // The ultimate answer is found in the DP table:
    // `dpTable[numActivities][maxTimeLimit - 1][1]`
    // This represents the maximum benefit considering all `numActivities`,
    // up to the maximum available time slot (`maxTimeLimit - 1`),
    // and with the special rule applied (exactly one activity had its duration ignored).
    return dpTable[numActivities][maxTimeLimit - 1][1];
};

// Entry point for execution in a typical competitive programming environment.
// Reads all input from standard input and then calls the main processing function.
// The result is then printed to standard output.
const standardInputPayload = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(calculateOptimalBenefit(standardInputPayload));