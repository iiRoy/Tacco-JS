function ProcessInput(rawData) {
    // Initialize cumulative tallies for two distinct values, T and A.
    // These will track the minimum required values to satisfy all conditions.
    let currentTallyT = 0;
    let currentTallyA = 0;

    // The input string is split into an array of lines.
    // The first line specifies the total number of subsequent data entries.
    let dataLines = rawData.split("\n");
    let numberOfEntries = parseInt(dataLines[0], 10);

    // Iterate through each data entry, starting from the second line of input.
    for (let entryIndex = 1; entryIndex <= numberOfEntries; entryIndex++) {
        // Each line contains two space-separated values, T and A, for the current entry.
        let temporaryValues = dataLines[entryIndex].split(" ");
        let currentEntryT = parseInt(temporaryValues[0], 10);
        let currentEntryA = parseInt(temporaryValues[1], 10);

        // Check if the current cumulative tallies already meet or exceed the new entry's requirements.
        if ((currentTallyT <= currentEntryT) && (currentTallyA <= currentEntryA)) {
            // If they do, simply update the tallies to the new entry's values.
            // This ensures we always take the largest individual T and A encountered so far
            // if they are both greater than or equal to the current tallies.
            currentTallyT = currentEntryT;
            currentTallyA = currentEntryA;
        } else {
            // If the current tallies are not sufficient, we need to scale up.
            // Calculate the scaling factor required for T and A separately.
            let requiredRatioForT = currentTallyT / currentEntryT;
            let requiredRatioForA = currentTallyA / currentEntryA;

            // Determine the overall scaling factor by taking the maximum of the two ratios,
            // and rounding it up to ensure both conditions are met.
            let overallScalingFactor = Math.ceil(Math.max(requiredRatioForT, requiredRatioForA));

            // Apply this scaling factor to the current entry's values to update the tallies.
            // This ensures the new tallies are a multiple of the current entry's values
            // and are large enough to cover the previous tallies.
            currentTallyT = currentEntryT * overallScalingFactor;
            currentTallyA = currentEntryA * overallScalingFactor;
        }
    }

    // After processing all entries, output the sum of the final cumulative tallies.
    console.log(currentTallyT + currentTallyA);
}

// This section is responsible for reading input from standard input
// and invoking the main processing function. It should remain unaltered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
