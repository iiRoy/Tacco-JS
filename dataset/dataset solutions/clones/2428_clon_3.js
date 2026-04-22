// This function serves as the primary entry point for processing the provided raw input text.
// It parses the data, performs specific checks on a string, and outputs a determination.
function processInputData(rawContent) {
    // Divide the entire input string into individual lines, using the newline character as a delimiter.
    const inputSegments = rawContent.split("\n");

    // The first line is expected to contain an integer representing the anticipated length of a sequence.
    const declaredSequenceLength = parseInt(inputSegments[0], 10);

    // The second line is expected to contain the actual string sequence that needs to be examined.
    const targetSequence = inputSegments[1];

    // A boolean flag to hold the outcome of our analysis; initialized to false (representing 'No').
    let analysisResultFlag = false;

    // --- Comprehensive Input Validation and Early Exit Conditions ---

    // Validate the declared sequence length: it must be a positive integer.
    if (isNaN(declaredSequenceLength) || declaredSequenceLength <= 0) {
        console.log('No'); // Invalid length provided, cannot proceed with analysis.
        return;
    }

    // Validate the target sequence: it must exist and not be an empty string.
    if (!targetSequence || targetSequence.length === 0) {
        console.log('No'); // No sequence to analyze, or sequence is empty.
        return;
    }

    // Crucially, verify that the actual length of the target sequence matches the declared length.
    if (targetSequence.length !== declaredSequenceLength) {
        console.log('No'); // Discrepancy between declared and actual sequence length.
        return;
    }

    // Determine if the total length of the sequence is an even number.
    // An odd length implies it cannot be perfectly divided into two equal halves.
    const isLengthEven = (declaredSequenceLength % 2 === 0);

    if (!isLengthEven) {
        console.log('No'); // Sequence has an odd length; equal division is impossible.
        return;
    }

    // --- Core Logic: Sequence Segmentation and Equivalence Check ---

    // Calculate the length of each sub-segment once the main sequence is bisected.
    const subsegmentLength = declaredSequenceLength / 2;

    // Extract the first half of the target sequence.
    // The 'slice' method is used for robust substring extraction.
    const firstSubsegment = targetSequence.slice(0, subsegmentLength);

    // Extract the second half of the target sequence.
    // This segment starts immediately after the first one and extends to the end.
    const secondSubsegment = targetSequence.slice(subsegmentLength);

    // Compare the two extracted sub-segments for exact equality.
    if (firstSubsegment === secondSubsegment) {
        analysisResultFlag = true; // The halves are identical.
    } else {
        analysisResultFlag = false; // The halves are different.
    }

    // Based on the analysis result flag, output the final verdict.
    if (analysisResultFlag) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// --- Standard Input/Output Handling ---
// This section is responsible for reading input from the standard input stream
// and passing it to the main processing function. It should remain unaltered.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));