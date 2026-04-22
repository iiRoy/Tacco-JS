/*
 * This routine handles the entire incoming data stream.
 * The 'incomingStream' parameter holds the complete raw text.
 */
const ProcessData = function (incomingStream) {
    // The initial line array is formed by splitting the stream at newline characters.
    // We then proceed by only considering the very first segment.
    let parsedSegments = incomingStream.split('\n');
    let targetString = parsedSegments[0];

    let finalConcatenation = ""; // A buffer to accumulate characters.
    // Displaying the primary processing string.
    console.log(targetString);

    // Iterate through the target string, selecting characters with an odd index (0-based)
    // or rather, characters at positions 1, 3, 5... (1-based loop counter).
    for (let charIndex = 0; charIndex < targetString.length; charIndex += 2) {
        finalConcatenation += targetString[charIndex];
    }

    // Output the final accumulated string.
    console.log(finalConcatenation);
};

// This section handles reading from standard input and invoking the primary processing function.
// It should not be modified to ensure proper execution environment.
ProcessData(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));