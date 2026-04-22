// This module processes raw text data to derive specific insights.
function ProcessInputData(rawInputText) {
    // Helper function to parse a space-separated line into an array of numbers.
    // It trims surrounding whitespace and converts each part to a number.
    const parseLineToNumbers = (inputLine) => {
        // Ensure input is a string and handle potential non-string inputs gracefully.
        if (typeof inputLine !== 'string') {
            console.error("Input for line parsing must be a string.");
            return []; // Return an empty array if input is invalid.
        }
        // Trim whitespace from the line, split by spaces, and convert each segment to a number.
        return inputLine.trim().split(" ").map(Number);
    };

    // Split the entire raw input text into individual lines for easier processing.
    const allInputLines = rawInputText.split("\n");

    // Implement an early exit for cases where there's no meaningful input data.
    // If the input is empty or the first line is empty, no calculations can be made.
    if (allInputLines.length === 0 || allInputLines[0].trim() === "") {
        console.log("0"); // Output 0 as no profit can be derived from no data.
        return;
    }

    // Parse the first line of input, which contains critical parameters.
    // This line typically provides the total count of items and a time-related constraint.
    const firstLineValues = parseLineToNumbers(allInputLines[0]);
    const itemCount = firstLineValues[0]; // Represents 'N' in typical problem statements.
    const timeConstraint = firstLineValues[1]; // Represents 'T' in typical problem statements.

    // If the number of items is zero or one, it's impossible to make a profit.
    // An early return handles this edge case to prevent unnecessary processing.
    if (itemCount <= 1) {
        console.log("0");
        return;
    }

    // Parse the second line of input, which contains the sequence of values (e.g., stock prices).
    const valueSequence = parseLineToNumbers(allInputLines[1]);

    // Initialize key variables for tracking profit and its occurrences.
    let maximumProfit = 0; // This variable will store the highest profit value encountered.
    let profitAchievementCount = 0; // This variable counts how many times the maximum profit is achieved.
    // Initialize the current minimum value with the first element of the sequence.
    // This assumes we 'buy' at the first available price point.
    let currentMinimum = valueSequence[0];

    // Iterate through the sequence of values starting from the second element.
    // The first element was already considered for initializing currentMinimum.
    for (let sequenceIndex = 1; sequenceIndex < itemCount; ++sequenceIndex) {
        const currentSequenceValue = valueSequence[sequenceIndex];

        // Calculate the potential profit if we 'buy' at the current lowest price
        // and 'sell' at the current value in the sequence.
        const currentProfitAttempt = currentSequenceValue - currentMinimum;

        // Compare the current profit attempt against the highest profit found so far.
        if (currentProfitAttempt > maximumProfit) {
            maximumProfit = currentProfitAttempt; // A new highest profit has been found.
            profitAchievementCount = 1; // Reset the count as this is a new maximum.
        } else if (currentProfitAttempt === maximumProfit) {
            // If the current profit matches the maximum, increment its occurrence count.
            profitAchievementCount++;
        }

        // Update the current minimum value if the current sequence value is lower.
        // This ensures 'buy' operations are always considered at the lowest possible price.
        currentMinimum = Math.min(currentMinimum, currentSequenceValue);
    }

    // Calculate the final result by taking the minimum of the profit occurrence count
    // and half of the time constraint (integer division).
    // Math.floor ensures that timeConstraint / 2 is an integer.
    const finalResult = Math.min(profitAchievementCount, Math.floor(timeConstraint / 2));
    console.log(finalResult);
}

// Standard input reading for execution in environments like competitive programming platforms.
// Reads the entire content from standard input and passes it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));