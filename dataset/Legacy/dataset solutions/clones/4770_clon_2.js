function processInput(rawData) {
    // Divide the incoming raw string into individual lines based on newline characters.
    var inputLines = rawData.split('\n');

    // Extract and parse the numerical parameters from the very first line.
    var firstLineParts = inputLines[0].split(' ');
    var countElements = parseInt(firstLineParts[0]);       // Represents 'n' from the problem statement.
    var costPerUnit = parseInt(firstLineParts[1]);         // Represents 'a' from the problem statement.
    var maxCostPerSegment = parseInt(firstLineParts[2]);   // Represents 'b' from the problem statement.

    // Process the second line to obtain an array of integer values.
    // Each string part is converted into its corresponding integer representation.
    var elementValues = inputLines[1].split(' ').map(tempVal => parseInt(tempVal));

    // Initialize a variable to store the cumulative cost.
    var totalCost = 0;

    // Iterate through the 'elementValues' array, considering adjacent pairs.
    // The loop runs 'countElements - 1' times to cover all segments between elements.
    for (var idx = 0; idx < countElements - 1; idx++) {
        // Calculate the distance between the current element and the next one.
        var segmentDistance = elementValues[idx + 1] - elementValues[idx];

        // Determine the cost for this specific segment.
        // It's the minimum of (distance * cost per unit) or the fixed maximum cost per segment.
        var currentSegmentCost = Math.min(costPerUnit * segmentDistance, maxCostPerSegment);

        // Add the calculated segment cost to the running total.
        totalCost += currentSegmentCost;
    }

    // Display the final computed total cost to the standard output.
    console.log(totalCost);
}

// Read the entire content from standard input (typically /dev/stdin in a Unix-like environment)
// using Node.js's file system module, and then pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
