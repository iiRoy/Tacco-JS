/**
 * This JavaScript module is designed to process sequential input data, interpreting each line
 * as a movement instruction consisting of a distance and an angular rotation.
 * It simulates a cumulative displacement in a 2D plane and outputs the final
 * integer-truncated coordinates.
 *
 * The coordinate system assumes 0 degrees points along the positive Y-axis,
 * and angles increase clockwise towards the positive X-axis.
 */

// --- Configuration Constants ---
// Defines the conversion ratio from degrees to radians, essential for trigonometric functions.
const DEG_TO_RAD_RATIO = Math.PI / 180.0;

// Specifies the character used to separate distance and angle values within an input line.
const VALUE_SEPARATOR = ",";

// Initial conditions for the simulation.
const STARTING_HORIZONTAL_POS = 0; // The initial position on the X-axis.
const STARTING_VERTICAL_POS = 0;   // The initial position on the Y-axis.
const INITIAL_HEADING_DEGREES = 0; // The starting orientation in degrees.

// --- Utility Functions ---

/**
 * Attempts to parse a string into a numerical value. If parsing fails (e.g., string is not a valid number),
 * it defaults to returning 0 to prevent NaN propagation in calculations.
 *
 * @param {string} valueStr - The string anticipated to contain a numerical value.
 * @returns {number} The parsed number, or 0 if parsing is unsuccessful.
 */
function safelyConvertStringToNumber(valueStr) {
    const numValue = Number(valueStr);
    return isNaN(numValue) ? 0 : numValue;
}

/**
 * Processes a single instruction line, updating the simulation's current state
 * (position and orientation). This function encapsulates the core movement logic.
 *
 * @param {string} instructionLine - A single line of text from the input stream.
 * @param {object} currentSimState - An object holding the mutable state of the simulation.
 *                                   Expected properties: `xPos`, `yPos`, `orientationDeg`.
 */
function executeMovementInstruction(instructionLine, currentSimState) {
    // Perform initial validation: skip empty or whitespace-only lines.
    if (!instructionLine || instructionLine.trim().length === 0) {
        return; // No operation for blank lines.
    }

    // Deconstruct the line into its constituent parts based on the defined separator.
    const measurementParts = instructionLine.split(VALUE_SEPARATOR);

    // Validate the structure of the input line: ensure exactly two values are provided.
    if (measurementParts.length !== 2) {
        // In a production scenario, one might log a warning or throw an error here.
        // For this cloning exercise, malformed lines are simply skipped.
        return;
    }

    // Parse the distance and angle components, handling potential invalid number formats.
    const displacementMagnitude = safelyConvertStringToNumber(measurementParts[0]);
    const angularChangeDegrees = safelyConvertStringToStringToNumber(measurementParts[1]);

    // Convert the current cumulative orientation from degrees to radians for trigonometric calculations.
    const currentOrientationRadians = currentSimState.orientationDeg * DEG_TO_RAD_RATIO;

    // Calculate the horizontal (X) and vertical (Y) displacement components for this step.
    // The original logic implies: 0 deg = +Y, 90 deg = +X (clockwise rotation).
    const stepDeltaX = displacementMagnitude * Math.sin(currentOrientationRadians);
    const stepDeltaY = displacementMagnitude * Math.cos(currentOrientationRadians);

    // Accumulate the calculated displacements to the overall position.
    currentSimState.xPos += stepDeltaX;
    currentSimState.yPos += stepDeltaY;

    // Update the cumulative orientation by adding the angular change from the current instruction.
    currentSimState.orientationDeg += angularChangeDegrees;

    // Increment a counter for successfully processed lines (for potential debugging/metrics).
    currentSimState.processedRecordCount++;
}

// --- Main Execution Block ---

// Initialize the simulation's dynamic state.
const simulationRuntimeState = {
    xPos: STARTING_HORIZONTAL_POS,
    yPos: STARTING_VERTICAL_POS,
    orientationDeg: INITIAL_HEADING_DEGREES,
    processedRecordCount: 0 // A new metric added for Type III clone.
};

// Register an event listener for incoming data on the standard input stream.
// This function acts as the primary handler for all input received.
process.stdin.on("data", function dataInputHandler(receivedBufferChunk) {
    // Convert the received buffer chunk to a string, then clean it and split into individual lines.
    // The `String()` constructor is used for explicit type conversion.
    const fullInputText = String(receivedBufferChunk);
    const inputInstructionLines = fullInputText.trim().split("\n");

    // Iterate over each line of instructions. The original used `some`, but its return value
    // was ignored, implying a simple iteration. `forEach` is semantically clearer here.
    inputInstructionLines.forEach(function(individualLine) {
        executeMovementInstruction(individualLine, simulationRuntimeState);
    });

    // After processing all instructions in the current data chunk, output the final
    // horizontal and vertical positions, truncated to their integer parts.
    // `Math.trunc()` provides explicit integer truncation, equivalent to the `|0` bitwise operator.
    const finalXOutput = Math.trunc(simulationRuntimeState.xPos);
    const finalYOutput = Math.trunc(simulationRuntimeState.yPos);

    // Output the results directly to standard output, each on a new line.
    process.stdout.write(finalXOutput + "\n");
    process.stdout.write(finalYOutput + "\n");
});

// Activate the standard input stream. This is necessary in Node.js for `stdin`
// to start emitting 'data' events.
process.stdin.resume();