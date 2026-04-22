function AnalyzeSubmissionOutcomes(rawInputData) {
    // Defensive check: Ensure input data is provided and is a non-empty string.
    if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === '') {
        console.error("Input processing halted: No valid raw data provided for analysis.");
        return; // Exit the function if input is invalid.
    }

    // Transform the monolithic input string into an array of distinct lines.
    const processedLinesArray = rawInputData.split("\n");

    // Establish the collection of expected outcome categories for this contest.
    const standardOutcomeCategories = ["AC", "WA", "TLE", "RE"];

    // Initialize a tallying object to store the counts for each outcome.
    // All standard categories are pre-initialized to ensure they always appear in the output.
    let outcomeTallies = {};
    standardOutcomeCategories.forEach(categoryKey => {
        outcomeTallies[categoryKey] = 0; // Set initial count for each category to zero.
    });

    // Parse the first line to determine the total number of submission entries expected.
    // Use parseInt with a radix for robustness, defaulting to 0 if parsing fails.
    const expectedSubmissionCount = parseInt(processedLinesArray[0] || '0', 10);

    // Validate the parsed submission count. It must be a non-negative integer.
    if (isNaN(expectedSubmissionCount) || expectedSubmissionCount < 0) {
        console.error("Input parsing error: The specified number of submissions is invalid.");
        return;
    }

    // Issue a warning if the actual number of data lines is less than expected.
    // The first line is the count, so we compare `processedLinesArray.length - 1` to `expectedSubmissionCount`.
    if (processedLinesArray.length - 1 < expectedSubmissionCount) {
        console.warn(`Data anomaly: Expected ${expectedSubmissionCount} result entries, but only ${processedLinesArray.length - 1} were found.`);
    }

    // Iterate through the submission result lines, starting from the second line (index 1).
    // The loop runs up to the expected number of submissions.
    for (let currentResultLineIdx = 1; currentResultLineIdx <= expectedSubmissionCount; currentResultLineIdx++) {
        // Skip processing if we've run out of actual input lines prematurely.
        if (currentResultLineIdx >= processedLinesArray.length) {
            console.warn(`Skipping analysis for submission #${currentResultLineIdx} due to insufficient input data.`);
            continue; // Move to the next iteration if the line is missing.
        }

        // Extract the outcome identifier from the current line, removing any leading/trailing whitespace.
        let specificSubmissionOutcome = processedLinesArray[currentResultLineIdx].trim();

        // Increment the counter for this specific outcome.
        // If an outcome not in `standardOutcomeCategories` is encountered, it will be dynamically added.
        outcomeTallies[specificSubmissionOutcome] = (outcomeTallies[specificSubmissionOutcome] || 0) + 1;
    }

    // Present the final aggregated tallies for all known outcome categories.
    // This loop ensures a consistent output order for the standard categories.
    standardOutcomeCategories.forEach(category => {
        // Use a fallback of 0 if for some reason a category was not present in tallies (though pre-init prevents this).
        const finalCategoryCount = outcomeTallies[category] !== undefined ? outcomeTallies[category] : 0;
        console.log(`${category} x ${finalCategoryCount}`);
    });

    // Additionally, report any outcome categories that were found in the input but are not part of the standard set.
    const nonStandardOutcomes = Object.keys(outcomeTallies).filter(key => !standardOutcomeCategories.includes(key));
    if (nonStandardOutcomes.length > 0) {
        console.log("\n--- Uncategorized Submission Results ---");
        nonStandardOutcomes.forEach(unknownType => {
            console.log(`${unknownType} x ${outcomeTallies[unknownType]}`);
        });
    }
}

// Invoke the primary analysis routine by fetching data from the standard input stream.
// This ensures compatibility with typical competitive programming environments.
AnalyzeSubmissionOutcomes(require("fs").readFileSync("/dev/stdin", "utf8"));