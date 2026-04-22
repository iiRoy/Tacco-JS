// This script processes a sequence of directional movements and a final target coordinate
// to ascertain if the destination is reachable. Movements are defined by character counts
// between 'T' (turn) symbols.

/**
 * Orchestrates the movement analysis based on provided input data.
 * It parses the movement path, target coordinates, and then determines reachability.
 * @param {string} problemInput The raw input string, typically from standard input.
 */
const analyzeMovementPath = (problemInput) => {
    // Validate the input: ensure it's a non-empty string.
    if (typeof problemInput !== 'string' || problemInput.trim().length === 0) {
        console.log("No input data provided or input is invalid.");
        return;
    }

    // Utility function for robustly converting string to number.
    const convertToNumber = (valueString) => {
        const numericValue = Number(valueString);
        if (isNaN(numericValue)) {
            // In a production scenario, more robust error handling might be needed.
            // For this problem context, we assume valid numeric inputs.
            throw new Error(`Failed to parse numeric value: '${valueString}'`);
        }
        return numericValue;
    };

    // Separate the input into distinct lines.
    const inputSegments = problemInput.trim().split("\r\n");

    // Ensure we have the minimum required input lines: movement string and target coordinates.
    if (inputSegments.length < 2) {
        console.log("Input is incomplete. Expected at least two lines.");
        return;
    }

    // Extract the movement instruction string (e.g., "RRLTLLT").
    const movementPattern = inputSegments[0];
    // Extract and parse the raw target coordinates (e.g., "10 5").
    const rawTargetCoordinates = inputSegments[1].split(" ");

    const finalTargetX = convertToNumber(rawTargetCoordinates[0]);
    const finalTargetY = convertToNumber(rawTargetCoordinates[1]);

    // Break down the movement pattern string by 'T' (turn) characters.
    // Each resulting segment's length represents a number of steps in one direction.
    const movementBlocks = movementPattern.split("T");

    // The very first movement block corresponds to an initial forward movement along the X-axis.
    const initialHorizontalAdvance = movementBlocks[0].length;

    // Calculate the effective target coordinates relative to the initial X-axis movement.
    // The X-axis target becomes the absolute difference from the initial advance.
    // The Y-axis target is simply its absolute value.
    const effectiveTargetX = Math.abs(finalTargetX - initialHorizontalAdvance);
    const effectiveTargetY = Math.abs(finalTargetY);

    // Arrays to store the lengths of subsequent movements for each axis.
    const horizontalMovementLengths = [];
    const verticalMovementLengths = [];

    // Accumulators for the total possible distance along each axis from these subsequent movements.
    let totalPossibleHorizontalDistance = 0;
    let totalPossibleVerticalDistance = 0;

    // Process movement blocks starting from the second one (index 1).
    // Movements alternate between Y and X axes after the initial X move.
    // Block at index 1 is Y, index 2 is X, index 3 is Y, and so on.
    for (let currentBlockIndex = 1; currentBlockIndex < movementBlocks.length; currentBlockIndex++) {
        const currentBlockLength = movementBlocks[currentBlockIndex].length;

        if (currentBlockIndex % 2 === 0) { // Even indices (2, 4, ...) affect the X-axis
            horizontalMovementLengths.push(currentBlockLength);
            totalPossibleHorizontalDistance += currentBlockLength;
        } else { // Odd indices (1, 3, ...) affect the Y-axis
            verticalMovementLengths.push(currentBlockLength);
            totalPossibleVerticalDistance += currentBlockLength;
        }
    }

    // Sort the movement lengths for each axis. This optimization helps the `canFormSum` logic.
    horizontalMovementLengths.sort((a, b) => a - b);
    verticalMovementLengths.sort((a, b) => a - b);

    /**
     * Determines if a specific `targetValue` can be formed by combining a subset of `stepSizes`,
     * considering that movements can be in positive or negative directions along an axis.
     * This is a variation of the subset sum problem.
     *
     * @param {number[]} stepSizes Sorted array of available step lengths for one axis.
     * @param {number} targetValue The absolute target distance for this axis.
     * @param {number} totalAxisMovement The sum of all `stepSizes` for this axis.
     * @returns {boolean} True if the `targetValue` is reachable, false otherwise.
     */
    const canFormSum = (stepSizes, targetValue, totalAxisMovement) => {
        // If the target is beyond the total possible movement, it's impossible.
        if (targetValue > totalAxisMovement) {
            return false;
        }
        // If the target exactly matches the total possible movement, it's reachable.
        if (targetValue === totalAxisMovement) {
            return true;
        }

        // If targetValue < totalAxisMovement, we need to effectively "cancel out" some movement.
        // The net change from totalAxisMovement to targetValue must be even, because each step
        // either contributes positively or negatively, and the sum of changes must be even to
        // achieve an even (or odd) difference with an even (or odd) total.
        const requiredDifference = totalAxisMovement - targetValue;
        if (requiredDifference % 2 !== 0) {
            return false; // Cannot achieve an odd difference by changing direction of integer steps.
        }

        // We need to find a subset of `stepSizes` that sums to `requiredDifference / 2`.
        // This 'half-difference' represents the total length of steps that must be taken
        // in the "opposite" direction to reduce the overall sum to the target.
        const subsetSumTarget = requiredDifference / 2;

        // Use a Set to store all unique sums that can be achieved using subsets of `stepSizes`.
        // Initialize with 0, representing the sum of an empty subset.
        const possibleSums = new Set([0]);

        // Iterate through each available step size.
        for (const currentStepLength of stepSizes) {
            // Create a temporary list of new sums that can be formed by adding `currentStepLength`
            // to the sums already in `possibleSums`.
            const newlyAchievableSums = [];
            for (const existingSum of possibleSums) {
                const candidateSum = existingSum + currentStepLength;
                // Only consider sums that do not exceed our `subsetSumTarget` to optimize.
                if (candidateSum <= subsetSumTarget) {
                    newlyAchievableSums.push(candidateSum);
                }
            }
            // Add all these new sums to our main set of `possibleSums`.
            for (const newSumEntry of newlyAchievableSums) {
                possibleSums.add(newSumEntry);
            }

            // If we've already found the `subsetSumTarget`, we can exit early.
            if (possibleSums.has(subsetSumTarget)) {
                return true;
            }
        }

        // After checking all steps, return true if `subsetSumTarget` was found.
        return possibleSums.has(subsetSumTarget);
    };

    // Check if the adjusted target X-coordinate is reachable using horizontal movements.
    const isXComponentReachable = canFormSum(horizontalMovementLengths, effectiveTargetX, totalPossibleHorizontalDistance);
    // Check if the adjusted target Y-coordinate is reachable using vertical movements.
    const isYComponentReachable = canFormSum(verticalMovementLengths, effectiveTargetY, totalPossibleVerticalDistance);

    // The final target is reachable only if both its X and Y components are independently reachable.
    if (isXComponentReachable && isYComponentReachable) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

// This line handles reading from standard input and invoking the main analysis function.
// It is intentionally left unmodified as per the problem's execution environment.
analyzeMovementPath(require("fs").readFileSync("/dev/stdin", "utf8"));