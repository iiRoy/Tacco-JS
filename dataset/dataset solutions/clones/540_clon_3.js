const parseIntegerLine = (textLine) => {
    // A utility function to safely convert a line of text to an integer.
    // Includes a basic sanity check, which is a Type III addition for robustness.
    const numericValue = parseInt(textLine.trim(), 10);
    if (isNaN(numericValue)) {
        // In a real-world scenario, you might throw an error or log a warning.
        // For competitive programming, inputs are usually valid, but this adds a guard.
        console.error("Warning: Non-numeric input encountered, defaulting to 0:", textLine);
        return 0; 
    }
    return numericValue;
};

const parseNumericSequenceLine = (textLine) => {
    // Converts a space-separated string of numbers into an array of integers.
    // Enhanced splitting and parsing for Type III.
    return textLine.trim().split(/\s+/).map(strVal => {
        const num = parseInt(strVal, 10);
        if (isNaN(num)) {
            console.error("Warning: Invalid number in sequence, defaulting to 0:", strVal);
            return 0;
        }
        return num;
    });
};

// --- Input Acquisition and Initial Setup ---

// Read all incoming data from the standard input stream.
let rawStreamData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input into an array of individual lines.
// Ensure no leading/trailing whitespace on the overall input.
let splitInputLines = rawStreamData.trim().split('\n');

// The first line specifies the total number of elements.
// While not directly used in subsequent logic (array lengths suffice), it's parsed.
const totalItemCount = parseIntegerLine(splitInputLines.shift());

// The second line provides the initial arrangement of numbers.
const originalItemArrangement = parseNumericSequenceLine(splitInputLines.shift());

// The third line denotes the total count of swap operations to perform.
const numberOfSwapOps = parseIntegerLine(splitInputLines.shift());

// Remaining lines define the indices for each swap operation.
// Indices are converted to 0-based by subtracting 1.
const pendingSwapInstructions = splitInputLines.map(lineContent => 
    parseNumericSequenceLine(lineContent).map(index => index - 1)
);

// To align with the original logic's loop structure (which starts with a no-op at i=0),
// we prepend a dummy swap operation [0,0]. This allows the initial state to be checked
// at `opIteration = 0` before any actual user-defined swaps are applied.
const fullSwapSchedule = [[0, 0], ...pendingSwapInstructions];

// --- Data Structure Initialization ---

// Create a sorted reference array from the initial arrangement.
// This represents the target state we want to achieve for the mismatched elements.
const idealSortedArrangement = [...originalItemArrangement].sort((valA, valB) => valA - valB);

// Maps (objects used as hash maps) to track elements that are currently "out of place".
// `activeMismatches` stores the current values at indices where `originalItemArrangement[idx]`
// does not match `idealSortedArrangement[idx]`.
// `targetMismatchValues` stores the *ideal* values at those same mismatch indices.
const activeMismatches = {};
const targetMismatchValues = {};

// Populate the mismatch maps by identifying all positions where the initial sequence
// deviates from its sorted counterpart.
for (let elementIndex = 0; elementIndex < originalItemArrangement.length; ++elementIndex) {
    if (originalItemArrangement[elementIndex] !== idealSortedArrangement[elementIndex]) {
        activeMismatches[elementIndex] = originalItemArrangement[elementIndex];
        targetMismatchValues[elementIndex] = idealSortedArrangement[elementIndex];
    }
}

// Generate a canonical string representation of the target mismatch values.
// This is crucial for the comparison logic, as `Object.values` on numeric keys
// returns values sorted by key, and comparing these strings ensures positional
// equality of values at mismatched indices.
const desiredMismatchString = Object.values(targetMismatchValues).join(',');

// --- Operation and Validation Loop ---

let firstCompletionIteration = -1; // Stores the iteration index when sorted state is first achieved.
let achievedSortedState = false;   // Flag to indicate if the sorted state has been reached.

// Helper function to determine if the current state of mismatches matches the target.
// This encapsulates the specific string comparison logic.
const verifyCurrentMismatchState = (currentMap, targetString) => {
    // If the map is empty, it means all elements are now in their sorted positions.
    // The target string should also be empty in this case.
    if (Object.keys(currentMap).length === 0) {
        return targetString === '';
    }
    // Otherwise, compare the stringified values.
    return Object.values(currentMap).join(',') === targetString;
};

// Iterate through each potential swap operation, including the initial no-op.
// The loop runs for `numberOfSwapOps + 1` times.
for (let opIteration = 0; opIteration <= numberOfSwapOps; ++opIteration) {
    // Check if the current arrangement of mismatched elements already matches the sorted target.
    if (verifyCurrentMismatchState(activeMismatches, desiredMismatchString)) {
        achievedSortedState = true;
        firstCompletionIteration = opIteration; // Record the iteration number.
        break; // Exit early as the goal has been met.
    }

    // Retrieve the indices for the current swap from the full schedule.
    const [firstSwapIndex, secondSwapIndex] = fullSwapSchedule[opIteration];

    // Safely retrieve the values at the specified indices from the active mismatches map.
    // If an index is not in the map, its value will be `undefined`.
    const valueAtFirstIndex = activeMismatches[firstSwapIndex];
    const valueAtSecondIndex = activeMismatches[secondSwapIndex];

    // Perform the swap operation on the values in the `activeMismatches` map.
    // Assigning `undefined` effectively marks an element as no longer mismatched at that position.
    activeMismatches[firstSwapIndex] = valueAtSecondIndex;
    activeMismatches[secondSwapIndex] = valueAtFirstIndex;

    // A Type III addition: Explicitly remove keys from the map if their values become `undefined`.
    // This ensures `activeMismatches` strictly contains only active mismatches and that
    // `Object.values()` behaves consistently by not including `undefined` entries.
    if (activeMismatches[firstSwapIndex] === undefined) {
        delete activeMismatches[firstSwapIndex];
    }
    if (activeMismatches[secondSwapIndex] === undefined) {
        delete activeMismatches[secondSwapIndex];
    }
}

// --- Output Result ---

// Print the iteration index at which the sorted state was first achieved,
// or -1 if it was never reached within the given operations.
console.log(firstCompletionIteration);