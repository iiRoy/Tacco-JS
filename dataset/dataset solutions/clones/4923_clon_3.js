function processInputData(sourceDataString) {
    // Variables to hold the dynamically adjusted accumulated values for X and Y.
    // These represent the current target minimums that must be met or exceeded.
    let accumulatedXValue = 0;
    let accumulatedYValue = 0;
 
    // Split the entire input string into an array of individual lines.
    // The first line contains the count of subsequent data entries.
    const inputLines = sourceDataString.split("\n");
 
    // Parse the total number of data entries to process from the first line.
    const totalDataEntries = parseInt(inputLines[0], 10);
    
    // Validate the number of entries: ensure it's a non-negative integer.
    if (isNaN(totalDataEntries) || totalDataEntries < 0) {
        console.error("Error: The first line must contain a valid non-negative integer representing the number of data entries.");
        return; // Exit if input is invalid
    }
    
    // This console.log was for debugging and is now removed as per Type III changes.
    // console.log("Number of entries to process: " + totalDataEntries);
 
    // Iterate through each data entry, starting from the second line (index 1).
    for (let currentEntryIndex = 1; currentEntryIndex <= totalDataEntries; ++currentEntryIndex) {
        // Guard clause: Check if the current line actually exists in the input array.
        if (currentEntryIndex >= inputLines.length || inputLines[currentEntryIndex].trim() === "") {
            console.warn(`Warning: Data line for entry ${currentEntryIndex} is missing or empty. Skipping this entry.`);
            continue; // Move to the next iteration
        }

        // Split the current line by space to get individual X and Y string components.
        // Trim whitespace to handle potential leading/trailing spaces.
        const lineComponents = inputLines[currentEntryIndex].trim().split(" ");
        
        // Guard clause: Ensure there are exactly two components (X and Y) on the line.
        if (lineComponents.length < 2) {
            console.warn(`Warning: Malformed data line at index ${currentEntryIndex}. Expected two values, found ${lineComponents.length}. Skipping.`);
            continue;
        }

        // Convert string components to numeric values.
        const currentXComponent = Number(lineComponents[0]);
        const currentYComponent = Number(lineComponents[1]);

        // Guard clause: Validate that parsed components are indeed numbers.
        if (isNaN(currentXComponent) || isNaN(currentYComponent)) {
            console.warn(`Warning: Non-numeric values found on line ${currentEntryIndex}. Skipping this entry.`);
            continue;
        }
        
        // Guard clause: Ensure X and Y components are positive to prevent division by zero or NaN results later.
        // The original problem context implies positive values for T and A.
        if (currentXComponent <= 0 || currentYComponent <= 0) {
            console.warn(`Warning: Zero or negative value encountered for X or Y on line ${currentEntryIndex}. These values cannot be properly scaled. Skipping.`);
            continue;
        }
        
        // This console.log was for debugging and is now removed as per Type III changes.
        // console.log(`Processing entry ${currentEntryIndex}: X=${currentXComponent}, Y=${currentYComponent}`);
 
        // Core logic: Update the accumulated X and Y values based on the current entry.
        // If current accumulated values are already sufficient (i.e., less than or equal to
        // the current entry's values for both components), we simply adopt the current entry's values.
        if (accumulatedXValue <= currentXComponent && accumulatedYValue <= currentYComponent) {
            accumulatedXValue = currentXComponent;
            accumulatedYValue = currentYComponent;
        } else {
            // If accumulated values are not sufficient (at least one is larger than the current entry),
            // calculate a scaling factor to adjust currentXComponent and currentYComponent upwards.
            // This ensures that the new accumulated values are multiples of currentXComponent/currentYComponent
            // and are large enough to cover the previous accumulatedXValue/accumulatedYValue.
            const ratioForX = accumulatedXValue / currentXComponent;
            const ratioForY = accumulatedYValue / currentYComponent;
            
            // This console.log was for debugging and is now removed as per Type III changes.
            // console.log(`Calculated ratios: X=${ratioForX}, Y=${ratioForY}`);

            // Determine the maximum required scaling factor to satisfy both X and Y conditions,
            // then round it up to the nearest whole number.
            const requiredScalingFactor = Math.ceil(Math.max(ratioForX, ratioForY));
            
            // Apply the scaling factor to the current entry's components to get the new accumulated values.
            accumulatedXValue = currentXComponent * requiredScalingFactor;
            accumulatedYValue = currentYComponent * requiredScalingFactor;
        }
        // This console.log was for debugging and is now removed as per Type III changes.
        // console.log(`Current accumulated values: X=${accumulatedXValue}, Y=${accumulatedYValue}`);
    }
 
    // Output the sum of the final accumulated X and Y values.
    // The explicit newline character is removed, as console.log adds one by default.
    console.log(accumulatedXValue + accumulatedYValue);
}

// This section handles reading from standard input and invoking the main processing function.
// It should typically not be modified for problem submissions.
const fileSystemModule = require("fs"); // Using a descriptive variable name for 'fs'
const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
processInputData(standardInputData);