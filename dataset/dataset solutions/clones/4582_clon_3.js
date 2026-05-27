"use strict";

const processInputData = (inputString) => {
    // Helper function to parse a space-separated string into an array of numbers
    const parseNumericLine = (lineContent) => lineContent.split(" ").map(Number);

    // Pre-process the raw input string into an array of lines
    const inputLines = inputString.trim().split("\n");

    // Parse the first line to get the total item count (N) and the target value (K)
    const [itemCount, targetValue] = parseNumericLine(inputLines[0]);

    // Extract and parse the subsequent lines into an array of item details (AB in original)
    // Each item detail is an array [identifier, quantity]
    const itemDetails = inputLines.slice(1, itemCount + 1).map(parseNumericLine);

    // Initialize a tracker for the cumulative sum, mirroring the 'totalAmount' variable in the original code.
    // It starts with the quantity of the first item.
    let runningSumTracker = itemDetails[0][1];

    // Define the first data point entry for the cumulative data array.
    // Its cumulative quantity is simply its own quantity.
    const initialDataPoint = {
        identifier: itemDetails[0][0],
        quantity: itemDetails[0][1],
        cumulativeQuantity: itemDetails[0][1]
    };

    // Build the array of cumulative data points (equivalent to 'array' in original).
    // Using `reduce` for a structural change, starting with the `initialDataPoint`.
    const cumulativeDataPoints = itemDetails.slice(1).reduce((accumulator, currentItem, currentIndex) => {
        // The `currentIndex` in `reduce` is 0-based for the sliced array.
        // To get the corresponding index in the original `itemDetails` array, we add 1.
        const originalItemIndex = currentIndex + 1;
        
        // Update the running sum tracker by adding the quantity of the *previous* item
        // from the original `itemDetails` array. This replicates the original logic: `totalAmount += AB[i-1][1];`
        runningSumTracker += itemDetails[originalItemIndex - 1][1];
        
        // Create a new data point entry for the current item.
        // Its `cumulativeQuantity` is the `runningSumTracker` at this moment.
        const dataPointEntry = {
            identifier: currentItem[0],
            quantity: currentItem[1],
            cumulativeQuantity: runningSumTracker
        };
        
        // Add the newly created data point to the accumulator array.
        accumulator.push(dataPointEntry);
        return accumulator;
    }, [initialDataPoint]); // The accumulator starts with the first data point

    // Helper function to check if a data point's cumulative quantity meets or exceeds the target value.
    const checkTargetMet = (dataPoint, target) => dataPoint.cumulativeQuantity >= target;

    // Helper function to determine the final identifier based on the specific conditional logic.
    const resolveFinalIdentifier = (currentPoint, priorPoint, target) => {
        // This replicates the original condition: `array[i].totalAmount - array[i].amount < K`
        const valueBeforeCurrentItem = currentPoint.cumulativeQuantity - currentPoint.quantity;
        // If the value before adding the current item's quantity is less than K,
        // then the current item's identifier is the answer. Otherwise, it's the previous item's.
        return valueBeforeCurrentItem < target ? currentPoint.identifier : priorPoint.identifier;
    };

    // Find the index of the first data point in the `cumulativeDataPoints` array
    // that satisfies the `checkTargetMet` condition.
    const firstMatchIndex = cumulativeDataPoints.findIndex(dp => checkTargetMet(dp, targetValue));

    // Process the result based on whether a matching data point was found.
    if (firstMatchIndex !== -1) {
        const currentMatchingPoint = cumulativeDataPoints[firstMatchIndex];
        
        // Retrieve the data point immediately preceding the current matching point.
        // This will be `null` if the first matching point is the very first element (index 0).
        // Based on problem constraints (K > 0 typically), `priorPoint` will only be used
        // when `firstMatchIndex` is greater than 0, ensuring `priorPoint` is a valid object.
        const priorMatchingPoint = firstMatchIndex > 0 ? cumulativeDataPoints[firstMatchIndex - 1] : null;
        
        // Calculate the final result using the specific logic defined in `resolveFinalIdentifier`.
        const finalResult = resolveFinalIdentifier(currentMatchingPoint, priorMatchingPoint, targetValue);
        console.log(finalResult);
    } else {
        // If no data point meets the target condition, output the entire
        // `cumulativeDataPoints` array as a JSON string, as per original fallback behavior.
        console.log(JSON.stringify(cumulativeDataPoints));
    }
};

// Read input from stdin and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
