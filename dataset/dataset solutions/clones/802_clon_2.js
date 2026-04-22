var dataStream = require('fs').readFileSync('/dev/stdin', 'utf8'); // Load raw data from standard input path, ensuring UTF-8 encoding

// Process the incoming data: clean whitespace and divide into an array of lines
var lineSegments = (dataStream.trim()).split("\n");

// Begin an iterative processing loop; it will continue indefinitely until a specific termination condition is met
while (true)
{
    // Extract the first line, split it by spaces, and convert each part into a numerical value
    var numericConfiguration = (lineSegments.shift()).split(" ").map(Number);

    /*
     * Check for the termination condition: if all three primary configuration values
     * are zero, it signals the end of input, and the loop should be exited.
     */
    if (numericConfiguration[0] == 0 && numericConfiguration[1] == 0 && numericConfiguration[2] == 0)
        break;

    // Assign individual configuration values to more descriptive variables for clarity
    var itemCount = numericConfiguration[0]; // Represents the total number of items to process
    var targetPosition = numericConfiguration[1] - 1; // The zero-based index of a specific item
    var penaltyPercentage = numericConfiguration[2]; // A percentage value used for deductions

    // Initialize an empty array to store item values and a variable to accumulate a total score
    var itemValues = [];
    var accumulatedScore = 0;

    // Loop through each item, as determined by 'itemCount'
    for (var currentIdx = 0; currentIdx < itemCount; currentIdx++)
    {
        // Retrieve the next line from the input and convert it to a number
        var itemVal = parseInt(lineSegments.shift(), 10); // Using parseInt for explicit number conversion

        itemValues.push(itemVal); // Add the processed item value to our collection

        // Accumulate the score, multiplying each item's value by 100
        accumulatedScore += (itemVal * 100);
    }

    // Apply a percentage deduction to the accumulated score based on 'penaltyPercentage'
    accumulatedScore = accumulatedScore * (100 - penaltyPercentage) / 100;

    // Initialize the final calculated output variable
    var finalCalculation = 0;

    // Check if the item at the target position is non-zero to avoid division by zero
    if (itemValues[targetPosition] != 0)
    {
        // Calculate the final result by dividing the adjusted score by the target item's value,
        // then round down to the nearest whole number
        finalCalculation = Math.floor(accumulatedScore / itemValues[targetPosition]);
    }

    // Output the computed final result to the console
    console.log(finalCalculation);
}