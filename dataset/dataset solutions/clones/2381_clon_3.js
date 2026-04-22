const getStandardInputData = () => require("fs").readFileSync("/dev/stdin", "utf8");

// This utility function parses a string into a BigInt,
// ensuring numerical integrity for large numbers.
const parseNumericValueAsBigInt = (stringValue) => {
    // First, parse as an integer to handle base-10 conversion,
    // then convert the result to a BigInt.
    return BigInt(parseInt(stringValue, 10));
};

/**
 * Calculates the number of synchronization points based on provided time intervals and rates.
 * The core logic determines how many times two entities "cross paths" given their
 * initial and cumulative relative distances over two distinct time phases.
 * @param {string} rawInputString - The raw input data from stdin, containing space-separated numbers across lines.
 */
function determineSynchronizationCount(rawInputString) {
    // --- Step 1: Data Preprocessing and Variable Initialization ---

    // Normalize the input string by trimming whitespace, then split it into individual lines.
    // Each line is further split by spaces to isolate numerical components.
    const processedInputLines = rawInputString
        .trim()
        .split("\n")
        .map(lineContent => lineContent.split(" "));

    // Extract and parse the duration values for the two time intervals.
    // These values dictate how long each rate difference is applied.
    const firstPeriodDuration = parseNumericValueAsBigInt(processedInputLines[0][0]); // Analogous to T1
    const secondPeriodDuration = parseNumericValueAsBigInt(processedInputLines[0][1]); // Analogous to T2

    // Extract and parse the individual rate components for "A" over both periods.
    const rateComponentAlpha1 = parseNumericValueAsBigInt(processedInputLines[1][0]); // Analogous to A1
    const rateComponentAlpha2 = parseNumericValueAsBigInt(processedInputLines[1][1]); // Analogous to A2

    // Extract and parse the individual rate components for "B" over both periods.
    const rateComponentBeta1 = parseNumericValueAsBigInt(processedInputLines[2][0]); // Analogous to B1
    const rateComponentBeta2 = parseNumericValueAsBigInt(processedInputLines[2][1]); // Analogous to B2

    // --- Step 2: Calculation of Relative Distances ---

    // Calculate the difference in rates between A and B for the first period.
    const relativeRateDifferenceP1 = rateComponentAlpha1 - rateComponentBeta1;
    // Determine the initial relative distance accumulated during the first period.
    const initialRelativeDistance = relativeRateDifferenceP1 * firstPeriodDuration; // Analogous to d1

    // Calculate the difference in rates between A and B for the second period.
    const relativeRateDifferenceP2 = rateComponentAlpha2 - rateComponentBeta2;
    // Calculate the relative distance accumulated during the second period,
    // then add it to the initial relative distance to get the total cumulative distance.
    let cumulativeRelativeDistance = (relativeRateDifferenceP2 * secondPeriodDuration) + initialRelativeDistance; // Analogous to d2

    // Initialize the final counter for synchronization events.
    let synchronizationCount = 0n; // Using BigInt to match other calculations.

    // --- Step 3: Conditional Logic for Determining Synchronization Count ---

    // Case 1: If the cumulative relative distance is zero, it implies constant synchronization.
    // This typically means the entities are always at the same relative position.
    if (cumulativeRelativeDistance === 0n) {
        synchronizationCount = 'infinity'; // A special string to denote infinite encounters.
    }
    // Case 2: If the initial and cumulative relative distances have opposite signs,
    // this indicates that the entities have crossed paths at least once.
    else if ((initialRelativeDistance * cumulativeRelativeDistance) < 0n) {
        // To simplify division, we ensure the divisor (cumulativeRelativeDistance) is positive.
        let effectiveDivisor = cumulativeRelativeDistance;
        if (effectiveDivisor < 0n) {
            effectiveDivisor = -effectiveDivisor; // Take the absolute value
        }

        // Compute the base number of full "cycles" or periods of relative distance.
        // This gives us how many times the initial distance can cover the effective cumulative distance.
        const baseCycleCount = initialRelativeDistance / effectiveDivisor;

        // Check if there's any remainder from the division.
        // A non-zero remainder implies that the initial distance is not an exact multiple
        // of the effective cumulative distance, suggesting an additional crossing event.
        const hasPartialCycle = (initialRelativeDistance % effectiveDivisor) !== 0n;

        // Each full cycle typically accounts for two synchronization points (crossing in one direction, then back).
        synchronizationCount = baseCycleCount * 2n;

        // If there was a partial cycle (a remainder), it means one more crossing occurred.
        if (hasPartialCycle) {
            synchronizationCount += 1n;
        }
    }
    // Case 3: If the initial and cumulative relative distances have the same sign (or initial is zero),
    // and the cumulative is not zero, they never cross.
    else {
        // In this scenario, no synchronization events occur beyond the initial state.
        synchronizationCount = 0n;
    }

    // --- Step 4: Output the Result ---

    // Print the final calculated count of synchronizations to the console.
    // BigInt values must be converted to strings for standard output.
    console.log(synchronizationCount.toString());
}

// Initiate the synchronization calculation process by passing the standard input data.
determineSynchronizationCount(getStandardInputData());