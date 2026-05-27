function ProcessData(rawData) {
    // Split the raw input into individual lines for processing
    rawData = rawData.split('\n');

    // Parse the total value from the first line
    const totalValue = Number.parseInt(rawData[0]);

    // Parse the values of items from the second line
    const itemValues = rawData[1].split(' ').map(val => Number.parseInt(val));

    // Parse the costs of items from the third line
    const itemCosts = rawData[2].split(' ').map(val => Number.parseInt(val));

    // Calculate the value-to-cost ratios for each item type
    const firstItemRatio = itemValues[0] / itemCosts[0];
    const secondItemRatio = itemValues[1] / itemCosts[1];
    const thirdItemRatio = itemValues[2] / itemCosts[2];

    // Variables to store the indices of items based on their ratios (highest to lowest)
    let topIndex = 0;
    let middleIndex = 0;
    let bottomIndex = 0;

    // Determine the order of items by their ratios
    if (firstItemRatio >= secondItemRatio) {
        if (secondItemRatio >= thirdItemRatio) { // first > second > third
            topIndex = 0;
            middleIndex = 1;
            bottomIndex = 2;
        } else {
            if (firstItemRatio >= thirdItemRatio) { // first > third > second
                topIndex = 0;
                middleIndex = 2;
                bottomIndex = 1;
            } else { // third > first > second
                topIndex = 2;
                middleIndex = 0;
                bottomIndex = 1;
            }
        }
    } else {
        if (firstItemRatio >= thirdItemRatio) { // second > first > third
            topIndex = 1;
            middleIndex = 0;
            bottomIndex = 2;
        } else {
            if (secondItemRatio >= thirdItemRatio) { // second > third > first
                topIndex = 1;
                middleIndex = 2;
                bottomIndex = 0;
            } else { // third > second > first
                topIndex = 2;
                middleIndex = 1;
                bottomIndex = 0;
            }
        }
    }

    // Initialize the final result with the initial total value
    let finalResult = totalValue;

    // Apply different calculation strategies based on item ratios
    if (itemValues[topIndex] / itemCosts[topIndex] >= 1.0) {
        if (itemValues[middleIndex] / itemCosts[middleIndex] >= 1.0) {
            if (itemValues[bottomIndex] / itemCosts[bottomIndex] >= 1.0) {
                // All items have a ratio >= 1.0, prioritize by highest ratio
                finalResult = Math.floor(totalValue / itemCosts[topIndex]) * itemValues[topIndex] +
                              Math.floor((totalValue % itemCosts[topIndex]) / itemCosts[middleIndex]) * itemValues[middleIndex] +
                              Math.floor((totalValue % itemCosts[topIndex] % itemCosts[middleIndex]) / itemCosts[bottomIndex]) * itemValues[bottomIndex] +
                              totalValue % itemCosts[topIndex] % itemCosts[middleIndex] % itemCosts[bottomIndex];
            } else {
                // Only the lowest ratio item has ratio < 1.0
                let tempValue = Math.floor(totalValue / itemValues[bottomIndex]) * itemCosts[bottomIndex] + totalValue % itemValues[bottomIndex];
                finalResult = Math.floor(tempValue / itemCosts[topIndex]) * itemValues[topIndex] +
                              Math.floor((tempValue % itemCosts[topIndex]) / itemCosts[middleIndex]) * itemValues[middleIndex] +
                              tempValue % itemCosts[topIndex] % itemCosts[middleIndex];
            }
        } else {
            // Middle and lowest ratio items have ratio < 1.0
            let tempValue = Math.floor(totalValue / itemValues[bottomIndex]) * itemCosts[bottomIndex] +
                            Math.floor((totalValue % itemValues[bottomIndex]) / itemValues[middleIndex]) * itemCosts[middleIndex] +
                            totalValue % itemValues[bottomIndex] % itemValues[middleIndex];
            finalResult = Math.floor(tempValue / itemCosts[topIndex]) * itemValues[topIndex] + tempValue % itemCosts[topIndex];
        }
    } else {
        // All items have ratio < 1.0, prioritize by lowest ratio for conversion
        finalResult = Math.floor(totalValue / itemValues[bottomIndex]) * itemCosts[bottomIndex] +
                      Math.floor((totalValue % itemValues[bottomIndex]) / itemValues[middleIndex]) * itemCosts[middleIndex] +
                      Math.floor((totalValue % itemValues[bottomIndex] % itemValues[middleIndex]) / itemValues[topIndex]) * itemCosts[topIndex] +
                      totalValue % itemValues[bottomIndex] % itemValues[middleIndex] % itemValues[topIndex];
    }

    // Output the calculated maximum value
    console.log(finalResult);
}

// This section handles standard input/output and should not be modified.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
