// File system module for reading input
const fileSystemHandler = require('fs');

// Configuration constants for input processing and output generation
const standardInputPath = '/dev/stdin'; // Path to read input from
const characterEncoding = 'utf8'; // Encoding for file operations
const endOfInputSentinel = /\n0 0/; // Regular expression to find the termination sequence "0 0" on a new line
const borderCharacter = '#'; // Character used for rectangle borders
const internalCharacter = '.'; // Character used for the internal fill of hollow rectangles
const singleLineBreak = '\n'; // Standard newline character
const blockSeparatorString = '\n\n'; // Separator between generated rectangle blocks

/**
 * Generates a single row of an ASCII art rectangle based on its position and dimensions.
 * This function replicates the specific row generation logic of the original code,
 * handling solid and hollow patterns based on width.
 *
 * @param {number} currentRowIndex - The 0-based index of the row being generated.
 * @param {number} totalRectangleHeight - The total height (number of rows) of the rectangle.
 * @param {number} totalRectangleWidth - The total width (number of columns) of the rectangle.
 * @param {string} fillSymbol - The character to use for internal parts (e.g., '.').
 * @param {string} borderSymbol - The character to use for borders (e.g., '#').
 * @returns {string} The generated row string.
 */
function produceRectangleRow(
    currentRowIndex,
    totalRectangleHeight,
    totalRectangleWidth,
    fillSymbol,
    borderSymbol
) {
    // Handle invalid or zero width scenarios
    if (totalRectangleWidth <= 0) {
        return '';
    }

    // Determine if the current row is a top or bottom border row
    const isEdgeRow = (currentRowIndex === 0 || currentRowIndex === totalRectangleHeight - 1);

    let baseCharForThisRow;
    if (isEdgeRow) {
        baseCharForThisRow = borderSymbol;
    } else {
        baseCharForThisRow = fillSymbol;
    }

    // Create an initial row string by repeating the base character
    let constructedRowString = baseCharForThisRow.repeat(totalRectangleWidth);

    // Apply the specific modification logic for middle rows (initially all fillSymbol)
    // This mimics the original's `.replace(/(^\.|\.$)/g,'#')` behavior.
    if (baseCharForThisRow === fillSymbol) {
        if (totalRectangleWidth > 2) {
            // For widths greater than 2, only the first and last characters become borderSymbol.
            // E.g., "....." (W=5) becomes "#...#"
            constructedRowString = borderSymbol + constructedRowString.substring(1, totalRectangleWidth - 1) + borderSymbol;
        } else if (totalRectangleWidth > 0) {
            // For widths 1 or 2, if it's all fillSymbol, it becomes all borderSymbol.
            // E.g., "." (W=1) becomes "#"; ".." (W=2) becomes "##"
            constructedRowString = borderSymbol.repeat(totalRectangleWidth);
        }
        // If totalRectangleWidth is 0, constructedRowString is already empty, no change needed.
    }

    return constructedRowString;
}

/**
 * Orchestrates the entire process: reading input, parsing dimensions,
 * generating rectangles, and formatting the final output string.
 *
 * @returns {string} The complete formatted string of ASCII rectangles.
 */
function processAndAssembleOutput() {
    let rawDataBuffer;
    try {
        rawDataBuffer = fileSystemHandler.readFileSync(standardInputPath, characterEncoding);
    } catch (readOperationError) {
        console.error("Failed to read input from standard input:", readOperationError.message);
        // Depending on requirements, could rethrow or return an error indicator.
        // For this clone, we'll propagate the error similar to original's implicit crash.
        throw readOperationError;
    }

    // Extract the portion of the input before the termination sequence "0 0"
    const terminationMatch = rawDataBuffer.match(endOfInputSentinel);
    let relevantInputData = rawDataBuffer;
    if (terminationMatch) {
        relevantInputData = rawDataBuffer.slice(0, terminationMatch.index);
    }

    // Split the relevant input data into individual lines
    const inputDataLines = relevantInputData.split(singleLineBreak);

    const rectangleSpecifications = [];
    // Iterate over each line to parse height and width dimensions
    for (const currentLine of inputDataLines) {
        const trimmedLine = currentLine.trim();
        if (trimmedLine.length === 0) {
            continue; // Skip any empty lines
        }

        const dimensionParts = trimmedLine.split(' ');
        if (dimensionParts.length === 2) {
            const heightValue = Number(dimensionParts[0]);
            const widthValue = Number(dimensionParts[1]);

            // Basic validation to ensure valid positive numbers
            if (!isNaN(heightValue) && !isNaN(widthValue) && heightValue >= 0 && widthValue >= 0) {
                rectangleSpecifications.push({
                    height: heightValue,
                    width: widthValue
                });
            } else {
                console.warn(`Warning: Skipping line with invalid numeric dimensions: "${trimmedLine}"`);
            }
        } else {
            console.warn(`Warning: Skipping malformed input line: "${trimmedLine}"`);
        }
    }

    const compiledRectangleBlocks = [];

    // For each parsed specification, generate the full rectangle ASCII art
    for (const spec of rectangleSpecifications) {
        const currentHeight = spec.height;
        const currentWidth = spec.width;

        // If height or width is zero, the original code would result in an empty block
        // (empty array of rows joined, or rows of empty strings joined).
        // We explicitly handle this for clarity.
        if (currentHeight === 0 || currentWidth === 0) {
            compiledRectangleBlocks.push('');
            continue;
        }

        const individualRectangleRows = [];
        for (let r = 0; r < currentHeight; r++) {
            individualRectangleRows.push(
                produceRectangleRow(
                    r,
                    currentHeight,
                    currentWidth,
                    internalCharacter,
                    borderCharacter
                )
            );
        }
        compiledRectangleBlocks.push(individualRectangleRows.join(singleLineBreak));
    }

    // Join all generated rectangle blocks with the specified separator
    let finalRenderedOutput = compiledRectangleBlocks.join(blockSeparatorString);

    // Append a final newline character to the entire output string,
    // mimicking the original's `.concat('\n')` behavior even for empty output.
    finalRenderedOutput += singleLineBreak;

    return finalRenderedOutput;
}

// Execute the main processing function and print the generated output
const generatedAsciiOutput = processAndAssembleOutput();
console.log(generatedAsciiOutput);