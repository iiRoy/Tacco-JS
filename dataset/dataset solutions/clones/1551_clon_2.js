// This function processes the provided input string.
function ProcessInput(rawData) {
    // Split the raw input into an array of lines.
    const dataRows = rawData.split("\n");

    // The first line is the source string.
    const sourceString = dataRows[0];
    // The second line is the target string.
    const targetString = dataRows[1];

    // Initialize the minimum difference count with the length of the target string.
    // This assumes the worst case where all characters are different.
    let minDiffCount = targetString.length;

    // If the target string is empty, there are no differences.
    if (targetString.length === 0) {
        return console.log(0);
    }

    // Iterate through all possible starting positions for the target string within the source string.
    // The loop runs from the beginning of the source string up to the point where the target string
    // can still fully fit within the remaining part of the source string.
    for (let outerIdx = 0; outerIdx <= sourceString.length - targetString.length; outerIdx++) {
        // Initialize a counter for differences in the current window.
        let currentDiffs = 0;

        // Compare characters of the target string with the current window of the source string.
        for (let innerIdx = 0; innerIdx < targetString.length; innerIdx++) {
            // Get the character from the source string at the current window position.
            const charFromSource = sourceString.substr(outerIdx + innerIdx, 1);
            // Get the character from the target string.
            const charFromTarget = targetString.substr(innerIdx, 1);

            // If the characters do not match, increment the difference counter.
            if (charFromSource !== charFromTarget) {
                currentDiffs = currentDiffs + 1;
            }
        }

        // If the current window has fewer differences than the previously recorded minimum, update the minimum.
        if (currentDiffs < minDiffCount) {
            minDiffCount = currentDiffs;
        }
    }

    // Output the final minimum difference count.
    console.log(minDiffCount);
}

// Do not modify the following line. It handles reading input and calling the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
