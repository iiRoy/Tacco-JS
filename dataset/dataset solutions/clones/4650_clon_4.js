"use strict"
const acquireDataLines = () => require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const runCoreLogic = () => {
    let allInputSegments = acquireDataLines();

    // The first line represents 'n', which is consumed but not used in the original's logic.
    // We replicate this behavior by removing it.
    if (allInputSegments.length > 0) {
        allInputSegments.shift();
    }

    // Generate the full sequence of lowercase English alphabet characters.
    const alphabetSequence = Array.from({ length: 26 }, (_, i) => String.fromCharCode('a'.charCodeAt(0) + i));

    // Helper function to calculate character frequencies for a given text segment.
    const calculateFrequencies = (textSegment) => {
        const frequencyMap = new Map();
        for (const character of textSegment) {
            frequencyMap.set(character, (frequencyMap.get(character) || 0) + 1);
        }
        return frequencyMap;
    };

    // This Map will store the minimum frequency for each character across all input segments.
    // Initialize with a default state (e.g., all zeros if no segments, or first segment's counts).
    let aggregatedMinFrequencies = new Map();

    if (allInputSegments.length === 0) {
        // If there are no input segments after 'n', all characters have a frequency of 0.
        for (const char of alphabetSequence) {
            aggregatedMinFrequencies.set(char, 0);
        }
    } else {
        // Initialize aggregated frequencies with the counts from the very first input segment.
        const firstSegmentFrequencies = calculateFrequencies(allInputSegments[0]);
        for (const char of alphabetSequence) {
            // If a char is not in the first segment, its count is 0.
            aggregatedMinFrequencies.set(char, firstSegmentFrequencies.get(char) || 0);
        }

        // Iterate through the rest of the input segments to find the minimum frequencies.
        for (let segmentIndex = 1; segmentIndex < allInputSegments.length; segmentIndex++) {
            const currentSegmentFrequencies = calculateFrequencies(allInputSegments[segmentIndex]);

            for (const char of alphabetSequence) {
                const existingMinimum = aggregatedMinFrequencies.get(char);
                const currentSegmentCount = currentSegmentFrequencies.get(char) || 0;

                // If a character's minimum frequency has already become 0 (meaning it was absent
                // in a previous segment), it remains 0 for all subsequent segments.
                if (existingMinimum === 0) {
                    continue;
                } else {
                    // Otherwise, update the minimum with the count from the current segment.
                    // If currentSegmentCount is 0, existingMinimum will become 0.
                    aggregatedMinFrequencies.set(char, Math.min(existingMinimum, currentSegmentCount));
                }
            }
        }
    }

    // Construct the final output string based on the aggregated minimum frequencies.
    const resultantCharactersCollection = [];
    for (const letter of alphabetSequence) {
        const countValue = aggregatedMinFrequencies.get(letter);
        if (countValue > 0) {
            // Use a functional approach to repeat characters 'countValue' times.
            resultantCharactersCollection.push(...Array.from({ length: countValue }, () => letter));
        }
    }

    // The characters are already in alphabetical order because 'alphabetSequence' is iterated in order.
    // However, the original code explicitly sorts the final array, so we replicate this for exact equivalence.
    resultantCharactersCollection.sort();

    // Output the joined characters to standard output, followed by a newline.
    process.stdout.write(resultantCharactersCollection.join("") + "\n");
};

// Execute the main program logic.
runCoreLogic();