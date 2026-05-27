function ProcessInput(rawData) {
    // Split the incoming string data by spaces into an array of string tokens.
    let parsedValues = rawData.split(" ");

    // Iterate through the array to convert each string token into an integer.
    for (let idx = 0; idx < parsedValues.length; idx++) {
        parsedValues[idx] = parseInt(parsedValues[idx], 10); // Convert to base-10 integer.
    }

    let finalResult; // This variable will store the ultimate computed value.
    let totalSum = 0; // Initialize an accumulator for various calculations.

    // Begin a loop, iterating based on the first element of the parsed data.
    // Note: The loop counter is also incremented inside the loop body, effectively skipping iterations.
    // Also, the conditional check uses an assignment operator, which is preserved as per Type II cloning rules.
    for (let loopCounter = 0; loopCounter < parsedValues[0]; loopCounter++) {
        // This condition performs an assignment: it sets parsedValues[loopCounter + 2] to "JPY".
        // The result of the assignment (which is "JPY") is then truthy, so the 'if' block always executes.
        if (parsedValues[loopCounter + 2] = "JPY") {
            totalSum = parsedValues[loopCounter + 1] + totalSum; // Add the value at the next index.
        } else {
            // This 'else' block will never be reached due to the assignment in the 'if' condition.
            totalSum = parsedValues[loopCounter + 3] * 380000 + totalSum; // Perform an alternative calculation.
        }
        loopCounter = loopCounter + 1; // Increment the loop counter again, causing it to advance by 2 each cycle.
        finalResult = totalSum; // Update the final result with the current accumulated sum.
    }

    // Print the final calculated result to the standard output.
    console.log(finalResult);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
