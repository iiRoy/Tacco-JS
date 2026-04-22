// This module handles processing input for burger patty queries,
// calculating the number of patties up to a specified position in a layered burger structure.

// Precompute lengths and patty counts for different burger levels.
// The burger structure is defined recursively:
// P_0 (Level 0 burger) = 'b' (a single patty)
// P_i (Level i burger) = 'p' P_{i-1} 'b' P_{i-1} 'p'
// where 'p' represents a bun layer (no patty) and 'b' represents a patty.

// Based on this structure, the recurrence relations for total length and patty count are:
// total_length(P_i) = 1 (for 'p') + total_length(P_{i-1}) + 1 (for 'b') + total_length(P_{i-1}) + 1 (for 'p')
//                   = 2 * total_length(P_{i-1}) + 3
// patty_count(P_i)  = 0 (for 'p') + patty_count(P_{i-1}) + 1 (for 'b') + patty_count(P_{i-1}) + 0 (for 'p')
//                   = 2 * patty_count(P_{i-1}) + 1

// Define the maximum burger level to precompute, consistent with typical competitive programming constraints.
const MAX_BURGER_LEVEL = 50;

// Arrays to store precomputed values for efficiency.
// `pattyCountsPerLevel[i]` stores the total number of patties in a Level `i` burger.
const pattyCountsPerLevel = new Array(MAX_BURGER_LEVEL + 1);
// `totalLengthsPerLevel[i]` stores the total character length of a Level `i` burger.
const totalLengthsPerLevel = new Array(MAX_BURGER_LEVEL + 1);

// Initialize base case for Level 0 burger.
pattyCountsPerLevel[0] = 1; // P0 is 'b', so 1 patty.
totalLengthsPerLevel[0] = 1; // P0 is 'b', so 1 character length.

// Populate the precomputation arrays using the recurrence relations.
for (let lvlIndex = 1; lvlIndex <= MAX_BURGER_LEVEL; ++lvlIndex) {
    pattyCountsPerLevel[lvlIndex] = pattyCountsPerLevel[lvlIndex - 1] * 2 + 1;
    totalLengthsPerLevel[lvlIndex] = totalLengthsPerLevel[lvlIndex - 1] * 2 + 3;
}

/**
 * Recursively calculates the number of patties within the first `queryPosition` characters
 * of a burger at a given `currentLevel`. This function performs a depth-first search
 * through the burger layers.
 *
 * @param {number} currentLevel The current burger level being analyzed (0-indexed).
 * @param {number} queryPosition The 1-indexed position up to which patties are counted.
 * @returns {number} The total number of patties found within the specified segment.
 */
function calculatePattiesInSegment(currentLevel, queryPosition) {
    // Guard clause: If the queried position is non-positive, no patties are counted.
    if (queryPosition <= 0) {
        return 0;
    }

    // Base case: If we're at Level 0, the burger is simply 'b'.
    if (currentLevel === 0) {
        // If the query position is 1 or more, it includes the single 'b' patty.
        return 1;
    }

    // Retrieve precomputed values for the sub-burger (P_{level-1}).
    const lowerLevelLength = totalLengthsPerLevel[currentLevel - 1];
    const lowerLevelPatties = pattyCountsPerLevel[currentLevel - 1];

    // Analyze the current burger's structure: 'p' (P_{i-1}) 'b' (P_{i-1}) 'p'
    // Positions:
    // 1: Leading 'p' (bun)
    // 2 to (1 + lowerLevelLength): First P_{i-1} sub-burger
    // (2 + lowerLevelLength): Middle 'b' (patty)
    // (3 + lowerLevelLength) to (2 + lowerLevelLength + lowerLevelLength): Second P_{i-1} sub-burger
    // (3 + lowerLevelLength + lowerLevelLength): Trailing 'p' (bun)

    // Case 1: The query position is at the leading 'p'.
    if (queryPosition === 1) {
        return 0; // A bun contains no patties.
    }
    // Case 2: The query position falls within the first P_{i-1} sub-burger.
    else if (queryPosition <= 1 + lowerLevelLength) {
        // Recurse into the sub-burger, adjusting the position to account for the leading 'p'.
        return calculatePattiesInSegment(currentLevel - 1, queryPosition - 1);
    }
    // Case 3: The query position is exactly at the middle 'b'.
    else if (queryPosition === 1 + lowerLevelLength + 1) {
        // Count all patties from the first P_{i-1} and the middle 'b'.
        return lowerLevelPatties + 1;
    }
    // Case 4: The query position falls within the second P_{i-1} sub-burger.
    else if (queryPosition <= 1 + lowerLevelLength + 1 + lowerLevelLength) {
        // Count all patties from the first P_{i-1} and the middle 'b',
        // then add patties from the relevant segment of the second P_{i-1}.
        const remainingQueryPosition = queryPosition - (1 + lowerLevelLength + 1);
        return lowerLevelPatties + 1 + calculatePattiesInSegment(currentLevel - 1, remainingQueryPosition);
    }
    // Case 5: The query position is beyond the entire burger (e.g., at the last 'p' or further).
    else {
        // All patties in both P_{i-1} sub-burgers and the middle 'b' are counted.
        // The trailing 'p' contains no patties, so this covers the full burger.
        return lowerLevelPatties + 1 + lowerLevelPatties;
    }
}

