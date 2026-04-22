'use strict';

// This module provides file system utilities for reading data.
const filesystemModule = require('fs');

// Define a constant for the standard input file path, enhancing modularity.
const INPUT_DATA_SOURCE_PATH = '/dev/stdin';
// A constant for an empty array, useful for indicating no data or errors.
const NO_ENTRIES_ARRAY = [];

/**
 * A utility function to calculate the precise end coordinate of a mechanical unit.
 * A unit starting at 'pos' with a 'len' duration occupies coordinates from 'pos' to 'pos + len - 1'.
 * @param {number} currentPosition - The starting coordinate of the unit.
 * @param {number} spanDuration - The length or duration of the unit's operation.
 * @returns {number} The last coordinate occupied by the unit.
 */
const calculateTerminalCoordinate = (currentPosition, spanDuration) => currentPosition + spanDuration - 1;

/**
 * Reads raw sensor data from a specified path, processes it, and converts it into
 * a structured array of automaton specifications. This includes parsing and basic validation.
 * @param {string} dataSourcePath - The file path from which to read the input data.
 * @returns {Array<Array<number>>} An array where each sub-array represents an automaton
 *   as [start_coordinate, duration], or an empty array if an error occurs or no valid data.
 */
function acquireAndStructureAutomatonSpecifications(dataSourcePath) {
    try {
        // Read all raw sensor readings as a UTF-8 string.
        const rawSensorReadings = filesystemModule.readFileSync(dataSourcePath, 'utf8');

        // Implement a guard clause for scenarios where the input stream is empty or just whitespace.
        if (!rawSensorReadings.trim()) {
            console.error("Critical Error: The provided input data stream is entirely empty. Cannot proceed.");
            return NO_ENTRIES_ARRAY;
        }

        // Divide the raw input string into individual lines for processing.
        const allDataLines = rawSensorReadings.trim().split('\n');

        // The first line is often a count. We'll parse it for informational/validation purposes,
        // but the core logic will rely on actual parsed entries.
        const declaredAutomatonCount = parseInt(allDataLines[0], 10);
        if (isNaN(declaredAutomatonCount) || declaredAutomatonCount < 0) {
            console.warn("Input Warning: The initial line does not contain a valid positive integer for the automaton count. Continuing without strict count validation.");
            // We will still process subsequent lines, just won't enforce this count.
        }

        // Iterate over the data lines, skipping the first (count) line, to construct automaton objects.
        // Each automaton is represented as [start_position, length].
        const validAutomatonUnits = allDataLines.slice(1).map((lineSegment, lineIndexOffset) => {
            // Use a more robust split to handle varying whitespace between numbers.
            const componentParts = lineSegment.trim().split(/\s+/);
            const actualLineNumber = lineIndexOffset + 2; // +1 for 0-indexing, +1 for skipping first line

            // Validate that each line contains exactly two numeric components.
            if (componentParts.length !== 2) {
                console.error(`Parsing Error: Line ${actualLineNumber} has an incorrect number of components (${componentParts.length}). Expected 2. Skipping this entry.`);
                return null; // Mark as invalid
            }

            // Convert string components to integers, specifying radix for safety.
            const initialCoordinate = parseInt(componentParts[0], 10);
            const operationDuration = parseInt(componentParts[1], 10);

            // Perform basic data validation on parsed numerical values.
            if (isNaN(initialCoordinate) || isNaN(operationDuration) || initialCoordinate < 0 || operationDuration <= 0) {
                console.error(`Validation Error: Line ${actualLineNumber} contains invalid numeric values (Start: ${componentParts[0]}, Duration: ${componentParts[1]}). Skipping entry.`);
                return null; // Mark as invalid
            }

            return [initialCoordinate, operationDuration]; // Return as a pair of numbers
        }).filter(Boolean); // Filter out any 'null' entries resulting from parsing or validation errors.

        // Perform an optional consistency check between the declared count and the actual parsed count.
        if (!isNaN(declaredAutomatonCount) && declaredAutomatonCount >= 0 && validAutomatonUnits.length !== declaredAutomatonCount) {
            console.warn(`Consistency Alert: Declared automaton count (${declaredAutomatonCount}) does not match the total number of successfully parsed units (${validAutomatonUnits.length}).`);
        }

        return validAutomatonUnits;

    } catch (readProcessError) {
        // Catch and report any exceptions during file reading or initial processing.
        console.error(`An unrecoverable error occurred during data acquisition from '${dataSourcePath}': ${readProcessError.message}`);
        return NO_ENTRIES_ARRAY;
    }
}

