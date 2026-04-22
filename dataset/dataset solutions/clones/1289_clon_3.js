// Configure the standard input stream to interpret incoming data as UTF-8 encoded text.
// This ensures proper character decoding, especially for multi-byte characters,
// and prepares the stream for receiving textual input.
process.stdin.setEncoding('utf-8');

/**
 * Utility function to safely parse a string into an integer.
 * It uses radix 10 for decimal interpretation to prevent unexpected base conversions.
 * If the input string cannot be parsed into a valid number (e.g., it's undefined, null, or non-numeric),
 * this function will return NaN (Not-a-Number), aligning with the default behavior of `parseInt`.
 * This NaN propagation is crucial for the subsequent grading logic to implicitly handle invalid inputs.
 *
 * @param {string | undefined} inputStringSegment - The string part to be parsed.
 * @returns {number} The parsed integer value or NaN if parsing fails.
 */
const retrieveNumericalComponent = (inputStringSegment) => {
    // Attempt to convert the provided string segment into an integer.
    // Using parseInt with a radix of 10 explicitly specifies decimal interpretation.
    const parsedNumericalValue = parseInt(inputStringSegment, 10);
    return parsedNumericalValue;
};

/**
 * Determines the final letter grade based on a calculated total score
 * and an additional, supplementary criterion used for specific score ranges.
 * This function encapsulates the core grading logic.
 *
 * @param {number} accumulatedScore - The primary score obtained from the first two inputs.
 * @param {number} auxiliaryCriterionValue - An additional score or value used for conditional grading.
 * @returns {string} A single character representing the assigned letter grade (e.g., "A", "B", "C", "D", "F").
 */
const deriveAssessmentGrade = (accumulatedScore, auxiliaryCriterionValue) => {
    // The grading system follows a series of thresholds.
    // If 'accumulatedScore' is NaN (due to invalid input), all comparison checks will fail,
    // causing the function to eventually return "F", which is a robust way to handle such cases.
    if (accumulatedScore >= 80) {
        return "A"; // Excellent performance.
    } else if (accumulatedScore >= 65) {
        return "B"; // Very good performance.
    } else if (accumulatedScore >= 50) {
        return "C"; // Good performance.
    } else if (accumulatedScore >= 30) {
        // For scores falling within the 30-49 range, an additional criterion is evaluated.
        if (auxiliaryCriterionValue >= 50) {
            return "C"; // The supplementary criterion boosts the grade to 'C'.
        } else {
            return "D"; // Otherwise, a 'D' is assigned in this range.
        }
    } else {
        // If no other conditions are met, including scores below 30 or any NaN results,
        // the default grade is "F".
        return "F"; // Failing grade.
    }
};

// Attach an event listener to the standard input stream.
// This function will be asynchronously invoked whenever new data becomes available on stdin.
process.stdin.on('data', function (incomingDataBuffer) {
    // Convert the incoming data buffer to a string, remove any leading/trailing whitespace
    // (including newline characters), and then split the string into an array of
    // individual components based on one or more whitespace characters.
    const inputSegments = String(incomingDataBuffer).trim().split(/\s+/);

    // Extract and parse the three primary numerical components from the input segments.
    // If a segment is missing (e.g., less than 3 numbers provided), `inputSegments[index]`
    // will be `undefined`, and `retrieveNumericalComponent` will correctly yield `NaN`.
    const firstInputComponent = retrieveNumericalComponent(inputSegments[0]);
    const secondInputComponent = retrieveNumericalComponent(inputSegments[1]);
    const thirdInputComponent = retrieveNumericalComponent(inputSegments[2]);

    // Implement a specific termination condition: if all three parsed components are -1,
    // the process should gracefully exit. This serves as an explicit stop signal.
    if (firstInputComponent === -1 && secondInputComponent === -1 && thirdInputComponent === -1) {
        process.exit(0); // Terminate the process with a success code.
    }

    // Calculate the effective scores for the first two components.
    // According to the logic, a value of -1 for these components should be treated as 0
    // when contributing to the total cumulative score.
    const effectiveValueOne = (firstInputComponent === -1) ? 0 : firstInputComponent;
    const effectiveValueTwo = (secondInputComponent === -1) ? 0 : secondInputComponent;

    // Compute the total cumulative score by summing the two effective values.
    const totalOverallScore = effectiveValueOne + effectiveValueTwo;

    // Determine the final assessment grade using the dedicated grading function.
    // The third input component is passed as the auxiliary criterion.
    const finalAssessmentGrade = deriveAssessmentGrade(totalOverallScore, thirdInputComponent);

    // Output the determined grade to the standard output.
    console.log(finalAssessmentGrade);
});