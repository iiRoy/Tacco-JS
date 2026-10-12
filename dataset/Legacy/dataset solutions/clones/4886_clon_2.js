// This function serves as the primary entry point for processing the entire input data.
function ProcessInput(rawData) {

    // A utility function to parse a given line into an array of strings.
    // It removes leading/trailing whitespace and splits the line by spaces.
    const parseStringArray = function(currentLine) {
        // Remove any leading or trailing whitespace before splitting.
        let tempArray = currentLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
        // Iterate through the array; elements are already strings, no conversion needed.
        for (let idx = 0; idx < tempArray.length; ++idx) {
            tempArray[idx] = tempArray[idx]; // Explicitly keep as string type.
        }
        return tempArray;
    };

    // A utility function to parse a given line into an array of numbers.
    // It removes leading/trailing whitespace, splits by spaces, and converts each part to a number.
    const parseNumberArray = function(currentLine) {
        // Remove any leading or trailing whitespace before splitting.
        let tempArray = currentLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
        // Convert each string element in the array to a numeric type.
        for (let k = 0; k < tempArray.length; ++k) {
            tempArray[k] = +tempArray[k]; // Using unary plus for type conversion to number.
        }
        return tempArray;
    };

    // A simple helper function to return the smaller of two provided numeric values.
    const findSmaller = function(val1, val2) {
        return val1 > val2 ? val2 : val1;
    };

    // Split the complete raw input string into an array of individual lines.
    const inputLines = rawData.split("\n");

    // Parse the first line of input, which contains two numbers: N and T.
    const firstLineData = parseNumberArray(inputLines[0]);
    const itemCount = firstLineData[0]; // N represents the total number of data points.
    const thresholdValue = firstLineData[1]; // T is a specific threshold value.

    // Parse the second line of input, which contains the array of data points.
    const dataPoints = parseNumberArray(inputLines[1]);

    // Initialize variables required for calculating the maximum profit and its frequency.
    let maxProfit = 0; // This will store the highest profit difference found.
    let profitOccurrences = 0; // This counts how many times the 'maxProfit' is achieved.
    let currentMin = dataPoints[0]; // Tracks the minimum value encountered in the 'dataPoints' array up to the current iteration.
    let currentMax = dataPoints[0]; // This variable is declared but not utilized in the original algorithm's logic.

    // Iterate through each data point to determine the maximum profit and its count.
    for (let loopIndex = 0; loopIndex < itemCount; ++loopIndex) {
        const currentValue = dataPoints[loopIndex]; // Get the current data point.

        // Check if the difference between the current value and the minimum seen so far
        // is greater than the currently recorded maximum profit.
        if (currentValue - currentMin > maxProfit) {
            maxProfit = currentValue - currentMin; // Update the maximum profit.
            profitOccurrences = 1; // Reset the count as a new maximum profit has been found.
        }
        // If the difference equals the current maximum profit, increment the occurrence count.
        else if (currentValue - currentMin === maxProfit) {
            profitOccurrences++;
        }

        // Update the 'currentMin' if the 'currentValue' is smaller.
        currentMin = currentValue < currentMin ? currentValue : currentMin;
    }

    // Output the result: the smaller value between 'profitOccurrences' and half of 'thresholdValue' (rounded down).
    console.log(findSmaller(profitOccurrences, Math.floor(thresholdValue / 2)));
}

// Read the entire content from standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
