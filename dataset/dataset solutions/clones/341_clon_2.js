var costTable = {}; // This object will store the minimum costs for various unit combinations.

// Begin iterating through possible values for the first component, named 'factorA'.
for (var factorA = 0; factorA <= 25; factorA++) {
    // Nested loop for the second component, 'factorB'.
    for (var factorB = 0; factorB <= 16; factorB++) {
        // Innermost loop for the third component, 'factorC'.
        for (var factorC = 0; factorC <= 10; factorC++) {

            // Calculate the aggregate sum of units based on current factor values.
            var totalUnits = (200 * factorA) + (300 * factorB) + (500 * factorC);

            // If the total units exceed a specified upper boundary, this combination is invalid.
            if (totalUnits > 5000) {
                continue; // Skip to the next combination of factors.
            }

            // Initialize the current monetary value for this specific combination of units.
            var currentValue = 0.0; // Using a float to emphasize numerical type.

            // Add costs for 'factorA' in bulk, applying a discount percentage.
            currentValue += (380 * 5 * 0.80 * Math.floor(factorA / 5));
            // Add costs for 'factorB' in bulk, with its own discount.
            currentValue += (550 * 4 * 0.85 * Math.floor(factorB / 4));
            // Add costs for 'factorC' in bulk, including its respective discount.
            currentValue += (850 * 3 * 0.88 * Math.floor(factorC / 3));

            // Add costs for the remaining individual units of 'factorA' (not part of bulk).
            currentValue += (380 * (factorA % 5));
            // Add costs for the remaining individual units of 'factorB'.
            currentValue += (550 * (factorB % 4));
            // Add costs for the remaining individual units of 'factorC'.
            currentValue += (850 * (factorC % 3));

            // Check if an entry for 'totalUnits' already exists in 'costTable'.
            if (costTable.hasOwnProperty(totalUnits)) {
                // If it exists, update it only if the 'currentValue' is lower (finding the minimum).
                costTable[totalUnits] = Math.min(costTable[totalUnits], currentValue);
            } else {
                // If no entry exists, create a new one with the calculated 'currentValue'.
                costTable[totalUnits] = currentValue;
            }
        }
    }
}

// Read the entire content from the standard input stream synchronously.
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
var inputLines = (fileContent.trim()).split("\n");

// Enter a continuous loop to process each query provided in the input.
while (true) {
    // Extract the next numerical query key from the array of input lines.
    var searchKey = parseInt(inputLines.shift(), 10);

    // If the extracted key is zero, it signifies the end of the input queries.
    if (searchKey === 0) {
        break; // Terminate the processing loop.
    }

    // Output the pre-calculated cost from 'costTable' corresponding to the 'searchKey'.
    console.log(costTable[searchKey]);
}