function ProcessInput(rawData) {
    // Parse the initial configuration values from the first line of input.
    const numItems = parseInt(rawData[0].split(/\s/)[0]);
    const maxDuration = parseInt(rawData.shift().split(/\s/)[1]);

    // Initialize an array to hold processed item data.
    const itemData = [];

    // Iterate over each remaining line of raw data to extract and process item details.
    rawData.forEach(currentEntry => {
        let parts = currentEntry.split(/\s/); // Split the line by whitespace.
        let itemInfo = {
            baseTime: parseInt(parts[0]),
            lowPriorityPoints: parseInt(parts[1]),
            highPriorityPoints: parseInt(parts[2]),
        };
        // Calculate the minimum score achievable for this item.
        itemInfo.minScore = itemInfo.baseTime * itemInfo.lowPriorityPoints;
        // Calculate the maximum potential contribution if maxDuration is spent.
        itemInfo.maxContribution = (maxDuration - itemInfo.baseTime) * itemInfo.highPriorityPoints;
        itemData.push(itemInfo); // Add the processed item to our collection.
    });

    // Sort the items in descending order based on their maximum contribution.
    itemData.sort((firstItem, secondItem) => secondItem.maxContribution - firstItem.maxContribution);

    let totalMinScore = 0; // Accumulator for the sum of minimum scores.
    // Calculate the total minimum score if all items were handled with minimum effort.
    itemData.forEach(currentItem => {
        totalMinScore += currentItem.minScore;
    });

    // console.log(itemData); // Debugging output, commented out as per rules.

    let remainingScore = totalMinScore; // Represents the score difference we need to cover.
    let totalStudyTime = 0; // Accumulator for the total time spent.
    let breakPoint = 0; // Index where the main loop stopped.

    // Main loop to determine the bulk of the study time.
    for (let idx = 0; idx < numItems; idx++) {
        let currentItem = itemData[idx];
        // Reduce the remaining score by the item's full potential contribution.
        remainingScore -= (currentItem.maxContribution + currentItem.minScore);

        if (remainingScore <= 0) {
            // If the remaining score becomes non-positive, we've overshot.
            // Revert the last subtraction to find the exact point.
            remainingScore += (currentItem.maxContribution + currentItem.minScore);
            breakPoint = idx; // Mark this index as the stopping point.
            break; // Exit the loop.
        } else {
            // If still positive, we commit maxDuration to this item.
            totalStudyTime += maxDuration;
        }
    }

    // Final adjustment phase to precisely calculate the remaining time.
    let finalAdjustmentTime = Number.MAX_SAFE_INTEGER; // Initialize with a very large value.
    for (let idx = breakPoint; idx < numItems; idx++) {
        let currentItem = itemData[idx];
        // Calculate the time needed for the current item to cover the remaining score.
        // Use Math.ceil to ensure enough time is allocated, then add base time.
        finalAdjustmentTime = Math.min(finalAdjustmentTime, Math.ceil((remainingScore - currentItem.minScore) / currentItem.highPriorityPoints) + currentItem.baseTime);
        // console.log(finalAdjustmentTime); // Debugging output, commented out.
    }
    totalStudyTime += finalAdjustmentTime; // Add the final adjusted time.

    console.log(totalStudyTime); // Output the final calculated total study time.
}

// The following lines handle reading input from standard input and passing it to the main processing function.
// This part is external to the core algorithm and remains unchanged as per Type II rules.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));
