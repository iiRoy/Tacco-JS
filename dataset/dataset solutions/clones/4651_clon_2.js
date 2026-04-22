// This script processes text input from standard input to find common characters.
// It reads all lines, skips the first and last, then determines the minimum
// occurrences of each character across the remaining lines.

// --- Stage 1: Process input and calculate minimum character frequencies ---
const aggregatedCharMinCounts = (
    "" + require("fs").readFileSync(0) // Read raw buffer from stdin and convert to string
)
    .split("\n") // Split the entire input string into an array of individual lines
    .slice(1, -1) // Remove the first and last lines from the array
    .map((inputLine) => {
        // For each remaining line, count character occurrences
        return inputLine.split("").reduce(
            (lineCharCounts, singleChar) => {
                // Increment character count. If undefined, it becomes 1.
                lineCharCounts[singleChar] = -~lineCharCounts[singleChar];
                return lineCharCounts;
            },
            {} // Initialize an empty object for character counts for the current line
        );
    })
    .reduce((overallMinCounts, currentLineCounts) => {
        // Aggregate character counts across all lines to find the minimum frequency
        for (const charIdentifier in overallMinCounts) {
            // Update the minimum count for each character
            overallMinCounts[charIdentifier] = Math.min(
                overallMinCounts[charIdentifier],
                currentLineCounts[charIdentifier] || 0 // Use 0 if character not present in current line
            );
        }
        return overallMinCounts;
    });

// --- Stage 2: Construct output strings based on minimum frequencies ---
const outputFragments = []; // Initialize an array to store the repeated character strings

// Iterate through the characters found in the aggregated minimum counts
for (const finalChar in aggregatedCharMinCounts) {
    // Repeat each character by its minimum frequency and add to the output array
    outputFragments.push(finalChar.repeat(aggregatedCharMinCounts[finalChar]));
}

// --- Stage 3: Sort and print the final result ---
// Sort the array of repeated character strings alphabetically and join them
console.log(outputFragments.sort().join(""));