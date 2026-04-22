const FILE_INPUT_PATH = "/dev/stdin"; // Defines the standard input file path for system operations.

const fileSystemModule = require("fs"); // Imports Node.js file system utilities.

// Initialize position accumulators and current direction.
let accumulatedXPosition = 0.0; // Tracks the total displacement along the X-axis.
let accumulatedYPosition = 0.0; // Tracks the total displacement along the Y-axis.
let currentDirectionInDegrees = 0.0; // Stores the current accumulated angle in degrees.

// Pre-calculate the conversion factor from degrees to radians for trigonometric functions.
const DEGREES_TO_RADIANS_MULTIPLIER = Math.PI / 180.0;

try {
    // Read the entire content from the input file, ensuring UTF-8 encoding.
    const entireInputContent = fileSystemModule.readFileSync(FILE_INPUT_PATH, "utf8");

    // Process each line of the input data.
    // First, remove any leading/trailing whitespace from the whole content, then split it into individual lines.
    // The forEach method iterates over each line, allowing for separate processing.
    entireInputContent.trim().split('\n').forEach(function(individualDataLine) {
        // Skip processing if the line is empty or contains only whitespace after trimming.
        const trimmedLine = individualDataLine.trim();
        if (trimmedLine.length === 0) {
            return; // Move to the next line without further processing.
        }

        // Split the line into its constituent parts based on the comma delimiter.
        // Expected format: "movement_magnitude,angle_change"
        const lineComponents = trimmedLine.split(',');

        // Validate the number of components to ensure correct input format.
        if (lineComponents.length < 2) {
            console.error(`Warning: Input line "${trimmedLine}" is malformed. Expected at least two comma-separated values. Skipping.`);
            return;
        }

        // Parse the displacement magnitude from the first component.
        // parseFloat is used to handle potential decimal values.
        const movementMagnitude = parseFloat(lineComponents[0]);
        // Parse the angle increment from the second component.
        const angleIncrement = parseFloat(lineComponents[1]);

        // Perform validation to ensure both parsed values are valid numbers.
        if (isNaN(movementMagnitude) || isNaN(angleIncrement)) {
            console.error(`Error: Non-numeric data encountered in line "${trimmedLine}". Both magnitude and angle must be numbers. Skipping.`);
            return;
        }

        // --- Apply the Core Positional Update Logic ---

        // Convert the current accumulated angle from degrees to radians for Math.sin/cos.
        const angleInCurrentRadians = currentDirectionInDegrees * DEGREES_TO_RADIANS_MULTIPLIER;

        // Update the accumulated X-position using sine.
        // The original logic maps X to sine and Y to cosine.
        accumulatedXPosition += movementMagnitude * Math.sin(angleInCurrentRadians);
        // Update the accumulated Y-position using cosine.
        accumulatedYPosition += movementMagnitude * Math.cos(angleInCurrentRadians);

        // Increment the total angle for the next iteration.
        currentDirectionInDegrees += angleIncrement;
    });

    // --- Output Final Calculated Positions ---

    // Output the final X-position, truncated to an integer.
    // The '~~' operator performs a bitwise NOT operation twice, effectively truncating to an integer.
    console.log(~~accumulatedXPosition);
    // Output the final Y-position, truncated to an integer.
    console.log(~~accumulatedYPosition);

} catch (readError) {
    // Catch and report any errors that occur during file reading.
    console.error("An error occurred while attempting to read the input file:", readError.message);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}