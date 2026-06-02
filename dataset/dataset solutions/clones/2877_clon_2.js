function ProcessInput(rawData) {
    // Clean up the raw input by removing leading/trailing whitespace.
    let textString = rawData.trim();
    // Obtain the current length of the processed string.
    let stringLength = textString.length;
    // Initialize a counter for the number of successful pattern replacements.
    let transformationCount = 0;

    // Only proceed if the string is long enough to contain the target pattern (3 characters).
    if (stringLength >= 3) {
        // Iterate through the string, checking for the pattern.
        // The loop condition `stringLength - 2` ensures we can safely access `textString[idx + 2]`.
        for (let idx = 0; idx < stringLength - 2; idx++) {
            // Check if the current three characters form the specific sequence "ABC".
            if (textString[idx] + textString[idx + 1] + textString[idx + 2] === "ABC") {
                // Capture the segment of the string before the found "ABC".
                let prefixPart = textString.slice(0, idx);
                // Capture the segment of the string after the found "ABC".
                let suffixPart = textString.slice(idx + 3);

                // Reconstruct the string, replacing "ABC" with "BCA".
                textString = prefixPart + "BCA" + suffixPart;
                // Increment the counter for this successful transformation.
                transformationCount++;
                // Adjust the loop index backward to re-evaluate the modified section.
                // This is crucial because the replacement "BCA" might create a new "ABC"
                // sequence that starts before the current `idx`.
                idx -= 2;
            }
        }
    }
    // Output the final tally of transformations to the console.
    console.log(transformationCount);
}

// Execute the main processing function by reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
