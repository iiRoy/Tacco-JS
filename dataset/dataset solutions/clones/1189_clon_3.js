"use strict";

// This file contains the implementation for a specialized die (cube) simulation system.
// It processes sequential commands to orient a six-sided die and report specific face values.

/**
 * Encapsulates the logic for reading all available data from standard input.
 * This function handles file system interactions and basic parsing of input lines.
 * @returns {string[]} An array of strings, where each string represents a trimmed line from stdin.
 *                     Returns an empty array if an error occurs during input reading.
 */
function acquireSourceData() {
  try {
    // Utilize Node.js's file system module to synchronously read from the standard input path.
    const rawDataBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

    // Split the raw buffer into individual lines.
    // Handles both Windows (\r\n) and Unix (\n) style newlines.
    // Filters out any lines that are empty or consist only of whitespace after trimming.
    const processedLines = rawDataBuffer
      .split(/\r?\n/)
      .map(line => line.trim()) // Trim whitespace from each line
      .filter(line => line.length > 0); // Remove completely empty lines

    return processedLines;
  } catch (errorReadingInput) {
    // Log a warning or error if standard input cannot be read.
    console.error(`ERROR: Failed to read from standard input. Details: ${errorReadingInput.message}`);
    // In a production scenario, one might throw the error or exit the process.
    // For this simulation, returning an empty array allows the program to continue gracefully.
    return [];
  }
}

/**
 * The main orchestrator function that processes the entire set of input instructions.
 * It initializes the die, then performs a series of rotations based on subsequent commands.
 * @param {string[]} incomingDataPayload - An array of strings, each representing an input line.
 *                                         The first line defines the initial die state,
 *                                         subsequent lines define target orientations.
 */
