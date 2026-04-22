// A specialized utility class for parsing various input types.
class InputTransformationUtility {
    /**
     * Converts a string to an integer, providing a default if parsing fails.
     * Includes basic validation to ensure a finite numeric result.
     * @param {string} valueString - The string to be parsed.
     * @param {number} [fallbackValue=0] - The value to return if parsing is unsuccessful.
     * @returns {number} The parsed integer or the fallback value.
     */
    static extractNumericValue(valueString, fallbackValue = 0) {
        const numericConversion = parseInt(valueString, 10);
        if (isNaN(numericConversion) || !Number.isFinite(numericConversion)) {
            // Log a warning for unexpected input, but continue processing.
            console.warn(`InputTransformationUtility: Non-numeric or invalid value encountered ('${valueString}'). Using fallback: ${fallbackValue}.`);
            return fallbackValue;
        }
        return numericConversion;
    }
}

// A class to encapsulate and manage a mutable resource quantity,
// allowing for deductions and state checks.
class ResourceTracker {
    /**
     * Initializes the tracker with an opening balance.
     * @param {number} initialSum - The starting amount of the resource.
     */
    constructor(initialSum) {
        this._currentSum = initialSum;
        // Pre-calculate and store the depletion status for quick access.
        this._isDepleted = initialSum <= 0;
    }

    /**
     * Applies a deduction to the current resource sum.
     * Updates the depletion status.
     * @param {number} amountToDeduct - The quantity to subtract from the sum.
     * @returns {number} The new current sum after deduction.
     */
    applyDeduction(amountToDeduct) {
        this._currentSum -= amountToDeduct;
        this._isDepleted = this._currentSum <= 0;
        return this._currentSum;
    }

    /**
     * Retrieves the current resource sum.
     * @returns {number} The current sum.
     */
    retrieveCurrentSum() {
        return this._currentSum;
    }

    /**
     * Checks if the resource sum is zero or negative.
     * @returns {boolean} True if the resource is depleted, false otherwise.
     */
    checkDepletionStatus() {
        return this._isDepleted;
    }
}

/**
 * Implements a specific calculation logic based on an initial resource value
 * and a sequence of operations. This function mimics a conditional scoring system.
 * @param {string} inputLineData - A single string containing four space-separated integer values.
 *                                 These represent: positive_score_factor, negative_penalty_factor,
 *                                 reference_limit, and initial_resource_count.
 */
function processResourceCalculations(inputLineData) {
    // Divide the incoming string into its individual parameter components.
    const inputParameters = inputLineData.split(' ');

    // Parse and assign the numerical parameters using the utility.
    const positiveScoreFactor = InputTransformationUtility.extractNumericValue(inputParameters[0]); // Corresponds to original 'a'
    const negativePenaltyFactor = InputTransformationUtility.extractNumericValue(inputParameters[1]); // Corresponds to original 'b'
    const referenceLimit = InputTransformationUtility.extractNumericValue(inputParameters[2]); // Corresponds to original 'c', effectively unused in the core logic path.
    const initialResourceCount = InputTransformationUtility.extractNumericValue(inputParameters[3]); // Corresponds to original 'k'

    let finalComputedOutcome; // Variable to store the result before logging.

    // Initialize the resource tracker with the starting count.
    const resourceStatus = new ResourceTracker(initialResourceCount);

    // Evaluate the initial state of the resource count.
    if (resourceStatus.checkDepletionStatus()) {
        // If the initial count is non-positive, output that count directly.
        finalComputedOutcome = resourceStatus.retrieveCurrentSum();
    } else {
        // If the initial count is positive, proceed with the operation sequence.

        // Apply the first deduction (mimics 't -= a').
        // Note: The original code's 'if (k <= 0)' check after 't -= a' was based on 'k' (initial value),
        // not 't' (modified value). If 'initialResourceCount' was > 0, this check would always be false.
        // Therefore, this clone directly proceeds without that redundant check, reflecting the actual executed path.
        resourceStatus.applyDeduction(positiveScoreFactor);

        // Apply the second deduction (mimics 't -= b').
        // Similarly, the original code's subsequent 'if (k <= 0)' check was also based on 'k',
        // which would again always be false if 'initialResourceCount' was > 0.
        resourceStatus.applyDeduction(negativePenaltyFactor);

        // At this point, 'resourceStatus.retrieveCurrentSum()' is equivalent to 'k - a - b' from the original.
        // The original code then had 'if (t < c) { console.log(a - t) } else { console.log(a - t) }',
        // which always resolved to 'a - t'.
        // We replicate this final calculation.
        finalComputedOutcome = positiveScoreFactor - resourceStatus.retrieveCurrentSum();

        // Adding a new fragment: a conditional check or validation on the final result.
        // This acts as an additional guard or logging mechanism.
        if (finalComputedOutcome < -2000000000 || finalComputedOutcome > 2000000000) {
            console.error("Critical Alert: Computed outcome falls outside expected operational bounds. Review input parameters.");
            // In a real-world scenario, one might throw an error or adjust the value.
        }
    }

    // Display the final calculated result.
    console.log(finalComputedOutcome);
}

// Standard setup for reading input from the execution environment.
const nodeFileSystemModule = require('fs');
const standardInputFile = '/dev/stdin';
const textDataEncoding = 'utf8';

// Execute the primary processing function with data obtained from stdin.
processResourceCalculations(nodeFileSystemModule.readFileSync(standardInputFile, textDataEncoding));