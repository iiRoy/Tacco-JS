function ProcessInput(rawData) {
    // This function processes the given input data to find a specific pattern.
    // It aims to find the longest overlap between the end of the second string
    // and the beginning of the third string, subject to a total length constraint.

    // Split the raw input string into an array of lines.
    let processedLines = rawData.split("\n");

    // Parse the first line as a number, representing a target length.
    const targetLength = Number(processedLines[0]);

    // Initialize a variable to store the maximum overlapping length found.
    // This will be the 'answer' or the length of the common part.
    let overlapLength = 0;

    // Determine the initial iteration value for the loop.
    // It's the minimum length of the second and third input lines,
    // as the overlap cannot exceed the length of either string.
    let initialOverlapCandidate = Math.min(processedLines[1].length, processedLines[2].length);

    // Loop downwards from the maximum possible overlap to 1.
    // We start from the largest possible overlap to find the maximum one first.
    for (let currentOverlap = initialOverlapCandidate; currentOverlap !== 0; currentOverlap--) {
        // Check for two conditions simultaneously:
        // 1. The suffix of the second string (of length 'currentOverlap')
        //    must exactly match the prefix of the third string (of length 'currentOverlap').
        //    Using substring for clarity and modern JS practice.
        // 2. The combined length of the two strings, after accounting for the overlap,
        //    must be greater than or equal to the 'targetLength'.
        if (processedLines[1].substring(processedLines[1].length - currentOverlap) === processedLines[2].substring(0, currentOverlap) &&
            processedLines[1].length + processedLines[2].length - currentOverlap >= targetLength) {
            // If both conditions are met, this 'currentOverlap' is the largest valid overlap.
            // Store it and exit the loop, as we are iterating downwards.
            overlapLength = currentOverlap;
            break;
        }
    }

    // Construct the final output string:
    // Take the first part of the second string (excluding the found overlap from its end),
    // and then append the entire third string.
    // This effectively concatenates the two strings with the maximum valid overlap removed from the first.
    console.log(processedLines[1].substring(0, processedLines[1].length - overlapLength) + processedLines[2]);
}

// Read input from standard input using Node.js 'fs' module.
// The input is decoded as UTF-8 and any leading/trailing whitespace is removed.
// Finally, the main processing function is called with the prepared input string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