/**
 * Main function to process raw input for a burger query.
 * It parses the burger level (N) and query position (X),
 * then calculates and prints the number of patties.
 *
 * @param {string} rawInput The raw input string, typically "N X".
 */
function processBurgerQuery(rawInput) {
    const inputLines = rawInput.split("\n");

    // Parse N (burger level) and X (query position) from the first line.
    const [levelString, positionString] = inputLines[0].split(" ");
    const burgerLevel = parseInt(levelString.trim(), 10);
    let queryPosition = parseInt(positionString.trim(), 10);

    // Input validation for burger level.
    if (isNaN(burgerLevel) || burgerLevel < 0 || burgerLevel > MAX_BURGER_LEVEL) {
        console.error(`Error: Invalid burger level N=${burgerLevel}. Must be an integer between 0 and ${MAX_BURGER_LEVEL}.`);
        return; // Terminate if input is invalid
    }
    // Input validation for query position.
    if (isNaN(queryPosition) || queryPosition < 1) {
        console.error(`Error: Invalid query position X=${queryPosition}. Must be a positive integer.`);
        return; // Terminate if input is invalid
    }

    // Adjust queryPosition if it exceeds the total length of the burger.
    // If X is too large, it implies counting all patties in the entire burger.
    const totalBurgerLength = totalLengthsPerLevel[burgerLevel];
    if (queryPosition > totalBurgerLength) {
        queryPosition = totalBurgerLength;
    }

    // Invoke the recursive helper to calculate the final patty count.
    const finalPattyCount = calculatePattiesInSegment(burgerLevel, queryPosition);

    // Output the calculated result.
    console.log(`${finalPattyCount}`);
}

// --- Execution Environment Handling ---
// This section determines how to read input based on the execution environment.

// Helper function to securely read input from stdin in a Node.js environment.
function getStdinContent() {
    try {
        const fileSystem = require("fs");
        return fileSystem.readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        // Log an error if stdin cannot be read, which might happen outside typical CP platforms.
        console.error("Failed to read from /dev/stdin. Ensure this script is run in a compatible Node.js environment.");
        return ""; // Return an empty string to prevent further processing errors.
    }
}

// Detect if the script is running in a Node.js environment.
if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
    // In Node.js, read input from standard input.
    const inputFromStdin = getStdinContent();
    processBurgerQuery(inputFromStdin);
} else if (typeof document !== 'undefined') {
    // In a browser environment, provide a debug interface if specific DOM elements exist.
    // This allows for manual input and viewing of output in a webpage.
    window.addEventListener('DOMContentLoaded', () => {
        const debugInputArea = document.getElementById("inputForDebug");
        const debugOutputDisplay = document.getElementById("outputForDebug");
        const debugRunButton = document.getElementById("runDebug");

        if (debugInputArea && debugRunButton && debugOutputDisplay) {
            debugRunButton.addEventListener('click', () => {
                const debugInputValue = debugInputArea.value;
                // Temporarily override console.log to capture output for display.
                const originalConsoleLog = console.log;
                let capturedOutput = '';
                console.log = (...args) => {
                    capturedOutput += args.map(String).join(' ') + '\n';
                };
                try {
                    processBurgerQuery(debugInputValue);
                } finally {
                    console.log = originalConsoleLog; // Restore original console.log
                    debugOutputDisplay.textContent = capturedOutput.trim(); // Display captured output
                }
            });
        } else {
            console.warn("Debug elements (inputForDebug, outputForDebug, runDebug) not found in the DOM.");
        }
    });
} else {
    // Handle other or unknown execution environments.
    console.warn("Unsupported execution environment. Please provide input manually or via standard input.");
}