/**
 * Implements a greedy algorithm to select the maximum number of non-overlapping
 * mechanical units (intervals) from a given set.
 * This is a variation of the classic Activity Selection Problem.
 * @returns {number} The total count of optimally scheduled automatons.
 */
function initiateOptimalAutomatonScheduling() {
    // Retrieve and prepare the list of all available mechanical units.
    const availableMechanicalUnits = acquireAndStructureAutomatonSpecifications(INPUT_DATA_SOURCE_PATH);

    // Guard clause for scenarios where no valid units were parsed.
    if (availableMechanicalUnits.length === 0) {
        console.info("Scheduler Status: No mechanical units were found or valid for scheduling. The system is idle.");
        return 0; // Indicate that zero units were scheduled.
    }

    // --- Core Scheduling Logic: Greedy Approach ---
    // The fundamental strategy for maximizing non-overlapping intervals is to
    // prioritize those that conclude earliest. This leaves the greatest possible
    // remaining time slot for subsequent selections.
    // Therefore, we sort all mechanical units primarily by their calculated termination coordinates.
    availableMechanicalUnits.sort((unitOne, unitTwo) => {
        const endOfUnitOne = calculateTerminalCoordinate(unitOne[0], unitOne[1]);
        const endOfUnitTwo = calculateTerminalCoordinate(unitTwo[0], unitTwo[1]);
        return endOfUnitOne - endOfUnitTwo; // Sort in ascending order of end times.
    });

    // Initialize the collection that will store the selected, non-overlapping units.
    // The greedy strategy dictates that the first unit to be selected is always the one
    // that finishes earliest among all available units (which is now the first in our sorted list).
    const optimalScheduleCollection = [availableMechanicalUnits[0]];

    // Iterate through the remaining units, starting from the second one.
    // We attempt to add each unit to our schedule if it does not conflict with the last chosen unit.
    for (let currentUnitIdx = 1; currentUnitIdx < availableMechanicalUnits.length; currentUnitIdx++) {
        // Identify the last unit that was successfully added to the optimal schedule.
        const previouslyScheduledUnit = optimalScheduleCollection[optimalScheduleCollection.length - 1];
        // Determine the coordinate where this previously scheduled unit concludes its operation.
        const previousUnitFinalCoordinate = calculateTerminalCoordinate(previouslyScheduledUnit[0], previouslyScheduledUnit[1]);

        // Access the current unit being considered for inclusion in the schedule.
        const currentlyExaminedUnit = availableMechanicalUnits[currentUnitIdx];
        // Extract the starting coordinate of the current unit.
        const currentUnitInitialCoordinate = currentlyExaminedUnit[0];

        // The critical condition for non-overlap:
        // A unit can be scheduled if its starting coordinate is greater than or equal to
        // the coordinate immediately following the previous unit's completion.
        // This ensures there is no overlap, even if units are adjacent.
        if (currentUnitInitialCoordinate >= previousUnitFinalCoordinate + 1) {
            optimalScheduleCollection.push(currentlyExaminedUnit);
        }
    }

    // --- Outputting the Results ---
    console.log("\n--- Final Report: Optimized Automaton Scheduling ---");
    if (optimalScheduleCollection.length > 0) {
        optimalScheduleCollection.forEach((unitSpec, displayIndex) => {
            const startCoord = unitSpec[0];
            const duration = unitSpec[1];
            const endCoord = calculateTerminalCoordinate(startCoord, duration);
            console.log(`  Scheduled Unit #${displayIndex + 1}: Start=${startCoord}, Duration=${duration}, EndsAt=${endCoord}`);
        });
    } else {
        console.log("  No automatons could be successfully scheduled under the non-overlapping constraint.");
    }
    console.log(`\n  Total Number of Successfully Scheduled Automatons: ${optimalScheduleCollection.length}`);

    // Return the count of scheduled units for potential external integration or testing.
    return optimalScheduleCollection.length;
}

// Initiate the main scheduling process when the script is executed.
initiateOptimalAutomatonScheduling();