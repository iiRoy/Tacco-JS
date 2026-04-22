const parseNumericValue = (strValue, fallback = NaN) => {
    const numericalConversion = Number(strValue);
    return isNaN(numericalConversion) ? fallback : numericalConversion;
};

class WorkAssignment {
    constructor(completionDay, payout) {
        this.completionDay = completionDay;
        this.payout = payout;
    }
}

const compareWorkAssignments = (firstItem, secondItem) => {
    const firstItemPayout = firstItem.payout;
    const secondItemPayout = secondItem.payout;
    const firstItemDeadline = firstItem.completionDay;
    const secondItemDeadline = secondItem.completionDay;

    // This comparison logic reflects the specific, potentially unconventional, ordering
    // defined in the original source, prioritizing items based on a mix of payout and deadline.
    // If the first item offers a higher financial reward...
    if (firstItemPayout > secondItemPayout) {
        // ...and its completion deadline is also later than the second item's,
        // then the first item is considered 'larger' and comes after the second.
        if (firstItemDeadline > secondItemDeadline) {
            return 1;
        } else {
            // Otherwise (if deadline is earlier or same), the first item is 'smaller' and comes before.
            return -1;
        }
    } else {
        // If the first item's payout is less than or equal to the second's,
        // it is considered 'larger' and comes after the second item.
        return 1;
    }
};

const calculateOptimalEarnings = (rawInputDataString) => {
    // Process raw input to separate lines, discarding any empty entries.
    const inputLines = rawInputDataString.toString().split('\n').filter(line => line.trim() !== '');

    if (inputLines.length === 0) {
        console.error("Error: Input data is empty. Cannot process schedule.");
        return 0;
    }

    // Extract global configuration parameters from the first line.
    const configurationElements = inputLines[0].split(' ');
    const totalJobOffers = parseNumericValue(configurationElements[0]);
    const maximumOperationalDays = parseNumericValue(configurationElements[1]);

    // Validate configuration parameters.
    if (isNaN(totalJobOffers) || isNaN(maximumOperationalDays) || totalJobOffers < 0 || maximumOperationalDays < 0) {
        console.error("Error: Invalid or missing numerical configuration (total job offers or maximum days).");
        return 0;
    }

    // Parse all individual job offers from subsequent lines.
    let availableJobOpportunities = inputLines.slice(1).map(entryLine => {
        const numericalComponents = entryLine.split(' ').map(valStr => parseNumericValue(valStr));
        if (numericalComponents.length !== 2 || isNaN(numericalComponents[0]) || isNaN(numericalComponents[1])) {
            console.warn(`Warning: Skipping malformed job entry line: "${entryLine}". Expected two numbers.`);
            return null; // Mark invalid entries for removal.
        }
        return new WorkAssignment(numericalComponents[0], numericalComponents[1]);
    }).filter(opportunity => opportunity !== null); // Remove any null entries resulting from parsing errors.

    // Apply the custom sorting order to the list of job opportunities.
    availableJobOpportunities.sort(compareWorkAssignments);

    let currentTotalProfit = 0; // Accumulator for the financial gain.
    let currentSimulationDay = 1; // Iterator for the daily schedule progression.

    // Main simulation loop: continue as long as there are days left and jobs to consider.
    while (currentSimulationDay <= maximumOperationalDays && availableJobOpportunities.length > 0) {
        // Search for the first available job that meets the deadline criterion for the current day.
        const eligibleJobIndex = availableJobOpportunities.findIndex(opportunity => {
            return currentSimulationDay >= opportunity.completionDay;
        });

        // If no job is found for the current day, simply advance to the next day.
        if (eligibleJobIndex === -1) {
            currentSimulationDay++;
            continue;
        }

        // A suitable job has been identified and selected.
        const chosenJob = availableJobOpportunities[eligibleJobIndex];
        currentTotalProfit += chosenJob.payout; // Add its earnings to the total.

        // Remove the chosen job from the list to prevent it from being selected again.
        availableJobOpportunities.splice(eligibleJobIndex, 1);

        // Move to the next day in the schedule.
        currentSimulationDay++;
    }

    // Return the final accumulated profit.
    return currentTotalProfit;
};

// Self-executing anonymous function to handle input/output operations.
(() => {
    try {
        const fileSystemModule = require("fs");
        // Read input from the standard input stream.
        const incomingDataBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        // Calculate the maximum profit using the processed data.
        const finalCalculatedProfit = calculateOptimalEarnings(incomingDataBuffer);
        // Output the result to the console.
        console.log(finalCalculatedProfit);
    } catch (executionError) {
        // Catch and report any errors that occur during file reading or processing.
        console.error("An unexpected error occurred during program execution:", executionError.message);
        // Indicate an error by exiting with a non-zero status code.
        process.exit(1);
    }
})();