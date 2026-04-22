function processInput(rawData) {
    let accumulatedTime = 0;
    let accumulatedAmount = 0;

    // The raw input string is separated into individual lines
    const dataLines = rawData.split('\n');
    const totalRecords = Number(dataLines[0]); // Extract the total number of data records from the first line

    // Iterate through each subsequent data record
    for (let recordIndex = 1; recordIndex <= totalRecords; recordIndex++) {
        const lineSegments = dataLines[recordIndex].split(' '); // Split the current record line by space
        const currentDuration = Number(lineSegments[0]); // Parse the first segment as a numeric duration
        const currentQuantity = Number(lineSegments[1]); // Parse the second segment as a numeric quantity

        // Evaluate if the current values are already sufficient
        if ((accumulatedTime <= currentDuration) && (accumulatedAmount <= currentQuantity)) {
            accumulatedTime = currentDuration; // Update the running total duration
            accumulatedAmount = currentQuantity; // Update the running total quantity
        } else { // If current values are less than accumulated, a scaling adjustment is required
            const durationFactor = accumulatedTime / currentDuration; // Calculate the ratio for duration
            const quantityFactor = accumulatedAmount / currentQuantity; // Calculate the ratio for quantity

            // Determine the minimum integer multiplier required to meet or exceed current values
            const adjustmentMultiplier = Math.ceil(Math.max(durationFactor, quantityFactor));

            accumulatedTime = currentDuration * adjustmentMultiplier; // Apply the multiplier to the current duration
            accumulatedAmount = currentQuantity * adjustmentMultiplier; // Apply the multiplier to the current quantity
        }
    }
    // Output the final summation of the adjusted accumulated time and amount
    console.log(accumulatedTime + accumulatedAmount);
}

// This final part is responsible for reading standard input and invoking the main processing function.
// It should not be modified to ensure proper system integration.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));