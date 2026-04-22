// Function to process textual input and compute the effective area of a region.
// This function interprets the input as dimensions for an outer rectangle and
// dimensions for strips to be 'removed' from its sides, then calculates
// the area of the remaining central rectangle.
function calculateEffectiveArea(inputStringData) {
    // Ensure the provided input is a valid string.
    if (typeof inputStringData !== 'string' || inputStringData.length === 0) {
        console.error("Error: Input data is either missing, not a string, or empty.");
        return; // Terminate execution if input is invalid.
    }

    // Break down the entire input block into individual lines.
    // We expect two lines: one for the initial container, one for the removed sections.
    const receivedLines = inputStringData.trim().split("\n");

    // Define the expected number of input lines.
    const REQUIRED_LINE_COUNT = 2;
    if (receivedLines.length < REQUIRED_LINE_COUNT) {
        console.error(`Error: Insufficient input lines. Expected at least ${REQUIRED_LINE_COUNT}, but found ${receivedLines.length}.`);
        return; // Terminate if minimum lines are not met.
    }

    // A reusable helper function to parse and validate dimension strings.
    // It expects an array of two string parts and a descriptive name.
    const processDimensionParts = (dimensionSegment, segmentDescription) => {
        // Validate that each dimension segment contains exactly two parts (e.g., "H W").
        if (dimensionSegment.length !== REQUIRED_LINE_COUNT) {
            console.error(`Error: Incorrect number of values for ${segmentDescription} dimensions. Expected 2, got ${dimensionSegment.length}.`);
            return [NaN, NaN]; // Signal an error by returning Not-a-Number.
        }

        // Convert string parts to numbers. `map(Number)` is a concise way to do this.
        const [firstValue, secondValue] = dimensionSegment.map(Number);

        // Verify that both parsed values are valid, non-negative numbers.
        if (isNaN(firstValue) || isNaN(secondValue) || firstValue < 0 || secondValue < 0) {
            console.error(`Error: Invalid numeric values detected for ${segmentDescription} dimensions. Dimensions must be non-negative numbers.`);
            return [NaN, NaN]; // Signal an error.
        }
        return [firstValue, secondValue];
    };

    // Parse the dimensions of the main, enclosing rectangle from the first line.
    const originalSizeComponents = receivedLines[0].split(" ");
    const [mainRectangleHeight, mainRectangleWidth] = processDimensionParts(originalSizeComponents, "main rectangle");
    if (isNaN(mainRectangleHeight) || isNaN(mainRectangleWidth)) return; // Exit if parsing failed.

    // Parse the dimensions of the strips to be subtracted from the main rectangle from the second line.
    const cutOutSizeComponents = receivedLines[1].split(" ");
    const [stripHeightToRemove, stripWidthToRemove] = processDimensionParts(cutOutSizeComponents, "removed strips");
    if (isNaN(stripHeightToRemove) || isNaN(stripWidthToRemove)) return; // Exit if parsing failed.

    // Implement a logical check: the dimensions to be removed should not exceed the original dimensions.
    // While the formula handles negative results, for a physical interpretation, this is a useful check.
    if (stripHeightToRemove > mainRectangleHeight || stripWidthToRemove > mainRectangleWidth) {
        console.warn(`Warning: The dimensions to be removed (${stripHeightToRemove}x${stripWidthToRemove}) are greater than the main rectangle's dimensions (${mainRectangleHeight}x${mainRectangleWidth}). This may lead to a non-positive effective area.`);
    }

    // Calculate the resulting height and width after the strips are hypothetically removed.
    // These intermediate variables make the calculation more explicit.
    const resultantHeight = mainRectangleHeight - stripHeightToRemove;
    const resultantWidth = mainRectangleWidth - stripWidthToRemove;

    // Compute the final effective area.
    // The formula (H-h)*(W-w) is an algebraically equivalent and often more intuitive
    // form of the original (H*W)-(h*W)-(H*w)+(h*w). This is a significant rewrite.
    const finalCalculatedArea = resultantHeight * resultantWidth;

    // Display the computed area to standard output.
    console.log(finalCalculatedArea);
}

// This block serves as the application's entry point.
// It attempts to read input from standard input (typically /dev/stdin in competitive programming environments)
// and then passes this content to our primary processing function.
try {
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    calculateEffectiveArea(fileContents);
} catch (inputError) {
    // If there's an issue reading the input file, log an error message.
    console.error("An error occurred while attempting to read input from /dev/stdin:", inputError.message);
}