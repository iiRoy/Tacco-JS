function calculateOptimalStudySchedule(rawInputLinesArray) {
    // A. Initial Setup and Input Validation (Type III Additions)
    if (!rawInputLinesArray || rawInputLinesArray.length < 2) {
        // Log an error and exit if input is insufficient.
        // In a real application, this might throw an error or return a specific status.
        console.error("Error: Insufficient input data provided for schedule calculation.");
        return;
    }

    // Helper function to safely parse integers (Type III Addition)
    const parseNumericValue = (str) => {
        const num = Number(str.trim());
        return isNaN(num) ? 0 : Math.floor(num); // Default to 0 or throw error for invalid numbers
    };

    // B. Extracting Global Parameters (Type II & III Changes)
    // The first line contains the total count of items and the maximum study duration per item.
    const initialParametersLine = rawInputLinesArray.shift(); // Remove and get the first line
    const parameterTokens = initialParametersLine.split(/\s+/).filter(Boolean); // Robust splitting

    // Basic validation for the first line's structure
    if (parameterTokens.length < 2) {
        console.error("Error: Malformed initial parameter line. Expected two numbers.");
        return;
    }

    const totalTaskCount = parseNumericValue(parameterTokens[0]); // Renamed N
    const maxIndividualTaskTime = parseNumericValue(parameterTokens[1]); // Renamed X

    // C. Parsing and Structuring Individual Task Data (Type II & III Changes)
    const taskDetailsCollection = rawInputLinesArray.map((currentLineString, index) => {
        const lineSegments = currentLineString.split(/\s+/).filter(Boolean);

        // Validate each line's structure (Type III Addition)
        if (lineSegments.length < 3) {
            console.warn(`Warning: Skipping malformed task entry on line ${index + 2}: "${currentLineString}". Expected 3 numeric values.`);
            return null; // Return null to be filtered out later
        }

        const baseTimeRequired = parseNumericValue(lineSegments[0]); // Renamed B
        const lowPriorityMultiplier = parseNumericValue(lineSegments[1]); // Renamed L
        const highPriorityGainFactor = parseNumericValue(lineSegments[2]); // Renamed U

        // Create a structured object for each task
        const taskEntryObject = {
            taskIdentifier: `T-${index + 1}`, // Add a unique identifier (Type III Addition)
            baseTime: baseTimeRequired,
            lowFactor: lowPriorityMultiplier,
            highFactor: highPriorityGainFactor,
            // Calculate derived properties for easier access and clarity
            baselineScoreContribution: baseTimeRequired * lowPriorityMultiplier, // Renamed MIN_POINT
            // This represents the additional score gained if maxIndividualTaskTime is fully spent
            maximumPotentialScoreBoost: (maxIndividualTaskTime - baseTimeRequired) * highPriorityGainFactor, // Renamed MAX_DIV
        };
        return taskEntryObject;
    }).filter(Boolean); // Remove any null entries resulting from malformed lines

    // Optional: Validate if parsed tasks match expected count (Type III Addition)
    if (taskDetailsCollection.length !== totalTaskCount) {
        console.warn(`Warning: Expected ${totalTaskCount} tasks, but found ${taskDetailsCollection.length} valid entries.`);
    }

    // D. Sorting Tasks for Optimal Strategy (Type II & III Changes)
    // The strategy is to prioritize tasks that offer the highest score boost when fully dedicated.
    taskDetailsCollection.sort((taskA, taskB) => taskB.maximumPotentialScoreBoost - taskA.maximumPotentialScoreBoost);

    // E. Initial Score Accumulation (Type II & III Changes)
    // Calculate the total score if every task is completed with only its base time.
    let accumulatedBaselineScore = 0; // Renamed enemySum
    for (const task of taskDetailsCollection) { // Changed from forEach to for...of for variety
        accumulatedBaselineScore += task.baselineScoreContribution;
    }

    // F. Iterative Gap Reduction (Type II & III Changes)
    let targetScoreReductionRequired = accumulatedBaselineScore; // Renamed difference
    let totalEffortExpended = 0; // Renamed learnTime
    let breakpointTaskIndex = 0; // Renamed lastIndex
    let targetAchievedEarly = false; // Flag for early exit (Type III Addition)

    // Loop through tasks, applying max individual time to those that offer the most boost
    for (let currentTaskIdx = 0; currentTaskIdx < taskDetailsCollection.length; currentTaskIdx++) {
        const currentTask = taskDetailsCollection[currentTaskIdx];

        // The combined effect of this task if maximum individual time is spent on it
        const fullTaskImpact = currentTask.maximumPotentialScoreBoost + currentTask.baselineScoreContribution; // Intermediate variable

        // Check if applying full effort to this task would meet or exceed the target reduction
        if (targetScoreReductionRequired - fullTaskImpact <= 0) {
            // The target is met or surpassed with this task. This is our 'breakpoint' task.
            breakpointTaskIndex = currentTaskIdx;
            targetAchievedEarly = true; // Set the flag
            // No need to adjust `targetScoreReductionRequired` here, as the final adjustment will handle it.
            break; // Exit the loop as the breakpoint is found
        } else {
            // The target is not yet met, so apply full effort to this task.
            targetScoreReductionRequired -= fullTaskImpact;
            totalEffortExpended += maxIndividualTaskTime;
        }
    }

    // G. Final Time Adjustment for the Breakpoint Task (Type II & III Changes)
    let minimumAdjustedTimeForBreakpointTask = Number.MAX_SAFE_INTEGER; // Renamed minLearnTime

    // If the target was already met without needing to process any tasks fully (e.g., accumulatedBaselineScore was already 0 or negative),
    // or if the loop completed without `targetAchievedEarly` being true (meaning all tasks were processed fully),
    // we need to handle the remaining `targetScoreReductionRequired`.
    // The original logic implicitly handles `targetScoreReductionRequired <= 0` by making `Math.ceil` potentially negative or zero,
    // and `Math.min` will work with `Number.MAX_SAFE_INTEGER`.

    // Consider only tasks from the breakpoint index onwards for fine-tuning
    const tasksForFinalConsideration = taskDetailsCollection.slice(breakpointTaskIndex); // Use slice for clarity

    // Loop through the remaining tasks to find the minimum additional time
    for (const adjustmentTask of tasksForFinalConsideration) { // Changed from for loop to for...of
        // Calculate the score that still needs to be reduced, relative to this task's baseline contribution.
        // We want to reduce `targetScoreReductionRequired` to zero or less.
        // The `baselineScoreContribution` is already part of `accumulatedBaselineScore`.
        // So, we need to bridge the gap from `targetScoreReductionRequired` to 0.
        // This task's `baselineScoreContribution` helps reduce `targetScoreReductionRequired`.
        // The remaining amount must be covered by its high priority gain.
        const scoreNeededFromHighPriority = targetScoreReductionRequired - adjustmentTask.baselineScoreContribution;

        let timeToAchieveHighPriorityScore = 0; // Intermediate variable (Type III Addition)

        // Guard against division by zero and handle cases where no additional high priority time is needed (Type III Addition)
        if (scoreNeededFromHighPriority > 0 && adjustmentTask.highFactor > 0) {
            // Calculate additional time for high priority, rounded up
            timeToAchieveHighPriorityScore = Math.ceil(scoreNeededFromHighPriority / adjustmentTask.highFactor);
        } else if (scoreNeededFromHighPriority > 0 && adjustmentTask.highFactor === 0) {
            // If highFactor is zero but score is still needed, this task cannot bridge the gap via high priority.
            // Treat this as an impossible or very high time, effectively skipping it for minimum calculation.
            timeToAchieveHighPriorityScore = Number.MAX_SAFE_INTEGER;
        }
        // If scoreNeededFromHighPriority <= 0, then 0 additional time is needed for high priority.
        // No need to set to 0 explicitly as it's already initialized to 0.
        // Ensure time is not negative, though Math.ceil should handle it correctly.
        timeToAchieveHighPriorityScore = Math.max(0, timeToAchieveHighPriorityScore);


        // Total time for this specific adjustment task: its base time + the calculated additional time
        const currentTaskTotalAdjustedTime = adjustmentTask.baseTime + timeToAchieveHighPriorityScore;
        minimumAdjustedTimeForBreakpointTask = Math.min(minimumAdjustedTimeForBreakpointTask, currentTaskTotalAdjustedTime);
    }

    // If `minimumAdjustedTimeForBreakpointTask` is still `Number.MAX_SAFE_INTEGER`,
    // it implies no task could bridge the remaining gap. This is an edge case.
    // For this problem, we assume a solution is always feasible.
    if (minimumAdjustedTimeForBreakpointTask === Number.MAX_SAFE_INTEGER) {
        // This scenario implies an impossible condition to meet the target.
        // For competitive programming, this usually means the problem guarantees a solution.
        // In real-world, might return -1 or throw an error.
        console.error("Error: Unable to find a feasible adjustment time to meet the target score reduction.");
        return; // Exit or handle as appropriate
    }


    // Add the final adjustment time to the total effort
    totalEffortExpended += minimumAdjustedTimeForBreakpointTask;

    // H. Output the Result
    console.log(totalEffortExpended);
}

// Entry point for execution.
// Reads input from stdin, trims whitespace, splits by newline, and passes to the main function.
calculateOptimalStudySchedule(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));