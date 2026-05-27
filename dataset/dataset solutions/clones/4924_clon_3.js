const { parse } = require("path");

// Helper function to compute ceiling division for BigInts
function calculateCeilingDivision(numeratorValue, denominatorValue) {
    let divisionResult = numeratorValue / denominatorValue;
    if (numeratorValue % denominatorValue !== 0n) {
        divisionResult = divisionResult + 1n;
    }
    return divisionResult;
}

// Main function to process the input data
function processInputData(rawData) {
    const processedLines = rawData.trim().split("\n");

    // Inner helper function to parse a single line into a pair of BigInts
    function parseLineToBigIntPair(lineString) {
        const stringParts = lineString.split(" ");
        const firstInt = parseInt(stringParts[0], 10);
        const secondInt = parseInt(stringParts[1], 10);
        return [BigInt(firstInt), BigInt(secondInt)];
    }

    const numEntries = parseInt(processedLines[0].split(" ")[0], 10);
    const dataPairs = [];

    // Populate dataPairs array by parsing subsequent lines
    for (let idx = 0; idx < numEntries; idx++) {
        dataPairs.push(parseLineToBigIntPair(processedLines[idx + 1]));
    }

    let currentMinValues = [0n, 0n]; // Represents the accumulated minimum T and A values

    // Iterate through each data pair to update currentMinValues
    for (let idx = 0; idx < numEntries; idx++) {
        const itemA = dataPairs[idx][0];
        const itemB = dataPairs[idx][1];

        const requiredA = currentMinValues[0];
        const requiredB = currentMinValues[1];

        // Check if the current item already meets or exceeds the required minimums
        if (itemA >= requiredA && itemB >= requiredB) {
            // If so, simply update currentMinValues to the current item's values
            currentMinValues = [itemA, itemB];
        } else {
            // Otherwise, scaling is required. Determine the necessary multiplier.
            let multiplierForA = 1n;
            if (itemA < requiredA) {
                multiplierForA = calculateCeilingDivision(requiredA, itemA);
            }

            let multiplierForB = 1n;
            if (itemB < requiredB) {
                multiplierForB = calculateCeilingDivision(requiredB, itemB);
            }
            
            // The final multiplier must satisfy both A and B requirements
            const effectiveMultiplier = multiplierForA > multiplierForB ? multiplierForA : multiplierForB;
            
            // Apply the effective multiplier to the current item's values
            currentMinValues = [itemA * effectiveMultiplier, itemB * effectiveMultiplier];
        }
    }
    // Output the sum of the final T and A values
    console.log((currentMinValues[0] + currentMinValues[1]).toString());
}

// Read input from stdin and pass it to the processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
