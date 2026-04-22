function createSolidRowPattern(length, characterSymbol) {
    // Ensures a non-negative length for pattern generation.
    // The Array(N+1).join(char) pattern creates N repetitions of 'char'.
    // For example, if length is 5, Array(6).join('#') results in "#####".
    const effectiveLength = Math.max(0, Math.floor(length));
    return Array(effectiveLength + 1).join(characterSymbol);
}

function createHollowRowPattern(totalWidth, outerSymbol, innerSymbol) {
    // Ensures a non-negative total width.
    const effectiveWidth = Math.max(0, Math.floor(totalWidth));

    if (effectiveWidth <= 0) {
        return ""; // No width means no pattern.
    }
    if (effectiveWidth === 1) {
        return outerSymbol; // For width 1, it's just the outer symbol.
    }
    // A hollow row consists of an outer symbol, (width-2) inner symbols, and another outer symbol.
    // Array(effectiveWidth - 1).join(innerSymbol) generates (width-2) inner symbols.
    // For width 3, Array(2).join('.') results in ".".
    return outerSymbol + Array(effectiveWidth - 1).join(innerSymbol) + outerSymbol;
}

// Main function responsible for processing the entire input dataset.
function ProcessInputData(rawInputString) {
    // Divide the raw input string into an array of individual lines.
    const inputLines = rawInputString.split("\n");

    // A control flag to manage the termination condition ("0 0").
    let continueProcessing = true;

    // Iterate through each line provided in the input.
    for (const currentLine of inputLines) {
        // If the termination condition has been met, exit the loop.
        if (!continueProcessing) {
            break;
        }

        // Clean up the current line by removing leading/trailing whitespace.
        const cleanedLine = currentLine.trim();

        // Skip any lines that are empty after trimming.
        if (cleanedLine.length === 0) {
            continue;
        }

        // Parse the line, expecting two space-separated numerical dimensions.
        const dimensionParts = cleanedLine.split(" ");
        const heightDimension = parseInt(dimensionParts[0], 10); // Explicitly use base 10.
        const widthDimension = parseInt(dimensionParts[1], 10);   // Explicitly use base 10.

        // Check if the current line represents the termination sequence "0 0".
        if (heightDimension === 0 && widthDimension === 0) {
            continueProcessing = false; // Set flag to stop further iterations.
            continue; // Skip processing this "0 0" line itself.
        }

        // Perform basic validation on the parsed dimensions.
        // Ensure they are valid numbers and non-negative.
        if (isNaN(heightDimension) || isNaN(widthDimension) || heightDimension < 0 || widthDimension < 0) {
            // Report an error for malformed or invalid input dimensions.
            console.error(`Error: Invalid or negative dimensions detected in line "${currentLine}". Skipping this entry.`);
            continue; // Move to the next line.
        }

        // An array to accumulate the lines that form the final rectangular pattern.
        const patternLineSegments = [];

        // Construct the top border of the rectangle.
        const topPatternBorder = createSolidRowPattern(widthDimension, '#');
        patternLineSegments.push(topPatternBorder);

        // Generate the internal hollow rows.
        // The original logic with Array(h-1).join(X) effectively creates (h-2) repetitions of X.
        // This means hollow rows only appear when height is 3 or more.
        if (heightDimension >= 3) {
            const internalHollowRow = createHollowRowPattern(widthDimension, '#', '.');
            for (let k = 0; k < heightDimension - 2; k++) {
                patternLineSegments.push(internalHollowRow);
            }
        }

        // Construct the bottom border of the rectangle.
        // This border is always present if the height is at least 1.
        if (heightDimension >= 1) {
            const bottomPatternBorder = createSolidRowPattern(widthDimension, '#');
            patternLineSegments.push(bottomPatternBorder);
        }

        // Assemble all generated pattern lines into a single string,
        // using newline characters as separators and appending a final newline
        // to match the original output's trailing newline.
        const finalRenderedPattern = patternLineSegments.join("\n") + "\n";

        // Output the complete pattern to the console.
        console.log(finalRenderedPattern);
    }
}

// Entry point: Read the entire content of standard input (stdin)
// and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));