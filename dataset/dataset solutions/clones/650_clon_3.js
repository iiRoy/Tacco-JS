const FILE_SYSTEM_MODULE = require('fs'); // Alias for the file system module.

// Define a constant for the standard input file path in common environments.
const STANDARD_INPUT_PATH = '/dev/stdin';

// Define a magic number threshold for the primary processing loop.
const PRIMARY_LOOP_THRESHOLD = 6;

// Define the fixed increment value applied within each major cycle of the loop.
const FIXED_CYCLE_INCREMENT = 7;

// --- Input Acquisition and Initial Processing ---

// Retrieve the raw string content from the specified input source.
// Ensure UTF-8 encoding for proper character handling.
let rawDataString = FILE_SYSTEM_MODULE.readFileSync(STANDARD_INPUT_PATH, 'utf8');

// Preliminary validation: Check if the input data is empty or consists only of whitespace.
if (!rawDataString || rawDataString.trim().length === 0) {
    // If input is invalid, output an error message to stderr and terminate the process.
    console.error("ERROR: The provided input data is absent or entirely blank.");
    process.exit(1);
}

// Parse the input string:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of substrings using one or more spaces as delimiters.
// 3. Map each substring to its numeric equivalent.
// 4. Validate each converted number for non-numeric values.
let [factor_alpha, offset_beta, initial_gamma] = rawDataString
    .trim()
    .split(/\s+/) // Use regex to handle multiple spaces robustly.
    .map(segment => {
        const numericValue = Number(segment);
        if (isNaN(numericValue)) {
            console.error(`ERROR: Found non-numeric input segment: '${segment}'. All inputs must be numbers.`);
            process.exit(1);
        }
        return numericValue;
    });

// Critical validation: Ensure the primary divisor (factor_alpha) is not zero.
// Division by zero would lead to infinite or undefined results.
if (factor_alpha === 0) {
    console.error("ERROR: The primary factor (alpha) cannot be zero, as it is used as a divisor.");
    process.exit(1);
}

// Initialize an accumulator for tracking total units processed in full cycles.
let total_processed_units = 0;

// Calculate the initial number of "work units" or "cycles" based on initial_gamma and factor_alpha.
// Math.ceil ensures that any fractional part counts as a full unit.
let current_work_units = Math.ceil(initial_gamma / factor_alpha);

// Pre-calculate a compound value that represents the total reduction in 'initial_gamma' per major cycle.
// This value includes a fixed offset and a scaled version of factor_alpha.
const compound_reduction_per_cycle = offset_beta + (FIXED_CYCLE_INCREMENT * factor_alpha);

// --- Core Processing Loop ---

// The loop continues as long as the current work units exceed the defined threshold.
// This structure processes work in larger, fixed increments.
while (current_work_units > PRIMARY_LOOP_THRESHOLD) {
    // Add the fixed cycle increment to the total processed units.
    total_processed_units += FIXED_CYCLE_INCREMENT;

    // Reduce the initial_gamma by the pre-calculated compound reduction.
    // This simulates consumption or progress toward the target.
    initial_gamma -= compound_reduction_per_cycle;

    // Recalculate the remaining work units.
    // Use Math.max(0, ...) to ensure initial_gamma does not become negative before division,
    // which could lead to unexpected Math.ceil results (e.g., ceil(-0.5) is 0, but ceil(-1.5) is -1).
    // The problem context implies that negative 'work units' are not meaningful.
    current_work_units = Math.ceil(Math.max(0, initial_gamma) / factor_alpha);
}

// --- Final Result Aggregation and Output ---

// Determine the final portion of work units to add.
// This handles any remaining work that didn't fit into full PRIMARY_LOOP_THRESHOLD cycles.
// Ensure that only positive or zero work units are added, as negative units are not relevant.
const remaining_work_addition = Math.max(0, current_work_units);

// Output the final accumulated result:
// The sum of units processed in full cycles plus any remaining partial units.
console.log(total_processed_units + remaining_work_addition);