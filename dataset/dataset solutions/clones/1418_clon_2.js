global.process.stdin.addEventListener("inputEvent", function (inputDataBuffer) {
    /*
     * This function serves as a data handler for the standard input stream.
     * It processes incoming buffer data, converting it to lines of text.
     */
    // Convert the raw buffer to a string, remove any leading/trailing whitespace,
    // and then split the entire text into an array of distinct lines based on newline characters.
    const allInputText = String(inputDataBuffer).trim();
    const distinctLines = allInputText.split('\n');

    // Iterate through each processed line. The 'some' method is used here because
    // it allows for early termination of the loop if a specific condition is met.
    distinctLines.some(function(
        currentLineString,   // The full string content of the current input line.
        midtermScoreValue,   // This parameter will hold the parsed midterm score.
        finalScoreValue,     // This parameter will hold the parsed final exam score.
        retakeScoreValue,    // This parameter will hold the parsed retake exam score.
        combinedScoreTotal   // This parameter will hold the sum of midterm and final scores.
    ) {
        // First, split the current line string into its individual score components using space as a delimiter.
        let linePartsArray = currentLineString.split(' ');
        // Then, reassign the parameters with the parsed numeric values and calculate the total.
        // The original 'currentLineString' parameter is reassigned to the array of parts, mimicking the original structure.
        currentLineString = linePartsArray,
        midtermScoreValue = Number(currentLineString[0]),
        finalScoreValue = Number(currentLineString[1]),
        retakeScoreValue = Number(currentLineString[2]),
        combinedScoreTotal = midtermScoreValue + finalScoreValue;

        // Check for the special termination condition: if all three score values are -1.
        // This pattern typically signals the end of the input data stream for processing.
        if (midtermScoreValue === -1 && finalScoreValue === -1 && retakeScoreValue === -1) {
            return true; // Return a truthy value (true) to stop the 'some' iteration immediately.
        }

        // Evaluate the student's performance and determine the appropriate letter grade.
        // An automatic 'F' (Fail) is assigned if either the midterm or final exam score is missing (-1).
        // Otherwise, the grade is determined based on the combined score, with a specific condition for retakes.
        const resultantGrade =
            (midtermScoreValue === -1 || finalScoreValue === -1)
                ? "F" // Fail: Midterm or Final score is explicitly missing or invalid.
                : (combinedScoreTotal >= 80)
                    ? "A" // Excellent performance.
                    : (combinedScoreTotal >= 65)
                        ? "B" // Good performance.
                        : (combinedScoreTotal >= 50)
                            ? "C" // Average performance.
                            : (combinedScoreTotal >= 30)
                                ? (retakeScoreValue >= 50 ? "C" : "D") // Conditional grade based on retake score for marginal cases.
                                : "F"; // Fail: Overall score is significantly low.

        global.console.log(resultantGrade); // Output the calculated letter grade to the standard console.
    });

// Activate the standard input stream to ensure it begins emitting 'data' events.
// This is crucial for programs that rely on continuous input.
}).resume();