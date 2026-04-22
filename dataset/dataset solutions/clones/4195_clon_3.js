process.stdin.resume(); // Ensure the standard input stream stays open
process.stdin.setEncoding('utf8'); // Set encoding for incoming data

// Global buffer to accumulate all input chunks
let rawInputBuffer = '';

// Event listener for incoming data chunks
process.stdin.on('data', function(inputChunk) {
    rawInputBuffer += inputChunk; // Append current chunk to the buffer
});

// Event listener for the end of input stream
process.stdin.on('end', function() {
    // If no input was provided, gracefully exit or handle
    if (!rawInputBuffer.trim()) {
        console.error("Error: No input data received.");
        process.exit(1);
    }

    // Split the accumulated raw input into individual lines,
    // filtering out any empty lines that might result from trailing newlines.
    const processedInputLines = rawInputBuffer.split(/\r?\n/).filter(line => line.length > 0);

    // Initiate the core solution logic with the parsed input lines
    initiateSolution(processedInputLines);
});

// Define a constant for representing an invalid or undesirable state's profit
const UNDESIRABLE_PROFIT_VALUE = Number.MIN_SAFE_INTEGER;

/**
 * Main function to orchestrate the solution.
 * Parses input, initializes data structures, and calls the recursive solver.
 * @param {string[]} processedInputLines - An array of strings, each representing a line of input.
 */
function initiateSolution(processedInputLines) {
    // Parse the number of businesses from the first line
    const numBusinesses = parseInt(processedInputLines[0], 10);

    // Validate the number of businesses
    if (isNaN(numBusinesses) || numBusinesses <= 0) {
        console.error("Error: Invalid or non-positive number of businesses provided.");
        process.exit(1);
    }
    if (numBusinesses > processedInputLines.length - 1) { // Check if enough lines for business data
        console.error("Error: Not enough input lines for the specified number of businesses.");
        process.exit(1);
    }

    // Initialize the 2D array for business availability (f in original)
    // Dimensions: numBusinesses x 10 (representing 10 time slots)
    const businessAvailability = new Array(numBusinesses);
    for (let businessIndex = 0; businessIndex < numBusinesses; businessIndex++) {
        businessAvailability[businessIndex] = new Array(10);
        // Get the line corresponding to the current business's availability data
        const availabilityLineIndex = 1 + businessIndex;
        const lineTokens = processedInputLines[availabilityLineIndex].split(' ');
        // Populate the availability matrix for the current business
        for (let timeSlotIndex = 0; timeSlotIndex < 10; timeSlotIndex++) {
            businessAvailability[businessIndex][timeSlotIndex] = parseInt(lineTokens[timeSlotIndex], 10);
        }
    }

    // Initialize the 2D array for profit table (p in original)
    // Dimensions: numBusinesses x 11 (representing profit for 0 to 10 overlapping slots)
    const profitTable = new Array(numBusinesses);
    for (let businessIndex = 0; businessIndex < numBusinesses; businessIndex++) {
        // Note: The original code had p as new Array(10), but profit for 10 overlaps
        // means an index of 10. Let's make it 11 to correctly handle 0-10 overlaps.
        profitTable[businessIndex] = new Array(11);
        // Get the line corresponding to the current business's profit data
        const profitLineIndex = 1 + numBusinesses + businessIndex;
        const lineTokens = processedInputLines[profitLineIndex].split(' ');
        // Populate the profit matrix for the current business
        // Ensure we handle up to 10 potential overlaps (index 0-10)
        for (let overlapCount = 0; overlapCount <= 10; overlapCount++) {
            // If the input line has fewer than 11 values, pad with 0 or handle error.
            // Assuming input always provides 11 values for 0-10 overlaps.
            // The original problem had `for (var j = 0; j < 10; j++) { p[i][j] = ... }`
            // and `ret += p[i][both[i]]` where `both[i]` could be up to 10.
            // This is a correction to ensure `p[i][10]` is accessible.
            profitTable[businessIndex][overlapCount] = parseInt(lineTokens[overlapCount], 10) || 0;
        }
    }

    // Initialize an array to keep track of which of the 10 time slots are active (open)
    // All slots start as inactive (false).
    const activeTimeSlots = Array.from({ length: 10 }, () => false);

    // Call the recursive function to find the maximum possible profit.
    // Start considering from the first time slot (index 0).
    const maximumCalculatedProfit = recursiveProfitExplorer(0, activeTimeSlots, businessAvailability, profitTable);

    // Output the final maximum profit to the console.
    console.log(maximumCalculatedProfit);

    // No explicit return value needed for a script, but for clarity, could return a status.
    // The original `return 0;` was effectively a no-op after `console.log`.
}

