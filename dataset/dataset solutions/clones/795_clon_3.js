const fileSystem = require('fs');

const calculateTotalSeconds = (timeComponentStr) => {
    // Break down the HH:MM:SS string into its constituent parts.
    const timeParts = timeComponentStr.split(':');

    // Validate that we have exactly three components (hours, minutes, seconds).
    if (timeParts.length !== 3) {
        // In a real application, this might throw an error or handle malformed input more robustly.
        console.error(`Error: Malformed time string provided: ${timeComponentStr}`);
        return 0; // Defaulting to zero for potentially invalid input.
    }

    // Convert string parts to integers. Using parseInt for explicit base 10.
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);

    // Basic numerical validation for parsed components.
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        console.error(`Error: Non-numeric time components in: ${timeComponentStr}`);
        return 0;
    }

    // Compute the total duration in seconds from an arbitrary start point (e.g., midnight).
    return (hours * 3600) + (minutes * 60) + seconds;
};

// Main application logic encapsulated to prevent global variable pollution.
(function processSchedulingData() {
    // Read the entire standard input stream as a string, using UTF-8 encoding.
    let fullInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Trim any leading/trailing whitespace from the input and split it into an array of lines.
    let inputLineCollection = fullInputContent.trim().split('\n');

    // Continuously process data blocks until a specific termination signal is found.
    while (true) {
        // Extract the first line of the current block, which indicates the number of entries.
        // Convert the string to an integer explicitly using parseInt.
        let currentBlockEntryCount = parseInt(inputLineCollection.shift(), 10);

        // If the entry count is zero, it's the termination signal for the entire input.
        if (currentBlockEntryCount === 0) {
            break; // Exit the main processing loop.
        }

        // Initialize an array to hold all interval objects for the current block.
        // Each interval will be a two-element array: [startInSeconds, endInSeconds].
        let rawIntervalsInCurrentBlock = [];

        // Loop `currentBlockEntryCount` times to parse each interval definition.
        for (let i = 0; i < currentBlockEntryCount; ++i) {
            // Get the next line which contains the start and end time strings.
            let intervalDefinitionLine = inputLineCollection.shift();

            // Perform basic validation to ensure the line is not empty or undefined.
            if (!intervalDefinitionLine) {
                console.error("Warning: Encountered an unexpected empty line or end of input while expecting an interval definition.");
                continue; // Skip to the next iteration if the line is invalid.
            }

            // Split the line into two time strings: "HH:MM:SS" for start and end.
            const timeStringComponents = intervalDefinitionLine.split(' ');

            // Ensure that we have exactly two time string components.
            if (timeStringComponents.length !== 2) {
                console.error(`Warning: Malformed interval definition line: "${intervalDefinitionLine}". Expected two time strings.`);
                continue;
            }

            // Convert both start and end time strings into total seconds.
            let commencementInSeconds = calculateTotalSeconds(timeStringComponents[0]);
            let conclusionInSeconds = calculateTotalSeconds(timeStringComponents[1]);

            // Store the converted interval into our collection.
            rawIntervalsInCurrentBlock.push([commencementInSeconds, conclusionInSeconds]);
        }

        // Sort the collected intervals primarily by their starting times.
        // This is a prerequisite for the greedy algorithm used to minimize resources.
        rawIntervalsInCurrentBlock.sort((intervalA, intervalB) => intervalA[0] - intervalB[0]);

        // This array will store the ending times of currently busy resources.
        // It helps determine if an existing resource can be reused or if a new one is needed.
        let activeResourceCompletionTimes = [];

        // This counter will keep track of the total number of resources (e.g., trains, platforms) required.
        let totalResourcesRequired = 0;

        // Iterate through each interval to assign it to an available resource or allocate a new one.
        rawIntervalsInCurrentBlock.forEach(currentIntervalPair => {
            const currentIntervalStart = currentIntervalPair[0];
            const currentIntervalEnd = currentIntervalPair[1];

            // Find the resource that becomes free earliest among the currently active ones.
            let indexOfEarliestFreeResource = -1;
            let earliestFreeTime = Infinity;

            for (let k = 0; k < activeResourceCompletionTimes.length; k++) {
                if (activeResourceCompletionTimes[k] < earliestFreeTime) {
                    earliestFreeTime = activeResourceCompletionTimes[k];
                    indexOfEarliestFreeResource = k;
                }
            }

            // Decision logic:
            // 1. If no resources are currently active, or
            // 2. If the earliest available resource finishes AFTER the current interval starts,
            //    then we must allocate a new resource.
            if (activeResourceCompletionTimes.length === 0 || earliestFreeTime > currentIntervalStart) {
                totalResourcesRequired++;
                activeResourceCompletionTimes.push(currentIntervalEnd);
            } else {
                // An existing resource can be reused.
                // Remove the resource that is now free (i.e., the one with `earliestFreeTime`).
                // Then, update it with the end time of the current interval.
                if (indexOfEarliestFreeResource !== -1) {
                    activeResourceCompletionTimes.splice(indexOfEarliestFreeResource, 1);
                }
                activeResourceCompletionTimes.push(currentIntervalEnd);
            }
        });

        // Output the final count of resources needed for the current block of intervals.
        console.log(totalResourcesRequired);
    }
})(); // Execute the immediately invoked function expression.