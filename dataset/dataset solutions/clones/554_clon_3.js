const acquireRawData = (sourcePath) => {
    // This helper function is responsible for reading the raw input from the specified path.
    // It attempts to mimic the original's behavior of synchronous file reading.
    try {
        return require('fs').readFileSync(sourcePath, 'utf8');
    } catch (ioError) {
        // In case of an error during file reading (e.g., file not found, permissions),
        // a warning is logged, and an empty string is returned to prevent application crashes.
        console.error("Error reading input data from " + sourcePath + ": " + ioError.message);
        return "";
    }
};

const safelyParseNumbers = (textualSegment) => {
    // This utility function takes a string, trims it, splits it by spaces,
    // filters out any empty string segments, and then attempts to convert
    // each remaining segment into a number. Non-numeric values are treated as zero.
    return textualSegment
        .trim()
        .split(' ')
        .filter(segment => segment !== '')
        .map(segment => {
            const numericValue = Number(segment);
            // If the conversion results in NaN (Not a Number), default to 0.
            return isNaN(numericValue) ? 0 : numericValue;
        });
};

const processCompetitionResults = () => {
    // Fetch the complete raw input content.
    const fullRawInput = acquireRawData('/dev/stdin');

    // Split the raw input into an array of individual lines.
    // Any lines that are completely empty after trimming are discarded.
    let contentLines = fullRawInput.split('\n').filter(line => line.trim().length > 0);

    let currentLinePointer = 0; // Tracks the current line being read from 'contentLines'.

    // The main loop iterates through each distinct competition scenario provided in the input.
    // It continues indefinitely until an explicit break condition is met.
    while (true) {
        // Ensure there are still lines left to process for the dimensions of the next scenario.
        if (currentLinePointer >= contentLines.length) {
            // No more data to read, so terminate the processing.
            break;
        }

        // Read the line specifying the dimensions (number of participants 'N' and score categories 'M').
        const scenarioSpecs = safelyParseNumbers(contentLines[currentLinePointer++]);

        // Validate that the dimension line contains at least two numbers as expected.
        if (scenarioSpecs.length < 2) {
            console.error("Invalid scenario specification line encountered, skipping:", scenarioSpecs);
            continue; // Move to the next line if the current one is malformed.
        }

        const numberOfParticipants = scenarioSpecs[0];     // Corresponds to 'n' in the original problem.
        const numberOfScoreCategories = scenarioSpecs[1]; // Corresponds to 'm' in the original problem.

        // This is the global termination condition for the entire input processing.
        // If both dimensions are zero, it signifies the end of all test cases.
        if (numberOfParticipants === 0 && numberOfScoreCategories === 0) {
            break;
        }

        // Initialize an array of objects to store data for each competitor.
        // Each object contains a unique 'competitorIdentifier' (1-based) and their 'aggregateScore'.
        // This object-based structure enhances readability and maintainability compared to nested arrays.
        let competitorProfiles = Array.from({ length: numberOfScoreCategories }, (_, idx) => ({
            competitorIdentifier: idx + 1, // IDs start from 1.
            aggregateScore: 0              // All scores initialized to zero.
        }));

        // Iterate through each row of scores provided for the current competition.
        for (let rowIdx = 0; rowIdx < numberOfParticipants; rowIdx++) {
            // Pre-check to ensure that there are enough lines remaining for score data.
            if (currentLinePointer >= contentLines.length) {
                console.error("Premature end of input while reading score rows for a scenario.");
                // If input ends unexpectedly, break out of this scenario's processing.
                break;
            }

            const currentScoreSet = safelyParseNumbers(contentLines[currentLinePointer++]);

            // Optional: Log a warning if the number of scores in the line doesn't match expectations.
            if (currentScoreSet.length !== numberOfScoreCategories) {
                console.warn(`Score line ${rowIdx + 1} has ${currentScoreSet.length} entries, expected ${numberOfScoreCategories}.`);
                // The processing will still continue, using available scores.
            }

            // Accumulate scores for each competitor based on the current score line.
            currentScoreSet.forEach((scoreEntry, categoryIdx) => {
                // Ensure that the category index is within the bounds of initialized competitor profiles.
                if (categoryIdx < competitorProfiles.length) {
                    competitorProfiles[categoryIdx].aggregateScore += scoreEntry;
                } else {
                    // This indicates an extra score value beyond the declared number of categories.
                    console.warn(`Score for category ${categoryIdx + 1} ignored, as it exceeds the declared ${numberOfScoreCategories} categories.`);
                }
            });
        }

        // Sort the competitor profiles according to the problem's specific rules:
        // 1. Primary sort: By 'aggregateScore' in descending order (highest score first).
        // 2. Secondary sort: If scores are tied, by 'competitorIdentifier' in ascending order (lower ID first).
        competitorProfiles.sort((profileA, profileB) => {
            const scoreComparison = profileB.aggregateScore - profileA.aggregateScore;
            // If scores are different, return the score comparison result immediately.
            if (scoreComparison !== 0) {
                return scoreComparison;
            }
            // If scores are identical, compare by competitor ID.
            return profileA.competitorIdentifier - profileB.competitorIdentifier;
        });

        // Extract only the 'competitorIdentifier' from the now sorted profiles.
        const finalRankedIdentifiers = competitorProfiles.map(profile => profile.competitorIdentifier);

        // Output the ranked identifiers, joined by a single space, for the current scenario.
        console.log(finalRankedIdentifiers.join(' '));
    }
};

// Initiate the entire competition results processing pipeline.
processCompetitionResults();