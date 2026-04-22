// This module analyzes performance scores to determine distinct achievement levels.
// The main function processes raw input data, categorizes scores, and calculates
// the minimum and maximum possible unique performance levels based on predefined criteria.
function analyzePerformanceMetrics(rawInputText) {
    // Break down the entire input string into an array of lines.
    const inputLines = rawInputText.split('\n');

    // To ensure robustness, we might add a check for sufficient lines,
    // but for typical competitive programming scenarios, we assume valid input.
    // if (inputLines.length < 2) { /* Handle error or return default */ }

    // Extract the second line, which contains space-separated individual scores.
    const rawScoreTokens = inputLines[1].split(' ');

    // Helper function to convert string tokens into numbers,
    // filtering out any potential empty strings resulting from multiple spaces.
    const convertTokensToNumbers = (tokensArray) =>
        tokensArray.filter(token => token.trim() !== '').map(Number);

    // Parse the raw score tokens into an array of numerical scores.
    const individualScores = convertTokensToNumbers(rawScoreTokens);

    // --- Configuration Constants for Score Categorization ---
    const NUM_COLOR_LEVELS = 8; // Number of distinct "color" performance levels (0-7).
    const GRAY_LEVEL_START_THRESHOLD = 3200; // Scores from this value upwards fall into the "gray" level.
    const MAX_OVERALL_LEVELS_CAP = 8; // The total number of visible levels cannot exceed this.

    // A Set to efficiently track the unique "color" level identifiers encountered.
    const identifiedColorLevels = new Set();
    // A counter for scores that fall into the "gray" or "overflow" level.
    let grayLevelOccurrences = 0;

    // --- Core Logic: Determine Category for Each Score ---
    // This helper function maps a score value to its corresponding performance level index.
    // Returns -1 if the score falls outside all defined valid ranges.
    const assignScoreToLevel = (scoreValue) => {
        // Basic validation: ignore negative scores as they are outside expected ranges.
        if (scoreValue < 0) {
            return -1;
        }

        // Check against the 'color' level ranges (0-399, 400-799, ..., 2800-3199).
        for (let levelIndex = 0; levelIndex < NUM_COLOR_LEVELS; levelIndex++) {
            const lowerBound = levelIndex * 400;
            const upperBound = (levelIndex + 1) * 400; // Exclusive upper bound for 'color' levels.

            if (scoreValue >= lowerBound && scoreValue < upperBound) {
                return levelIndex; // Score belongs to a 'color' level.
            }
        }

        // If not a 'color' level, check if it's a 'gray' level score.
        // The original problem implies a max score of 4800 for the gray category,
        // so we include that upper bound here for consistency.
        if (scoreValue >= GRAY_LEVEL_START_THRESHOLD && scoreValue <= 4800) {
            return NUM_COLOR_LEVELS; // This index (8) represents the 'gray' level.
        }

        // Score is outside all recognized ranges.
        return -1;
    };

    // Iterate through each parsed score to categorize it.
    for (const currentScore of individualScores) {
        // Ensure the current entry is a valid number before processing.
        if (isNaN(currentScore)) {
            // Skip non-numeric entries; they don't contribute to level counts.
            continue;
        }

        const assignedLevelIndex = assignScoreToLevel(currentScore);

        // Process the assigned level.
        if (assignedLevelIndex !== -1) {
            if (assignedLevelIndex < NUM_COLOR_LEVELS) {
                // For 'color' levels, just record its presence in the Set.
                identifiedColorLevels.add(assignedLevelIndex);
            } else if (assignedLevelIndex === NUM_COLOR_LEVELS) {
                // For the 'gray' level, increment its dedicated counter.
                grayLevelOccurrences++;
            }
        }
    }

    // --- Calculate Minimum and Maximum Distinct Levels ---

    // The minimum number of distinct levels is simply the count of unique 'color' categories found.
    const minimumDetectedLevels = identifiedColorLevels.size;

    // The maximum possible number of distinct levels is the sum of 'color' levels
    // and 'gray' scores, where 'gray' scores can effectively fill in for any
    // 'missing' color categories, but the total is capped at MAX_OVERALL_LEVELS_CAP.
    let maximumPossibleLevels = minimumDetectedLevels + grayLevelOccurrences;
    maximumPossibleLevels = Math.min(maximumPossibleLevels, MAX_OVERALL_LEVELS_CAP);

    // Output the calculated minimum and maximum distinct levels.
    console.log(`${minimumDetectedLevels} ${maximumPossibleLevels}`);
}

// This line is standard for competitive programming environments to read input
// and invoke the primary analysis function. It should not be modified.
analyzePerformanceMetrics(require("fs").readFileSync("/dev/stdin", "utf8"));