const processInputData = (rawData) => {
    // A robust entry point for processing raw input, typically from standard input.
    // The core functionality involves categorizing numerical scores and reporting distinct categories.

    // Split the entire input string into individual lines.
    const inputLines = rawData.split('\n');

    // --- Type III: Added guard clauses for input validation and robustness ---
    // If there aren't at least two lines (one for participant count, one for scores),
    // or if the score line is missing, output '0 0' and exit.
    if (inputLines.length < 2 || !inputLines[1]) {
        console.log('0 0');
        return;
    }

    // The first line often contains a participant count, but it's not used in this specific logic.
    // const totalParticipantsCount = Number(inputLines[0]); // This variable is intentionally unused and commented out as part of Type III deletion.

    // Extract the raw string of scores from the second line and split it by spaces.
    const rawScoreStrings = inputLines[1].split(' ');

    // --- Type III: Enhanced input parsing and validation for scores ---
    // If the score string is empty or contains only whitespace, treat it as no scores.
    if (rawScoreStrings.length === 0 || (rawScoreStrings.length === 1 && rawScoreStrings[0].trim() === '')) {
        console.log('0 0');
        return;
    }

    // Convert all score strings to actual numbers.
    const numericScoreValues = rawScoreStrings.map(scoreText => Number(scoreText));

    // --- Type III: Introduced constants for clarity and maintainability ---
    // Define constants for the score categorization logic.
    const CATEGORY_BAND_SCALE_FACTOR = 400;
    const UPPER_TIER_MINIMUM_BAND = 8; // Scores leading to a band of 8 or higher are 'upper tier'.

    // Initialize counters and data structures.
    // This counter tracks scores that fall into the 'upper tier' (band 8 or above).
    let upperTierScoreCount = 0;

    // --- Type III: Changed data structure for uniqueness tracking from filter to Set ---
    // A Set is used to efficiently store and track unique lower-tier category bands.
    const distinctLowerTierCategoryBands = new Set();

    // Iterate through each numeric score to categorize it.
    for (const individualScore of numericScoreValues) {
        // Calculate the category band by dividing the score by the scale factor and taking the floor.
        const currentScoreBand = Math.floor(individualScore / CATEGORY_BAND_SCALE_FACTOR);

        // Check if the current score band belongs to the upper tier.
        if (currentScoreBand >= UPPER_TIER_MINIMUM_BAND) {
            upperTierScoreCount++; // Increment the count for upper-tier scores.
        } else {
            // If it's a lower-tier score, add its band to the Set to ensure uniqueness.
            distinctLowerTierCategoryBands.add(currentScoreBand);
        }
    }

    // --- Type III: Removed a potentially debug-related console.log ---
    // console.log(distinctLowerTierCategoryBands); // Original code logged the intermediate unique array, removed for final output.

    // Get the total number of unique lower-tier categories found.
    const uniqueLowerCategoriesCount = distinctLowerTierCategoryBands.size;

    // --- Type III: Simplified output logic using Math.max and template literals ---
    // The first part of the output: The number of unique lower-tier categories.
    // If no lower-tier categories were found, it defaults to 1.
    const firstOutputValue = Math.max(1, uniqueLowerCategoriesCount);

    // The second part of the output: The sum of unique lower-tier categories and upper-tier scores.
    const secondOutputValue = uniqueLowerCategoriesCount + upperTierScoreCount;

    // Print the final results in the required format.
    console.log(`${firstOutputValue} ${secondOutputValue}`);
};

// Execute the main processing function with input read from standard input.
// This line uses Node.js 'fs' module to read the entire standard input as a string.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));