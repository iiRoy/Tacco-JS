/*
 * This module processes a specific color sequence transformation.
 * It takes a raw string input, parses numerical components,
 * applies a series of modifications, and then verifies
 * if the final sequence meets a specific ascending order.
 */
function processColorSequence(rawData) {
    // Standardize input by removing leading/trailing whitespace
    const cleanedData = rawData.trim();

    // Split the input into individual lines for processing
    // A robust approach would check for sufficient lines
    const dataLines = cleanedData.split('\n');

    // Ensure we have at least two lines of input
    if (dataLines.length < 2) {
        console.error("Error: Insufficient input lines provided for color sequence processing.");
        return; // Exit if input is malformed
    }

    // Extract numerical values from the first line, representing color components
    // We parse them as integers with base 10 for clarity.
    const componentStrings = dataLines[0].split(' ');
    let redComponent = parseInt(componentStrings[0], 10);
    let greenComponent = parseInt(componentStrings[1], 10);
    let blueComponent = parseInt(componentStrings[2], 10);

    // Extract the iteration count from the second line
    const iterationCount = parseInt(dataLines[1], 10);

    // Helper function to determine if the color components are in strictly ascending order.
    // This function now takes parameters, making it more reusable and testable.
    const checkColorOrder = (val1, val2, val3) => {
        const isFirstSmaller = val1 < val2;
        const isSecondSmaller = val2 < val3;
        // Introduce a temporary variable for readability of the boolean logic
        const allInOrder = isFirstSmaller && isSecondSmaller;
        return allInOrder;
    };

    // Function to apply a specific transformation rule to the color components.
    // It takes the current values and returns updated values as an object.
    const applyColorShift = (currentRed, currentGreen, currentBlue) => {
        let newRed = currentRed;
        let newGreen = currentGreen;
        let newBlue = currentBlue;

        // Check conditions and apply doubling transformations
        if (currentRed >= currentGreen) {
            // If red is greater or equal to green, double green
            newGreen = currentGreen * 2; // Using multiplication
        } else if (currentGreen >= currentBlue) {
            // If green is greater or equal to blue, double blue
            newBlue <<= 1; // Using bitwise left shift for multiplication by 2
        }
        // No change if neither condition is met

        // Return the potentially modified components
        return { r: newRed, g: newGreen, b: newBlue };
    };

    // Loop to apply the color shifting transformation multiple times
    // Using a while loop instead of a for loop as a structural change.
    let loopIndex = 0;
    while (loopIndex < iterationCount) {
        // Apply the shift and update the main component variables
        const updatedComponents = applyColorShift(redComponent, greenComponent, blueComponent);
        redComponent = updatedComponents.r;
        greenComponent = updatedComponents.g;
        blueComponent = updatedComponents.b;

        // Increment the loop counter
        loopIndex++;
    }

    // After all transformations, evaluate the final state of the color components.
    const finalOrderCheck = checkColorOrder(redComponent, greenComponent, blueComponent);

    // Determine the final output message based on the check.
    // Using a ternary operator for conciseness.
    const finalVerdict = finalOrderCheck ? "Yes" : "No";

    // Display the final result to the console.
    console.log(finalVerdict);
}

// Read input from standard input, typically used in competitive programming environments.
// Ensure the file system module is available for this operation.
processColorSequence(require("fs").readFileSync("/dev/stdin", "utf8"));