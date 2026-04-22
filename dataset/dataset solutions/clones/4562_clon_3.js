function ProcessInputData(rawDataString) {
    // This function processes raw string input, intended to represent a grid of characters,
    // and outputs a visually framed version of this grid to the standard console.
    // It applies robust parsing, validation, and flexible output formatting.

    // 1. Initial Input Segmentation: Split the entire input string into an array of individual lines.
    const allInputLines = rawDataString.split('\n');

    // Type III: Added robust validation for the presence of input data.
    if (allInputLines.length === 0 || allInputLines[0].trim() === '') {
        // If the input is empty or the first line (expected dimensions) is blank,
        // log an error and exit the function gracefully.
        console.error('Error: No data provided or the input stream was empty.');
        return;
    }

    // 2. Dimension Extraction: Parse the grid's height and width from the very first line.
    // The format is expected to be "HEIGHT WIDTH" separated by a single space.
    const dimensionTokens = allInputLines[0].split(' ');

    // Type III: Enhanced validation for the dimension format.
    if (dimensionTokens.length < 2) {
        console.error('Error: Dimension line is malformed. Expected two space-separated integers (e.g., "5 10").');
        return;
    }

    // Convert string tokens into integer values for grid dimensions.
    const desiredGridHeight = parseInt(dimensionTokens[0].trim(), 10);
    const desiredGridWidth = parseInt(dimensionTokens[1].trim(), 10);

    // Type III: Comprehensive validation for the numeric values of dimensions.
    if (isNaN(desiredGridHeight) || isNaN(desiredGridWidth) || desiredGridHeight <= 0 || desiredGridWidth <= 0) {
        console.error(`Error: Invalid grid dimensions detected. Height: ${desiredGridHeight}, Width: ${desiredGridWidth}. ` +
                      `Both must be positive integer values.`);
        return;
    }

    // Type III: Introduce a constant for the character used to draw the frame.
    const frameBoundaryChar = '#';

    // Type III: Pre-computation of the top and bottom border lines.
    // These lines span the grid width plus two characters for the left and right frame boundaries.
    const computedHorizontalBorder = frameBoundaryChar.repeat(desiredGridWidth + 2);

    // 3. Output Generation: Start by printing the top border.
    console.log(computedHorizontalBorder);

    // 4. Content Line Processing: Iterate through each expected content row.
    // The actual content lines start from the second line of the input array (index 1),
    // as the first line (index 0) was consumed for dimensions.
    for (let currentContentRowIndex = 0; currentContentRowIndex < desiredGridHeight; currentContentRowIndex++) {
        // Calculate the actual index in 'allInputLines' for the current content row.
        const sourceLineArrayPosition = currentContentRowIndex + 1;

        // Type III: Add a guard clause to handle insufficient content lines.
        if (sourceLineArrayPosition >= allInputLines.length) {
            console.warn(`Warning: Expected ${desiredGridHeight} content rows but found only ${currentContentRowIndex}. ` +
                         `Padding remaining rows with empty space.`);
            // If content lines are missing, print an empty framed row to maintain visual structure.
            console.log(frameBoundaryChar + ' '.repeat(desiredGridWidth) + frameBoundaryChar);
            continue; // Proceed to the next iteration, potentially printing more empty rows.
        }

        // Retrieve the raw content string for the current row.
        const originalContentString = allInputLines[sourceLineArrayPosition];

        // Type III: Introduce an intermediate variable to handle content string adjustments.
        let adjustedContentString = originalContentString;

        // Type III: Implement checks for content line length discrepancies.
        if (originalContentString.length > desiredGridWidth) {
            console.warn(`Warning: Content line ${sourceLineArrayPosition} is longer than grid width (${desiredGridWidth}). ` +
                         `Truncating excess characters.`);
            adjustedContentString = originalContentString.substring(0, desiredGridWidth);
        } else if (originalContentString.length < desiredGridWidth) {
            console.warn(`Warning: Content line ${sourceLineArrayPosition} is shorter than grid width (${desiredGridWidth}). ` +
                         `Padding with spaces.`);
            // Use String.prototype.padEnd for efficient padding.
            adjustedContentString = originalContentString.padEnd(desiredGridWidth, ' ');
        }

        // Construct the final output line by concatenating the frame character,
        // the (potentially adjusted) content, and the closing frame character.
        const fullyFramedOutputLine = frameBoundaryChar + adjustedContentString + frameBoundaryChar;

        // Print the completed framed content line to the console.
        console.log(fullyFramedOutputLine);
    }

    // 5. Final Output: Print the bottom border to complete the framed grid.
    console.log(computedHorizontalBorder);
}

// This section is responsible for reading standard input and initiating the processing.
// It is designed to be robust against common I/O issues.

// Type III: Renamed the 'fs' module variable for clarity and distinctness.
const fileAccessModule = require("fs");

// Type III: Defined the standard input path as a constant, improving maintainability.
const systemInputDevicePath = "/dev/stdin";

// Type III: Encapsulated the file reading operation within a try-catch block
// to gracefully handle potential file system errors.
try {
    // Synchronously read all data from the standard input device, assuming UTF-8 encoding.
    const acquiredRawInputData = fileAccessModule.readFileSync(systemInputDevicePath, "utf8");

    // Invoke the primary function to process the acquired input data.
    ProcessInputData(acquiredRawInputData);
} catch (fileReadError) {
    // If an error occurs during the file read process (e.g., file not found, permissions issue),
    // log the error details and terminate the application with a non-zero exit code.
    console.error(`An input/output error occurred while attempting to read from ${systemInputDevicePath}:`, fileReadError.message);
    process.exit(1); // Indicate an error occurred.
}