/**
 * Recursive function to explore all combinations of active time slots
 * and calculate the maximum profit. This uses a backtracking approach.
 * @param {number} currentSlotConsidered - The index of the time slot currently being evaluated (0-9).
 * @param {boolean[]} activeTimeSlots - An array indicating which time slots are currently active.
 * @param {number[][]} businessAvailability - 2D array of business availability data.
 * @param {number[][]} profitTable - 2D array of profit values based on overlapping active slots.
 * @returns {number} The maximum profit achievable from the current state onwards.
 */
function recursiveProfitExplorer(currentSlotConsidered, activeTimeSlots, businessAvailability, profitTable) {
    // Base Case: All 10 time slots have been considered.
    // Now, calculate the profit for this specific combination of active slots.
    if (currentSlotConsidered >= 10) {
        // Check if at least one time slot is active. If none are active, this is an invalid configuration.
        // Using `some` for conciseness.
        const noSlotsAreSelected = !activeTimeSlots.some(slotStatus => slotStatus);

        if (noSlotsAreSelected) {
            // If no slots are selected, this configuration is invalid or yields no profit.
            // Return a very small number to ensure it's not chosen as a maximum.
            return UNDESIRABLE_PROFIT_VALUE;
        }

        // Calculate the number of overlapping active slots for each business.
        // Initialize an array to store these counts.
        const overlappingActiveSlotsCount = new Array(businessAvailability.length).fill(0);

        // Iterate through each business and each time slot to find overlaps.
        for (let businessIndex = 0; businessIndex < businessAvailability.length; businessIndex++) {
            let currentBusinessOverlap = 0; // Counter for the current business
            for (let slotIdx = 0; slotIdx < 10; slotIdx++) {
                // If the slot is active AND the business is available in that slot, it's an overlap.
                if (activeTimeSlots[slotIdx] && businessAvailability[businessIndex][slotIdx] === 1) {
                    currentBusinessOverlap++;
                }
            }
            overlappingActiveSlotsCount[businessIndex] = currentBusinessOverlap;
        }

        // Calculate the total profit for this specific combination of active slots.
        // Use reduce for a more functional approach to sum profits.
        const currentScenarioProfit = overlappingActiveSlotsCount.reduce((totalProfit, overlapCountForBusiness, businessIndex) => {
            // Add the profit corresponding to the number of overlaps for this business.
            // Use Math.min to prevent out-of-bounds access if overlapCountForBusiness somehow exceeds 10.
            const safeOverlapCount = Math.min(overlapCountForBusiness, 10);
            return totalProfit + profitTable[businessIndex][safeOverlapCount];
        }, 0); // Start total profit at 0

        return currentScenarioProfit; // Return the profit for this completed scenario.
    }

    // Recursive Step: Explore two paths for the current time slot:
    // 1. The current time slot is NOT active.
    // 2. The current time slot IS active.

    // Path 1: Current slot (currentSlotConsidered) is NOT active.
    // Simply move to the next slot without changing the active status of the current slot.
    const profitWithoutCurrentSlot = recursiveProfitExplorer(currentSlotConsidered + 1, activeTimeSlots, businessAvailability, profitTable);

    // Path 2: Current slot (currentSlotConsidered) IS active.
    // Mark the current slot as active.
    activeTimeSlots[currentSlotConsidered] = true;
    // Recursively call for the next slot with the current slot now active.
    const profitWithCurrentSlot = recursiveProfitExplorer(currentSlotConsidered + 1, activeTimeSlots, businessAvailability, profitTable);
    // Backtrack: Reset the current slot's active status for subsequent explorations
    // (important for other branches of the recursion tree).
    activeTimeSlots[currentSlotConsidered] = false;

    // Return the maximum profit found between these two paths.
    return Math.max(profitWithoutCurrentSlot, profitWithCurrentSlot);
}