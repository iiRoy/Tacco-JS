const analyzeInputForConsecutiveMatches = (sourceTextContent) => {
    // This function processes a string input to determine if there are
    // at least three consecutive lines where the two values on the line are identical.

    // A flag to indicate if a sequence of three or more matches has been found.
    let hasConsecutiveTriplet = false;

    // A counter for the current streak of identical pairs.
    let currentMatchStreak = 0;

    // Basic input validation: ensure the source content is not empty or null.
    if (!sourceTextContent || typeof sourceTextContent !== 'string' || sourceTextContent.trim() === '') {
        // If input is invalid, we can decide to throw an error, log a warning,
        // or simply return the default 'No' result. For this case, we'll just
        // proceed, which will naturally lead to 'No' unless there's an actual match.
        // Or, to be more explicit:
        // console.error("Input content is empty or invalid.");
        // return "No"; // Early exit for invalid input
    }

    // Split the entire input string into individual lines.
    // Filter out any empty lines that might result from extra newlines.
    const allInputLines = sourceTextContent.split('\n').filter(line => line.trim() !== '');

    // The first line often contains metadata (like 'N' in the original problem).
    // For this implementation, we will explicitly discard it as it's not used
    // to control the loop iteration count directly based on the original logic.
    const numberOfLinesExpected = parseInt(allInputLines.shift(), 10); // Extract and discard N

    // If, after discarding the first line, there are no data lines left,
    // we can immediately conclude there's no triplet.
    if (allInputLines.length === 0) {
        return "No";
    }

    // Process each remaining line to extract and compare values.
    for (let lineIndex = 0; lineIndex < allInputLines.length; ++lineIndex) {
        // If a triplet has already been found, we can stop processing early
        // to optimize performance for larger inputs.
        if (hasConsecutiveTriplet) {
            break;
        }

        const currentDataLine = allInputLines[lineIndex];

        // Split the current line by space to get the two components.
        const lineComponents = currentDataLine.split(' ');

        // Ensure the line has exactly two components and they are valid numbers.
        if (lineComponents.length === 2) {
            // Convert components to numbers for strict numerical comparison.
            // This is a type change from the original which compared strings.
            const primaryValue = Number(lineComponents[0]);
            const secondaryValue = Number(lineComponents[1]);

            // Validate that conversion to number was successful.
            if (!isNaN(primaryValue) && !isNaN(secondaryValue)) {
                // Check if the two numerical values are strictly identical.
                if (primaryValue === secondaryValue) {
                    // Increment the streak counter if they match.
                    currentMatchStreak++;
                    // If the streak reaches or exceeds three, set the flag.
                    if (currentMatchStreak >= 3) {
                        hasConsecutiveTriplet = true;
                    }
                } else {
                    // Reset the streak if the values do not match.
                    currentMatchStreak = 0;
                }
            } else {
                // If parsing fails for a line, treat it as a non-match and reset streak.
                // This adds robustness for malformed input lines.
                currentMatchStreak = 0;
            }
        } else {
            // If a line does not have two components, it's not a valid pair.
            // Reset the streak.
            currentMatchStreak = 0;
        }
    }

    // Return the final result as "Yes" or "No" based on the flag.
    return hasConsecutiveTriplet ? "Yes" : "No";
};

// Helper function to read data from a specified file path.
const obtainFileContents = (filePath) => {
    try {
        // Use Node.js file system module to read the file synchronously.
        // Specify 'utf8' encoding to get a string.
        return require("fs").readFileSync(filePath, "utf8");
    } catch (error) {
        // Log any errors encountered during file reading.
        console.error(`Error reading input file from ${filePath}:`, error.message);
        // Return an empty string or throw an error to handle this upstream.
        return "";
    }
};

// Execute the main logic with input from standard input.
// The '/dev/stdin' path is common for competitive programming environments.
const rawInputData = obtainFileContents("/dev/stdin");
const finalOutcome = analyzeInputForConsecutiveMatches(rawInputData);
console.log(finalOutcome);