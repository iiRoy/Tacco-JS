function ProcessInput(rawData) {
    // Initialize cumulative scores for Takahashi and Aoki.
    let totalTakahashi = 0;
    let totalAoki = 0;

    // The raw input string is split into an array of lines.
    // The first line typically contains the count of subsequent data entries.
    rawData = rawData.split("\n");
    let numEntries = rawData[0];

    // Log the number of entries to the console, as per original behavior.
    console.log(numEntries);

    // Iterate through each data entry, starting from the second line of input.
    for (let idx = 1; idx <= numEntries; idx++) {
        // Split the current line by space to get individual T and A values.
        let tempValues = rawData[idx].split(" ");
        let currentT = tempValues[0] * 1; // Convert string to number for T
        let currentA = tempValues[1] * 1; // Convert string to number for A

        // Check if the current T and A values are sufficient for the cumulative totals.
        if ((totalTakahashi <= currentT) && (totalAoki <= currentA)) {
            // If current values are greater or equal, update the cumulative totals directly.
            totalTakahashi = currentT;
            totalAoki = currentA;
        } else {
            // If not, calculate the necessary scaling factor.
            let tRatio = totalTakahashi / currentT;
            let aRatio = totalAoki / currentA;

            // Determine the maximum ratio and round it up to find the scaling factor.
            let scalingFactor = Math.ceil(Math.max(tRatio, aRatio));

            // Apply the scaling factor to the current T and A values to update cumulative totals.
            totalTakahashi = currentT * scalingFactor;
            totalAoki = currentA * scalingFactor;
        }
    }

    // Output the sum of the final cumulative scores, followed by a newline character.
    console.log(totalTakahashi + totalAoki + "\n");
}

// This line handles reading input from standard input and invoking the main processing function.
// It should not be modified to preserve the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
