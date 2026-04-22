// Comment: This script processes numerical data from a text file,
// attempting to allocate each number into one of two available 'slots'
// based on specific placement rules. It outputs "YES" if all numbers
// in a line are successfully allocated, or "NO" if any number cannot be placed.

// Type III: Using 'const' for modules and path, separating file system operations.
const fileSystemModule = require("fs");
const inputDataPath = "./test.txt";

// Type III: Breaking down the file reading and parsing into distinct steps.
let rawFileContent = fileSystemModule.readFileSync(inputDataPath, "utf8");
let trimmedContent = rawFileContent.trim();
const scenarioLines = trimmedContent.split(/\n/);

// Type III: Renamed identifier, using 'const'.
const totalProcessingScenarios = scenarioLines.length;

// Type III: Renamed loop counter. Starting from 1 as per original logic,
// assuming the first line might be a header or not part of the data.
for (let currentScenarioIdx = 1; currentScenarioIdx < totalProcessingScenarios; currentScenarioIdx++) {
    // Type III: Added a flag to track the validity of the current scenario.
    let currentScenarioPassed = true;

    // Type III: Renamed variables and broken down the line processing.
    const currentInputRecord = scenarioLines[currentScenarioIdx];
    // Using /\s+/ for more robust splitting, handling multiple spaces.
    const stringValueSegments = currentInputRecord.trim().split(/\s+/);

    // Type III: Renamed the array that tracks the allocated numbers in the two 'slots'.
    // Initializing both slots to zero, representing their starting state.
    let allocationRegisters = [0, 0];

    // Type III: Renamed loop counter and array.
    for (let segmentIndex = 0; segmentIndex < stringValueSegments.length; segmentIndex++) {
        const currentSegment = stringValueSegments[segmentIndex];
        // Type III: Using Number() for parsing, and adding validation.
        const parsedNumericValue = Number(currentSegment);

        // Type III: Guard clause for invalid number formats.
        if (isNaN(parsedNumericValue)) {
            console.error(`Error: Non-numeric value '${currentSegment}' found in scenario ${currentScenarioIdx}. Skipping.`);
            currentScenarioPassed = false; // Mark scenario as failed
            break; // Exit current scenario's processing
        }

        // Type III: Breaking down difference calculations into separate variables for clarity.
        const gapToRegisterA = parsedNumericValue - allocationRegisters[0];
        const gapToRegisterB = parsedNumericValue - allocationRegisters[1];

        // Type III: Rewritten condition for un-placeable numbers, using a new helper boolean.
        // If the current numeric value is smaller than both allocated values, it cannot be placed.
        const cannotAllocateAnywhere = (gapToRegisterA < 0 && gapToRegisterB < 0);

        if (cannotAllocateAnywhere) {
            console.log("NO");
            currentScenarioPassed = false; // Scenario failed
            break; // Stop processing this scenario immediately
        }

        // Type III: Introduced new boolean flags for clarity in assignment logic,
        // making the decision process more explicit.
        const canFitInSlotA = (gapToRegisterA >= 0);
        const canFitInSlotB = (gapToRegisterB >= 0);
        // This preference is only relevant if both slots are eligible.
        const isSlotAPreferentiallyBetter = (gapToRegisterA <= gapToRegisterB);

        // Type III: Restructured and made more explicit the assignment logic.
        // Prioritize Slot A if it can accommodate the value AND (it's the preferred choice OR Slot B cannot accommodate it).
        if (canFitInSlotA && (isSlotAPreferentiallyBetter || !canFitInSlotB)) {
            allocationRegisters[0] = parsedNumericValue;
        }
        // Otherwise, if Slot B can accommodate the value (this implies Slot A either couldn't or wasn't preferred).
        else if (canFitInSlotB) {
            allocationRegisters[1] = parsedNumericValue;
        }
        // Type III: Added an error log for an unexpected logical state.
        // This 'else' block should ideally not be reached if 'cannotAllocateAnywhere' is exhaustive.
        else {
            console.error(`Internal logic error: Value ${parsedNumericValue} not assigned in scenario ${currentScenarioIdx}, segment ${segmentIndex}.`);
            currentScenarioPassed = false;
            break;
        }

        // Type III: The original 'if(j==9)' statement is considered non-essential and has been removed.
        // Its arbitrary "YES" printing is replaced by a more comprehensive success check at the end of the scenario.
    }

    // Type III: New fragment - print "YES" only if the entire scenario completed successfully
    // without any "NO" conditions or errors being triggered.
    if (currentScenarioPassed) {
        console.log("YES");
    }
}