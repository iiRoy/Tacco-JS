// Function responsible for processing the raw input string and computing the maximal cuboid volume.
function ProcessGeometricCalculation(rawDataString) {
    // --- Input Specification ---
    // 'rawDataString': A textual representation of a single positive integer.
    // This integer, let's call it 'S', represents the total sum of the three
    // linear dimensions (length + width + height) of a cuboid.

    // --- Expected Output ---
    // The maximum possible volume (length * width * height) that a cuboid
    // can attain, given that its sum of dimensions is 'S'.
    // Mathematically, this maximum volume is achieved when all three dimensions
    // are equal (length = width = height = S/3), resulting in a volume of (S/3)^3.

    // Parse the input string to extract the numerical sum of dimensions.
    // We explicitly use parseInt with radix 10 to ensure integer parsing.
    // .trim() is added for robustness against potential leading/trailing whitespace.
    const totalDimensionalSum = parseInt(rawDataString.trim(), 10);

    // --- Robustness Check: Input Validation ---
    // Verify that the parsed value is a valid, positive integer.
    // If not, output an error message and terminate the operation.
    if (Number.isNaN(totalDimensionalSum) || totalDimensionalSum <= 0) {
        console.error("Data processing error: Input must be a positive numerical value.");
        console.error(`Received invalid input: "${rawDataString}"`);
        return; // Halt further execution for invalid input
    }

    // Define a constant for the power required for volume calculation (cubing).
    // This makes the intent clearer and avoids 'magic numbers'.
    const VOLUME_EXPONENT = 3;

    // Calculate the optimal length for each side of the cuboid.
    // For maximum volume with a fixed sum, all sides must be equal.
    const optimalSideLength = totalDimensionalSum / VOLUME_EXPONENT; // (S / 3)

    // Compute the maximal volume using the optimal side length.
    // This is equivalent to optimalSideLength raised to the power of VOLUME_EXPONENT.
    const maximalAchievableVolume = Math.pow(optimalSideLength, VOLUME_EXPONENT);

    // Output the final computed volume to the standard console.
    console.log(maximalAchievableVolume);
}

// --- Standard I/O Gateway ---
// This section handles reading input from the standard input stream
// and passing it to the primary calculation function.
// It should typically not be altered in competitive programming contexts.
ProcessGeometricCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));