const INITIAL_CAPITAL = 100.0;
const COMPOUND_GROWTH_FACTOR = 1.01;

/**
 * Extracts a numeric value from the first non-empty line of a given string.
 * Handles trimming and basic numeric conversion.
 * @param {string} rawInputContent - The multi-line string input.
 * @returns {number} The parsed numeric target, or NaN if parsing fails.
 */
function extractNumericTarget(rawInputContent) {
    const contentLines = String(rawInputContent || '').trim().split('\n');

    if (contentLines.length === 0 || contentLines[0].trim() === '') {
        return NaN; // No meaningful input line
    }

    const firstLineValue = parseFloat(contentLines[0].trim());
    return isNaN(firstLineValue) ? NaN : firstLineValue;
}

/**
 * Simulates a financial growth process to determine the number of periods
 * required for an initial capital to reach a specified target amount
 * under a constant compound growth factor.
 *
 * @param {string} sourceDataString - The raw input data, expected to contain
 *                                    the target amount on the first line.
 */
function simulateFinancialGrowth(sourceDataString) {
    const targetInvestmentGoal = extractNumericTarget(sourceDataString);

    // Validate the parsed target goal. It must be a non-negative number.
    if (isNaN(targetInvestmentGoal) || targetInvestmentGoal < 0) {
        console.error("Error: The desired investment goal must be a valid non-negative number.");
        return; // Terminate execution due to invalid input
    }

    let currentPortfolioValue = INITIAL_CAPITAL;
    let elapsedGrowthPeriods = 0;

    // Continue compounding until the portfolio value meets or exceeds the target.
    while (currentPortfolioValue < targetInvestmentGoal) {
        currentPortfolioValue = currentPortfolioValue * COMPOUND_GROWTH_FACTOR; // Apply the compound growth
        elapsedGrowthPeriods += 1;                                            // Increment the period counter
    }

    // Output the total number of growth periods calculated.
    console.log(elapsedGrowthPeriods);
}

// Entry point for executing the simulation with data from standard input.
// Reads the entire content of /dev/stdin as a UTF-8 string.
simulateFinancialGrowth(require('fs').readFileSync('/dev/stdin', 'utf8'));