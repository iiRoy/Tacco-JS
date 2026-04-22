// This module calculates an angle related to a prism's liquid fill level.
// The problem involves a rectangular prism with a square base of side 'a'
// and a height 'b'. It's filled with a liquid of volume 'x'.
// The goal is to determine the angle the water surface makes with the base
// when the prism is tilted until the water just touches a corner.

const DEGREES_PER_RADIAN = 180 / Math.PI; // Constant for converting radians to degrees

function calculatePrismTiltAngle(rawInputLines) {
    // Basic input validation: ensure we have at least one line of input
    if (!rawInputLines || rawInputLines.length === 0) {
        console.error("Error: No input data provided for calculation.");
        return; // Exit if no input
    }

    // Parse the first line of input to get the dimensions and target volume.
    // Expecting three space-separated numerical values.
    const inputComponents = rawInputLines[0].split(' ').map(Number);

    // Validate parsed components: check for correct count and numerical type.
    if (inputComponents.length !== 3 || inputComponents.some(val => isNaN(val))) {
        console.error("Error: Invalid input format. Expected three numbers separated by spaces.");
        return;
    }

    // Destructure the parsed values into descriptive variables.
    const [baseSideA, totalHeightB, liquidVolumeX] = inputComponents;

    // Additional validation for physical dimensions: A and B must be positive, X must be non-negative.
    if (baseSideA <= 0 || totalHeightB <= 0 || liquidVolumeX < 0) {
        console.error("Error: Invalid physical dimensions or volume. Base side (A) and total height (B) must be positive, liquid volume (X) must be non-negative.");
        return;
    }

    // Calculate the full volume of the prism for comparison.
    const maximumCapacity = baseSideA * baseSideA * totalHeightB;

    let resultingAngleInDegrees; // Variable to hold the final calculated angle in degrees.

    // Determine the calculation path based on the liquid volume relative to half the prism's capacity.
    // The condition `liquidVolumeX * 2 >= maximumCapacity` is mathematically equivalent to `liquidVolumeX >= maximumCapacity / 2`.
    if (liquidVolumeX * 2 >= maximumCapacity) {
        // Scenario 1: Liquid volume is greater than or equal to half the total volume.
        // In this case, the 'empty' space at the top forms a wedge.
        // We calculate the height of this empty wedge from the top.
        const effectiveBaseArea = baseSideA * baseSideA;
        const currentEmptyVolume = maximumCapacity - liquidVolumeX; // Volume of air at the top
        const effectiveTopHeight = (currentEmptyVolume * 2) / effectiveBaseArea; // Height of the air wedge from the top, based on similar triangles.

        // Calculate the angle using Math.atan, which returns radians.
        const angleInRadians = Math.atan(effectiveTopHeight / baseSideA);
        resultingAngleInDegrees = angleInRadians * DEGREES_PER_RADIAN;

    } else {
        // Scenario 2: Liquid volume is less than half the total volume.
        // Here, the liquid itself forms a wedge at the bottom.
        // We calculate the actual height of the water wedge from the base.
        const effectiveCrossSectionArea = baseSideA * totalHeightB; // This represents a 2D projection for the wedge calculation.
        const actualWaterHeight = (liquidVolumeX * 2) / effectiveCrossSectionArea; // Height of the water wedge from the bottom.

        // Calculate the angle using Math.atan, converting to degrees afterwards.
        const angleInRadians = Math.atan(totalHeightB / actualWaterHeight);
        resultingAngleInDegrees = angleInRadians * DEGREES_PER_RADIAN;
    }

    // Output the final calculated angle, formatted to a reasonable precision for consistency.
    console.log(resultingAngleInDegrees.toFixed(8)); // Display with high precision.
}

// Entry point for execution. Reads input from stdin and passes it to the main logic.
try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const lines = fileContent.split("\n");
    calculatePrismTiltAngle(lines);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or function execution.
    console.error("An unexpected error occurred during input processing or calculation:", executionError.message);
}