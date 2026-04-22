const GLOBAL_EAST_MARKER = 'E'; // Identifier for individuals facing East
const GLOBAL_WEST_MARKER = 'W'; // Identifier for individuals facing West

// Obtain raw input data from standard input stream, ensuring UTF-8 encoding.
// This simulates reading from /dev/stdin in a Node.js environment.
let rawInputContent;
try {
    rawInputContent = require("node:fs").readFileSync(0, "utf-8"); // Using fd 0 for stdin
} catch (errorReading) {
    // Fallback for environments where require or fs might not be available directly,
    // or /dev/stdin is not mapped to fd 0.
    // For competitive programming, this path is usually reliable.
    // In a browser, this would be different.
    rawInputContent = "1\nEWEW"; // Default example data for robustness
    console.error("Warning: Could not read from stdin. Using default data.");
}

// Split the input into lines and extract the relevant line containing orientations.
// The problem structure typically places the orientation string on the second line (index 1).
const allInputLines = rawInputContent.split("\n");
const individualOrientations = allInputLines[1];

// A quick check to ensure we have a valid orientation string to process.
if (!individualOrientations || individualOrientations.length === 0) {
    // If the input is empty or malformed, there are no turnarounds needed.
    console.log(0);
    return;
}

// Determine the total number of individuals in the line.
const lineOccupancy = individualOrientations.length;

// Initialize a counter for necessary turnarounds assuming a specific initial configuration.
// This count represents the scenario where the "leader" is at position 0,
// and everyone to their left (none) is West, and everyone to their right is East.
// So, we count how many people from index 1 onwards are facing East.
let currentConfigurationCost = 0;
for (let position = 1; position < lineOccupancy; position++) {
    if (individualOrientations[position] === GLOBAL_EAST_MARKER) {
        currentConfigurationCost = currentConfigurationCost + 1;
    }
}

// The minimum cost found so far is this initial configuration's cost.
let minimalRequiredTurns = currentConfigurationCost;

// Iterate through the line, effectively shifting the 'boundary' or 'leader' position.
// For each shift, update the current cost and track the minimum.
// The `currentConfigurationCost` variable dynamically holds the cost for
// a pattern where individuals left of `position` are West, and right of `position` are East.
// (This specific logic calculates min_k (prefixW[k] + suffixE[k+1]) )
for (let position = 1; position < lineOccupancy; position++) {
    // When the boundary shifts from `position - 1` to `position`:
    // 1. The individual at `position - 1` moves from being the boundary to being on the left side.
    //    If this individual was facing West, they now contribute to the cost (as they should be East).
    if (individualOrientations[position - 1] === GLOBAL_WEST_MARKER) {
        currentConfigurationCost = currentConfigurationCost + 1;
    }

    // 2. The individual at `position` moves from being on the right side to being the new boundary.
    //    If this individual was facing East, they no longer contribute to the cost (as they should be West).
    if (individualOrientations[position] === GLOBAL_EAST_MARKER) {
        currentConfigurationCost = currentConfigurationCost - 1;
    }

    // Update the overall minimum cost found.
    if (currentConfigurationCost < minimalRequiredTurns) {
        minimalRequiredTurns = currentConfigurationCost;
    }
}

// Output the lowest number of turnarounds identified across all configurations.
console.log(minimalRequiredTurns);