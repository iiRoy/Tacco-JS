function charCount(inputStr) {
    // Initialize an array to hold the frequency of each lowercase English letter.
    let charOccurrences = new Array(26).fill(0);

    // Iterate over every character in the provided string.
    for (let idx = 0; idx < inputStr.length; idx++) {
        // Determine the 0-based index for the current character (e.g., 'a' is 0, 'b' is 1).
        let charPos = inputStr[idx].charCodeAt() - "a".charCodeAt();
        // Increment the counter for this specific character.
        charOccurrences[charPos]++;
    }
    // Return the completed frequency array.
    return charOccurrences;
}

function intersectCounts(firstCounts, secondCounts) {
    // Loop through all 26 possible character positions (for 'a' through 'z').
    for (let k = 0; k < 26; k++) {
        // Update the count in the first array to be the minimum of the two corresponding counts.
        firstCounts[k] = Math.min(firstCounts[k], secondCounts[k]);
    }
    // Return the modified array containing the intersected frequencies.
    return firstCounts;
}

function ProcessInput(rawData) {
    // Split the entire input string by newline characters into an array of lines.
    rawData = rawData.split("\n");

    // Parse the first line to get the total number of strings that follow.
    const numLines = parseInt(rawData[0], 10);

    // Extract the actual data strings, starting from the second line up to 'numLines'.
    const textLines = rawData.slice(1, numLines + 1);

    // Compute the character frequencies for the very first string.
    let commonCounts = charCount(textLines[0]);

    // Iterate through the rest of the strings to find the common frequencies across all of them.
    for (let lineIdx = 1; lineIdx < textLines.length; lineIdx++) {
        // Calculate the frequencies for the current string.
        const currentCounts = charCount(textLines[lineIdx]);
        // Update 'commonCounts' by finding the minimum frequencies between the current common set and the new string's frequencies.
        commonCounts = intersectCounts(commonCounts, currentCounts);
    }

    // Initialize an empty string to build the final output.
    let finalOutput = "";
    // Loop through each character index from 0 to 25 (representing 'a' to 'z').
    for (let charVal = 0; charVal < 26; charVal++) {
        // For each character, append it to the 'finalOutput' string as many times as its common frequency dictates.
        for (let repeatCount = 0; repeatCount < commonCounts[charVal]; repeatCount++) {
            // Convert the 0-based character index back to its corresponding character.
            finalOutput += String.fromCharCode(charVal + "a".charCodeAt());
        }
    }
    // Output the final constructed string to the console.
    console.log(finalOutput);
}

// Read the entire content from standard input, decode it as UTF-8, and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
