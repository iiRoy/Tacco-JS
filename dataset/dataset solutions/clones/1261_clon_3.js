const fs = require('fs');

// Helper function to ensure the first and last characters of a row string are '#'
// This precisely replicates the behavior of `.replace(/(^\.|\.$)/g,'#')`
function ensureRowBordersAreHash(inputRowString) {
    const rowLength = inputRowString.length;

    if (rowLength === 0) {
        return '';
    }
    if (rowLength === 1) {
        return '#'; // A single character row is always '#'
    }

    let firstChar = inputRowString[0];
    let lastChar = inputRowString[rowLength - 1];
    const middlePart = inputRowString.substring(1, rowLength - 1);

    // Modify first character if it's a dot
    if (firstChar === '.') {
        firstChar = '#';
    }
    // Modify last character if it's a dot
    if (lastChar === '.') {
        lastChar = '#';
    }

    return firstChar + middlePart + lastChar;
}

// Helper function to generate a single row string for a rectangle pattern
function createRectangleRow(rowIndex, totalHeight, widthValue) {
    const isTopOrBottomRow = (rowIndex === 0 || rowIndex === totalHeight - 1);
    const baseCharacter = isTopOrBottomRow ? '#' : '.';

    // Generate the initial row content by repeating the base character
    const repeatedCharString = baseCharacter.repeat(widthValue);

    // Apply the specific border hash logic to ensure first and last characters are '#'
    return ensureRowBordersAreHash(repeatedCharString);
}

// Helper function to generate a complete rectangle string for given dimensions
function generateRectangle(heightValue, widthValue) {
    // If either dimension is zero, return an empty string as per observed behavior
    if (heightValue === 0 || widthValue === 0) {
        return '';
    }

    // Generate each row of the rectangle using Array.from for iteration
    const rectangleRows = Array.from({ length: heightValue }, (_, currentIdx) =>
        createRectangleRow(currentIdx, heightValue, widthValue)
    );

    // Join the generated rows with newline characters
    return rectangleRows.join('\n');
}

// --- Main execution flow ---

// Read the entire input content from standard input
const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');

// Extract the relevant part of the input: everything before the first "\n0 0"
// The original code uses `[0]` which implies it expects a match.
// If no match, `match` returns null, and `[0]` would throw.
// We assume valid input as per problem constraints.
const inputMatchResult = rawInputContent.match(/^[\s\S]*?(?=\n0 0)/);
const trimmedInputSegment = inputMatchResult ? inputMatchResult[0] : '';

// Split the trimmed segment into individual lines
const dimensionLines = trimmedInputSegment.split('\n');

// Parse each line into an array of numbers [H, W]
const parsedDimensionPairs = dimensionLines.map(line =>
    line.split(' ').map(Number)
);

// Filter out any invalid or empty dimension pairs that might result from parsing.
// This prevents errors like `RangeError: Invalid array length` if H or W are NaN or negative.
const validDimensionPairs = parsedDimensionPairs.filter(pair =>
    pair.length === 2 && !isNaN(pair[0]) && !isNaN(pair[1]) && pair[0] >= 0 && pair[1] >= 0
);

// Generate rectangle strings for each valid [H, W] pair
const generatedRectangleStrings = validDimensionPairs.map(dims => {
    const [currentHeight, currentWidth] = dims;
    return generateRectangle(currentHeight, currentWidth);
});

// Join the generated rectangle strings with double newlines, and append a final newline
const finalOutputString = generatedRectangleStrings.join('\n\n').concat('\n');

// Print the final result to standard output
console.log(finalOutputString);
