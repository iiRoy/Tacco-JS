process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedInput = '';
process.stdin.on('data', (chunk) => {
    accumulatedInput += chunk;
});

process.stdin.on('end', () => {
    processData(accumulatedInput.split(/\r?\n/));
});

function processData(inputLines) {
    const businessCount = Number(inputLines[0]);

    const businessAvailability = Array.from({ length: businessCount }, (_, idx) =>
        inputLines[1 + idx].split(' ').map(Number)
    );

    const profitTable = Array.from({ length: businessCount }, (_, idx) =>
        inputLines[1 + businessCount + idx].split(' ').map(Number)
    );

    const maxProfitResult = determineMaxProfit(businessAvailability, profitTable);

    console.log(maxProfitResult);
}

function determineMaxProfit(availabilityData, earningsTable) {
    const totalOperatingDays = 10;
    const totalBusinesses = availabilityData.length;
    let overallBestProfit = Number.MIN_SAFE_INTEGER;

    // Iterate through all possible combinations of open/closed days using a bitmask.
    // Each bit in the mask represents the state of a day (0-9).
    // A '1' bit means the day is open, '0' means it's closed.
    // There are 2^10 (1024) possible combinations.
    // We start from 1 because a mask of 0 (all days closed) is an invalid state
    // according to the original logic, which returns Number.MIN_SAFE_INTEGER for it.
    for (let dayConfigurationMask = 1; dayConfigurationMask < (1 << totalOperatingDays); dayConfigurationMask++) {
        let currentConfigurationProfit = 0;

        // For each business, calculate its profit based on the current day configuration.
        for (let bizIdx = 0; bizIdx < totalBusinesses; bizIdx++) {
            let commonOpenDays = 0; // Counts days this business operates AND is selected in the mask.

            // Check each day (0 to 9) to see if it's open in the current configuration
            // and if the current business operates on that day.
            for (let dayIdx = 0; dayIdx < totalOperatingDays; dayIdx++) {
                // Check if the 'dayIdx'-th bit is set in the dayConfigurationMask.
                const isDaySelectedInConfig = (dayConfigurationMask >> dayIdx) & 1;

                // Check if the business operates on this specific day.
                const businessOperatesOnDay = availabilityData[bizIdx][dayIdx] === 1;

                if (isDaySelectedInConfig && businessOperatesOnDay) {
                    commonOpenDays++;
                }
            }
            // Add the profit for this business based on the count of common open days.
            currentConfigurationProfit += earningsTable[bizIdx][commonOpenDays];
        }
        // Update the overall best profit found across all day configurations.
        overallBestProfit = Math.max(overallBestProfit, currentConfigurationProfit);
    }

    return overallBestProfit;
}
