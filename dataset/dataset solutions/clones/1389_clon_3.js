(function processInputRecords(sourceContent) {
    // This script reads a multi-line string input, processes each line,
    // and outputs pairs of numeric values in reverse order.
    // Processing continues until a line is encountered where either of the first
    // two parsed numbers is zero, or if the line is malformed.

    // Step 1: Split the entire input string into an array of individual raw line strings.
    const rawLineStrings = sourceContent.split("\n");

    let parsedRecords = []; // Renamed 'data' to 'parsedRecords'

    // Step 2: Iterate through each raw line to parse it into an array of segments.
    // Using a map operation to transform raw lines into structured records.
    // This replaces the original 'for' loop for populating the 'data' array.
    parsedRecords = rawLineStrings.map(individualLine => {
        // Splitting each line by spaces. An empty line "" will result in [""]
        // which mimics how the original `split(" ")` behaves for such input.
        return individualLine.split(" ");
    });

    let currentRecordPointer = 0; // Renamed 'index' to 'currentRecordPointer'

    // Main processing loop: Iterates through the parsed records.
    // The loop continues until an explicit break condition is met.
    while (currentRecordPointer < parsedRecords.length) {
        const activeRecord = parsedRecords[currentRecordPointer];

        // Guard condition: Check if the current record is valid and has at least two segments.
        // If not, it's considered an invalid termination point, mimicking how
        // the original code would implicitly stop on malformed lines.
        if (!activeRecord || activeRecord.length < 2) {
            break; // Terminate processing for malformed records.
        }

        // Extract the string representations of the first two segments.
        const firstSegmentString = activeRecord[0];
        const secondSegmentString = activeRecord[1];

        // Explicitly convert string segments to numeric values.
        // Using Number() for clear type conversion, replacing the unary '+' operator.
        const firstNumericalValue = Number(firstSegmentString);
        const secondNumericalValue = Number(secondSegmentString);

        // Termination logic: The original code stops if either of the first two
        // numerically converted values is zero. This also implicitly handles
        // cases where conversion results in NaN (e.g., non-numeric strings),
        // as `NaN === 0` is false, but `NaN != 0` is true.
        // To precisely replicate the original's `+value != 0` behavior:
        // The loop continues if `+value1 != 0 && +value2 != 0`.
        // So, we break if `+value1 == 0 || +value2 == 0`.
        // This includes cases where `Number()` results in `0` (e.g., `""`, `"0"`)
        // or `NaN` (e.g., `"abc"`).
        if (firstNumericalValue === 0 || secondNumericalValue === 0 || isNaN(firstNumericalValue) || isNaN(secondNumericalValue)) {
            break; // Stop if either value is 0 or cannot be parsed as a number.
        }

        // Output the values: second value followed by the first, separated by a space.
        // Using a template literal for modern string concatenation.
        console.log(`${secondNumericalValue} ${firstNumericalValue}`);

        // Advance the pointer to process the next record in sequence.
        currentRecordPointer++;
    }
})(require("fs").readFileSync("/dev/stdin", "utf8")); // Standard input reading remains external.