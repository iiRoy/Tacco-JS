// A helper constant for the standard input file path.
const standardInputDevicePath = '/dev/stdin';
// Another helper constant for the character encoding.
const utf8EncodingName = 'utf8';

// Regex for extracting the main content block before the '0 0' sentinel.
const contentBlockExtractor = /^[\s\S]*?(?=\n0 0)/g;
// Regex for correcting edge characters in interior rows.
const edgeCorrectionPattern = /(^\.|\.$)/g;

// Character constants used for drawing the rectangles.
const boundarySymbol = '#';
const fillSymbol = '.';
// Separator constants for joining strings.
const spaceDelimiter = ' ';
const singleNewlineSeparator = '\n';
const doubleNewlineBlockSeparator = '\n\n';

// Aliases for global functions/constructors/methods to change their identifier names.
const numericConverter = Number;
const getMaximumValue = Math.max;


// Begin processing input data to generate graphical output.
const discAccess = require('fs'); // Obtain the file system module.

const finalDisplay = discAccess.readFileSync(standardInputDevicePath, utf8EncodingName)
    // Extract the relevant portion of the input, ignoring trailing data.
    .match(contentBlockExtractor)[0]
    // Break the input string into separate lines of text.
    .split(singleNewlineSeparator)
    // Transform each line into a pair of numerical dimensions.
    .map(inputLine => inputLine.split(spaceDelimiter)
        .map(numericConverter))
    // Iterate through each dimension pair to construct a unique ASCII art rectangle.
    .map(([verticalDim, horizontalDim]) =>
        // Create an array representing row indices, from 0 to verticalDim - 1.
        [...Array(verticalDim).keys()]
        // For each index, generate the string content for that specific row.
        .map((currentIdx, arrayPos, entireSequence) => {
            // Determine if the current row is either the very first or the very last.
            const isBorderRow = (!arrayPos || arrayPos === getMaximumValue(...entireSequence));
            // Select the appropriate character based on whether it's a border.
            const rowBaseChar = isBorderRow ? boundarySymbol : fillSymbol;
            return rowBaseChar
                // Replicate the chosen character to match the rectangle's width.
                .repeat(horizontalDim)
                // Adjust the start/end characters for non-border rows to ensure proper edges.
                .replace(edgeCorrectionPattern, boundarySymbol);
        })
        // Combine all row strings for the current rectangle with single newlines.
        .join(singleNewlineSeparator))
    // Join all generated rectangle blocks, separating them with double newlines.
    .join(doubleNewlineBlockSeparator)
    // Add a final newline character at the very end of the entire output string.
    .concat(singleNewlineSeparator);

// Print the complete ASCII art display to the standard output.
console.log(finalDisplay);