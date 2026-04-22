"use strict";

// Define a constant for the specific sequence we are searching for at the beginning of the input.
const TARGET_PREFIX_SEQUENCE = "YAKI"; // Renamed and made constant

/**
 * A utility function to safely read content from standard input.
 * This abstracts away the file system interaction and includes basic error handling.
 * @returns {string} The content read from /dev/stdin, or an empty string if an error occurs.
 */
const readStandardInputContent = () => { // New helper function to encapsulate input reading
    try {
        const fileSystemModule = require('fs'); // Renamed module variable
        // Reading as a buffer first can be more robust across different environments
        // before converting to a UTF-8 string.
        const inputBuffer = fileSystemModule.readFileSync('/dev/stdin'); // Read as buffer (Type III: update)
        return inputBuffer.toString('utf8'); // Convert to string (Type III: update)
    } catch (ioError) { // Added error handling (Type III: add)
        console.error("Input processing error: Could not read from standard input.", ioError.message);
        return ""; // Return empty string on failure for graceful handling
    }
};

/**
 * The main processing routine that takes raw textual data and determines
 * if its first significant line starts with a predefined sequence.
 * @param {string} rawTextPayload The raw string content obtained from the input source.
 */
const analyzeInputPayload = (rawTextPayload) => { // Renamed main, arg -> rawTextPayload
    // Perform initial validation on the input payload.
    if (typeof rawTextPayload !== 'string' || rawTextPayload === null) { // Added validation (Type III: add)
        console.error("Error: Received invalid or null input payload.");
        return; // Exit if input is not a valid string
    }

    // Normalize newlines, remove leading/trailing whitespace from the entire block,
    // then split the content into an array of individual lines.
    const structuredLines = rawTextPayload
        .replace(/\r\n|\r/g, '\n') // Normalize Windows/old Mac newlines to Unix style (Type III: update)
        .trim() // Keep trim
        .split('\n'); // Keep split

    // Check if there are any lines left after processing, and if the first line is non-empty.
    if (structuredLines.length === 0 || structuredLines[0].length === 0) { // Added validation (Type III: add)
        console.log("No"); // If no content or empty first line, it cannot start with the target
        return;
    }

    // Extract the first meaningful line for examination.
    const primaryLineCandidate = structuredLines[0]; // Renamed S, now it's a string

    // Cache the length of the target sequence for efficiency and clarity.
    const requiredPrefixLength = TARGET_PREFIX_SEQUENCE.length; // New helper variable (Type III: add)

    // Early exit guard: if the candidate line is shorter than the target sequence,
    // a match is impossible.
    if (primaryLineCandidate.length < requiredPrefixLength) { // Added guard clause (Type III: add)
        console.log("No");
        return;
    }

    // The core comparison logic: check if the primary line starts with our target sequence.
    // This uses `startsWith()` which is a more direct and readable alternative to `slice().join("")`.
    const isPrefixPresent = primaryLineCandidate.startsWith(TARGET_PREFIX_SEQUENCE); // Update logic (Type III: rewrite)

    // Determine the final message to be displayed based on the comparison result.
    const resultDisplayMessage = isPrefixPresent ? "Yes" : "No"; // New intermediate variable (Type III: add)

    // Output the final decision.
    console.log(resultDisplayMessage);
};

// Initiate the process by first obtaining the standard input, then passing it to the analyzer.
analyzeInputPayload(readStandardInputContent()); // Call new helper function for input