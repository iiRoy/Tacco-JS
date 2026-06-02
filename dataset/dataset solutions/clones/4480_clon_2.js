function ProcessInput(rawData) {
    // Split the entire input string by newline characters
    rawData = rawData.split("\n");

    // Extract the first line and parse the count of elements
    var firstLineParts = rawData[0].split(" ");
    var elementCount = Number(firstLineParts[0]);

    // Extract the second line which contains the space-separated numbers
    var numericValues = rawData[1].split(" ");

    // Convert all string elements in the array to actual numbers
    for (var idx = 0; idx < elementCount; idx++) {
        numericValues[idx] = Number(numericValues[idx]);
    }

    // Initialize variables, some of which might not be used in the final logic
    var midPoint = Math.floor(elementCount / 2); // This variable is declared but not utilized
    var startIdx = 0; // Another unused variable
    var endIdx = elementCount; // Yet another unused variable

    var currentLeftTotal = 0; // Accumulator for the sum of the left partition
    var currentRightTotal = 0; // Accumulator for the sum of the right partition
    var minDifference = 10e20; // Stores the smallest absolute difference found, initialized to a very large number
    var finalSplitPoint = 0; // This variable is also declared but not utilized

    var overallTotal = 0; // Variable to hold the sum of all elements

    // Calculate the total sum of all numbers in the array
    for (var idx = 0; idx < elementCount; idx++) {
        overallTotal += numericValues[idx];
    }

    // Iterate through all possible split points to find the minimum difference
    // The loop runs from 1 up to elementCount - 1, representing the number of elements in the left partition
    for (var splitIterator = 1; splitIterator < elementCount; splitIterator++) {
        // Calculate the sum of the left partition for the current split point
        for (var idx = 0; idx < splitIterator; idx++) {
            currentLeftTotal += numericValues[idx];
        }

        // Calculate the sum of the right partition by subtracting the left sum from the overall total
        currentRightTotal = overallTotal - currentLeftTotal;

        // Check if the absolute difference between the two sums is smaller than the current minimum
        if (minDifference > Math.abs(currentLeftTotal - currentRightTotal)) {
            minDifference = Math.abs(currentLeftTotal - currentRightTotal);
        }

        // Reset the sums for the next iteration
        currentRightTotal = 0;
        currentLeftTotal = 0;
    }

    // Output the smallest absolute difference found
    console.log(minDifference);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