function processInputData(incomingDataPayload) {
  // --- Input Validation: Ensure minimum required data is present ---
  // We expect at least one line for initial die configuration and at least one instruction line.
  if (!Array.isArray(incomingDataPayload) || incomingDataPayload.length < 2) {
    console.error("CRITICAL: Insufficient input data. Expected at least two lines: initial die state and at least one command.");
    return; // Exit if input is critically malformed.
  }

  /**
   * Defines a `CubeSimulator` class to model a six-sided die and its rotational dynamics.
   * Each instance manages the current values displayed on its six faces.
   */
  class CubeSimulator {
    /**
     * Constructs a new `CubeSimulator` instance with specified initial face values.
     * @param {string[]} faceLabels - An array of exactly six strings, ordered as:
     *                                Top, South, East, West, North, Bottom.
     * @throws {Error} If `faceLabels` is not an array of six elements.
     */
    constructor(faceLabels) {
      if (!Array.isArray(faceLabels) || faceLabels.length !== 6) {
        throw new Error("CubeSimulator initialization requires an array of exactly 6 face labels.");
      }

      // Assign descriptive property names to each die face.
      this.surfaceUp = faceLabels[0];    // Corresponds to original 't' (top)
      this.surfaceSouth = faceLabels[1]; // Corresponds to original 's' (south)
      this.surfaceEast = faceLabels[2];  // Corresponds to original 'e' (east)
      this.surfaceWest = faceLabels[3];  // Corresponds to original 'w' (west)
      this.surfaceNorth = faceLabels[4]; // Corresponds to original 'n' (north)
      this.surfaceBottom = faceLabels[5]; // Corresponds to original 'b' (bottom)
    }

    /**
     * Performs a single rotation of the die in a specified cardinal direction.
     * This method cyclically shifts the values on the affected faces.
     * @param {string} rotationCommand - A single character string indicating the direction:
     *                                   'N' (North), 'S' (South), 'W' (West), 'E' (East).
     *                                   Other values will result in a warning and no action.
     */
    shiftOrientation(rotationCommand) {
      // A temporary variable is used to hold a face value during the cyclic swap.
      let temporaryFaceValueHolder;

      switch (rotationCommand) {
        case "N": // Rotate towards North: Up -> South -> Bottom -> North -> Up
          temporaryFaceValueHolder = this.surfaceUp;
          this.surfaceUp = this.surfaceSouth;
          this.surfaceSouth = this.surfaceBottom;
          this.surfaceBottom = this.surfaceNorth;
          this.surfaceNorth = temporaryFaceValueHolder;
          break;
        case "S": // Rotate towards South: Up -> North -> Bottom -> South -> Up
          temporaryFaceValueHolder = this.surfaceUp;
          this.surfaceUp = this.surfaceNorth;
          this.surfaceNorth = this.surfaceBottom;
          this.surfaceBottom = this.surfaceSouth;
          this.surfaceSouth = temporaryFaceValueHolder;
          break;
        case "W": // Rotate towards West: Up -> East -> Bottom -> West -> Up
          temporaryFaceValueHolder = this.surfaceUp;
          this.surfaceUp = this.surfaceEast;
          this.surfaceEast = this.surfaceBottom;
          this.surfaceBottom = this.surfaceWest;
          this.surfaceWest = temporaryFaceValueHolder;
          break;
        case "E": // Rotate towards East: Up -> West -> Bottom -> East -> Up
          temporaryFaceValueHolder = this.surfaceUp;
          this.surfaceUp = this.surfaceWest;
          this.surfaceWest = this.surfaceBottom;
          this.surfaceBottom = this.surfaceEast;
          this.surfaceEast = temporaryFaceValueHolder;
          break;
        default:
          // For any unrecognized command, issue a warning and do nothing.
          console.warn(`WARNING: Unrecognized rotation command received: '${rotationCommand}'. No die movement performed.`);
          break;
      }
    }
  }

  // --- Die Initialization ---
  // The first line of input provides the initial configuration of the die's faces.
  const initialConfigurationLine = incomingDataPayload[0];
  const initialFaceValueArray = initialConfigurationLine.split(" ");

  // Validate the initial configuration line.
  if (initialFaceValueArray.length !== 6) {
    console.error(`CRITICAL: Invalid initial die configuration. Expected 6 face values on the first line, but got ${initialFaceValueArray.length}.`);
    return;
  }

  // Instantiate the die simulator with the parsed initial values.
  const operationalDie = new CubeSimulator(initialFaceValueArray);

  // --- Processing Subsequent Instruction Lines ---
  // The original problem structure implies that the second line (index 1) is a query count,
  // which is then ignored. We start processing actual commands from the third line (index 2).
  const startingInstructionIndex = 2;
  const westRotationString = "W"; // Define a constant for the 'West' rotation command.

  for (let currentInstructionIndex = startingInstructionIndex; currentInstructionIndex < incomingDataPayload.length; currentInstructionIndex++) {
    const rawInstructionLine = incomingDataPayload[currentInstructionIndex];
    const instructionParts = rawInstructionLine.split(" ");

    // Validate each instruction line.
    if (instructionParts.length !== 2) {
      console.warn(`WARNING: Skipping malformed instruction line: '${rawInstructionLine}'. Expected 2 components (target top and target south faces).`);
      continue; // Move to the next instruction if this one is malformed.
    }

    const desiredTopFace = instructionParts[0];
    const desiredSouthFace = instructionParts[1];

    // --- Phase 1: Orient the die to achieve the `desiredSouthFace` ---
    // This phase involves a sequence of 'N' and 'W' rolls.
    // The original logic performs up to 8 rolls, breaking early if the south face matches.
    // The sequence is 'N', 'N', 'N', 'W', 'N', 'N', 'N', 'W'.
    const maximumSouthAlignmentRolls = 8;
    let currentSouthRollAttempt = 0;

    while (operationalDie.surfaceSouth !== desiredSouthFace && currentSouthRollAttempt < maximumSouthAlignmentRolls) {
      // Determine the rotation command based on the current attempt index.
      // (currentSouthRollAttempt % 4) will cycle 0, 1, 2, 3.
      // If result is 3, it's 'W', otherwise 'N'.
      const rotationToApply = (currentSouthRollAttempt % 4 === 3) ? westRotationString : "N";
      operationalDie.shiftOrientation(rotationToApply);
      currentSouthRollAttempt++;
    }

    // --- Phase 2: Orient the die to achieve the `desiredTopFace` ---
    // This phase only involves 'W' rolls, which rotate the top, east, bottom, and west faces,
    // ensuring the south and north faces remain undisturbed.
    // A maximum of 4 rolls is sufficient to bring any of the four side faces to the top.
    const maximumWestAlignmentRolls = 4;
    let currentWestRollAttempt = 0;

    while (operationalDie.surfaceUp !== desiredTopFace && currentWestRollAttempt < maximumWestAlignmentRolls) {
      operationalDie.shiftOrientation(westRotationString);
      currentWestRollAttempt++;
    }

    // Optional: Add a warning if the top face couldn't be aligned within expected rolls.
    // This scenario should not occur given the problem constraints, but adds robustness.
    if (operationalDie.surfaceUp !== desiredTopFace) {
        console.warn(`NOTICE: Top face '${desiredTopFace}' could not be achieved after ${maximumWestAlignmentRolls} West rolls for instruction: ${rawInstructionLine}. Proceeding with current state.`);
    }

    // --- Output Result ---
    // After both alignment phases, print the value currently displayed on the East face.
    const finalEastFaceValue = operationalDie.surfaceEast;
    console.log(finalEastFaceValue);
  }
}

// --- Program Entry Point ---
// Execute the primary processing function by first acquiring data from standard input.
processInputData(acquireSourceData());