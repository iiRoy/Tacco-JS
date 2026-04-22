// This function is responsible for reading data from the standard input stream.
// It acts as a robust input acquisition mechanism for the program.
function acquireStreamData() {
    // Import the Node.js file system module. Using 'const' for better practice.
    const fileSystemHandler = require("fs");
    // Define the standard input file path for Unix-like systems.
    const standardInputPath = "/dev/stdin";

    try {
        // Synchronously read the entire content of the standard input as a UTF-8 string.
        const rawInputContent = fileSystemHandler.readFileSync(standardInputPath, "utf8");
        // Split the content into an array of lines.
        // It handles both Unix-style (\n) and Windows-style (\r\n) newlines.
        // Filters out any empty lines that might result from splitting,
        // ensuring only meaningful data lines are processed.
        const processedLines = rawInputContent.split(/\r?\n/).filter(lineSegment => lineSegment.trim().length > 0);
        return processedLines;
    } catch (dataReadError) {
        // Log an error if reading from stdin fails, providing diagnostic information.
        console.error("Critical Error: Failed to obtain data from standard input. Details:", dataReadError.message);
        // In case of an error, return an empty array to prevent subsequent processing
        // from encountering undefined data, allowing the program to exit gracefully.
        return [];
    }
}

// The main processing loop iterates over each line obtained from the standard input.
// The 'every' array method is employed here to allow for conditional early termination
// of the processing sequence, which is essential for the problem's requirements.
acquireStreamData().every(function(currentInputRow, lineIndex) {
    // Trim whitespace from the current line to normalize it.
    const trimmedRow = currentInputRow.trim();

    // If the line is empty after trimming, it's considered non-essential.
    // We simply skip it and continue to the next line without further processing.
    if (!trimmedRow) {
        return true; // Return 'true' to indicate continuation of the 'every' loop.
    }

    // Split the trimmed line by spaces to extract individual dimension tokens.
    // For example, "10 20" becomes ["10", "20"].
    const dimensionComponents = trimmedRow.split(' ');

    // Validate if there are at least two components (for height and width).
    // If not, it's a malformed line; a warning is logged, and processing continues.
    if (dimensionComponents.length < 2) {
        console.warn(`Input Warning: Line ${lineIndex + 1} is malformed ("${currentInputRow}"). Expected two numbers, skipping.`);
        return true; // Continue to the next input line.
    }

    // Parse the first component as the number of rows (grid height).
    const gridHeight = parseInt(dimensionComponents[0], 10);
    // Parse the second component as the number of columns (grid width).
    const gridWidth = parseInt(dimensionComponents[1], 10);

    // Perform validation on the parsed dimensions.
    // If dimensions are not valid numbers, or are negative, it's an error state
    // that requires stopping the entire processing sequence.
    if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight < 0 || gridWidth < 0) {
        console.error(`Processing Error: Invalid grid dimensions (${dimensionComponents[0]}, ${dimensionComponents[1]}) detected on line ${lineIndex + 1}. Terminating all operations.`);
        return false; // Return 'false' to halt the 'every' loop immediately.
    }

    // A specific input of "0 0" acts as a termination signal for the program.
    // If this condition is met, no further grids are generated or printed.
    if (gridHeight === 0 && gridWidth === 0) {
        // console.info("Termination signal '0 0' received. Halting grid generation."); // Optional logging
        return false; // Stop the 'every' loop.
    }

    // Initialize an array to hold the rows of the checkered pattern.
    const generatedPatternRows = new Array(gridHeight);

    // Iterate through each row index to construct the pattern row by row.
    for (let currentGridRowIdx = 0; currentGridRowIdx < gridHeight; currentGridRowIdx++) {
        // Determine the base pattern unit for the current row based on its index parity.
        // Even-indexed rows start with '#.', odd-indexed rows start with '.#'.
        const rowPatternUnit = (currentGridRowIdx % 2 === 0) ? '#.' : '.#';

        // Create an extended string by repeating the pattern unit.
        // We repeat it enough times to ensure it's longer than or equal to the required grid width.
        // Adding 1 to Math.ceil(gridWidth / 2) guarantees sufficient length for slicing.
        const oversizedPatternString = rowPatternUnit.repeat(Math.ceil(gridWidth / 2) + 1);

        // Slice the oversized pattern string to exactly the desired grid width.
        // This handles cases where gridWidth is odd or even seamlessly.
        generatedPatternRows[currentGridRowIdx] = oversizedPatternString.substring(0, gridWidth);
    }

    // Join all the constructed pattern rows with newline characters to form the final output block.
    // An additional newline is appended at the end as per common output formatting.
    const finalRenderedOutput = generatedPatternRows.join("\n") + "\n";

    // Print the complete generated pattern block to the console.
    console.log(finalRenderedOutput);

    // Return 'true' to signal that the 'every' loop should continue to the next input line.
    return true;
});