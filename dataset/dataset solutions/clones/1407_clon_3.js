// This module is responsible for handling file system operations, specifically reading input.
const fileSystemModule = require("fs");

// Define a constant for the character used to draw the grid patterns.
const patternCharacter = '#';

// Define a constant for the standard input file path on Unix-like systems.
const standardInputPath = "/dev/stdin";

/**
 * Retrieves and processes input data from a specified file path.
 * This function reads the file content, splits it into individual lines,
 * and performs basic cleaning by trimming whitespace and filtering out empty lines.
 *
 * @param {string} inputSourcePath - The path to the file from which to read input.
 * @returns {string[]} An array of cleaned strings, each representing a line of input.
 */
function acquireProcessedInputLines(inputSourcePath) {
    let rawFileContents;
    try {
        // Attempt to read the entire file synchronously, ensuring UTF-8 encoding.
        rawFileContents = fileSystemModule.readFileSync(inputSourcePath, "utf8");
    } catch (readError) {
        // If an error occurs during file reading, log a warning and return an empty array.
        console.error(`Warning: Could not read from input source "${inputSourcePath}". Error: ${readError.message}`);
        return [];
    }

    // Split the raw content by newline characters, accommodating both Unix (\n) and Windows (\r\n) styles.
    // Then, map over the resulting lines to trim any leading/trailing whitespace.
    // Finally, filter out any lines that become empty after trimming, ensuring only meaningful input is kept.
    return rawFileContents.split(/\r?\n/).map(entry => entry.trim()).filter(cleanedEntry => cleanedEntry.length > 0);
}

/**
 * Executes the main application logic: reading dimension pairs from input,
 * generating character grids based on these dimensions, and printing them to the console.
 * The process terminates upon encountering a dimension pair of 0 0.
 */
function executeGridGenerationProcess() {
    // Obtain the list of processed input lines, each expected to contain two space-separated numbers.
    const inputLineRecords = acquireProcessedInputLines(standardInputPath);

    // Iterate over each record (line) obtained from the input.
    for (const currentRecord of inputLineRecords) {
        // Split the current record by space to get potential dimension components.
        const dimensionComponents = currentRecord.split(' ');

        // Implement a guard clause: ensure exactly two components are present.
        if (dimensionComponents.length !== 2) {
            console.warn(`Skipping malformed input record: "${currentRecord}". Expected two space-separated numbers.`);
            continue; // Proceed to the next record.
        }

        // Parse the height and width values from the components, explicitly using base 10.
        const targetHeight = parseInt(dimensionComponents[0], 10);
        const targetWidth = parseInt(dimensionComponents[1], 10);

        // Another guard clause: validate that both parsed values are indeed numbers.
        if (isNaN(targetHeight) || isNaN(targetWidth)) {
            console.warn(`Skipping record with non-numeric dimensions: "${currentRecord}".`);
            continue; // Proceed to the next record.
        }

        // Check for the designated termination condition: both dimensions are zero.
        if (targetHeight === 0 && targetWidth === 0) {
            // If the termination sequence is found, exit the processing loop.
            break;
        }

        // Guard clause: ensure dimensions are positive for grid generation.
        if (targetHeight <= 0 || targetWidth <= 0) {
            console.warn(`Skipping record with non-positive dimensions (H=${targetHeight}, W=${targetWidth}): "${currentRecord}". Grid cannot be generated.`);
            continue; // Proceed to the next record.
        }

        // Construct a single row of the grid by repeating the pattern character.
        const singleGridRow = patternCharacter.repeat(targetWidth);

        // Construct the full grid output string. This involves repeating the single row
        // followed by a newline, for the specified height.
        const completeGridOutput = (singleGridRow + '\n').repeat(targetHeight);

        // Output the generated grid to the console.
        console.log(completeGridOutput);
    }
}

// Initiate the grid generation process.
executeGridGenerationProcess();