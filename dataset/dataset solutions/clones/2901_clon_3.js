// Function to process raw input string and calculate a specific metric.
function calculateProcessedValue(rawInputString) {
    // Define a constant for a specific multiplier used in calculations.
    const COMPONENT_MULTIPLIER = 3;

    // Helper function to safely convert a string segment to an integer.
    const extractInteger = (textSegment) => {
        // Using Number() for conversion, which handles various string formats.
        // The bitwise OR 0 ensures it's treated as an integer, effectively flooring for positive numbers.
        return Number(textSegment) | 0;
    };

    // Split the incoming raw data into individual string parts based on a delimiter.
    const dataParts = rawInputString.split(" ");

    // Basic validation: ensure we have at least two numeric components.
    if (dataParts.length < 2) {
        console.error("Error: Insufficient input components provided. Expected at least two numbers.");
        // Return a default or error value if input is malformed, preventing further execution with bad data.
        return 0; 
    }

    // Extract and parse the primary and secondary numeric components from the split parts.
    const primaryCount = extractInteger(dataParts[0]);
    const secondaryQuantity = extractInteger(dataParts[1]);

    // Optional validation: ensure components are non-negative for this calculation's context.
    if (primaryCount < 0 || secondaryQuantity < 0) {
        console.warn("Warning: Negative input values detected. Proceeding with calculation, but results might be unexpected.");
    }

    // Step 1: Calculate the base shares from the secondary quantity.
    // This represents full pairs derived directly from the secondary resource.
    const initialSecondaryPairs = Math.floor(secondaryQuantity / 2);

    // Step 2: Determine any leftover from the secondary quantity after forming full pairs.
    const secondaryRemainder = secondaryQuantity % 2;

    // Step 3: Calculate the modified primary component value.
    // This value is then combined with the secondary remainder to form a new pool.
    const modifiedPrimaryValue = primaryCount * COMPONENT_MULTIPLIER;

    // Step 4: Combine the modified primary value with the secondary remainder.
    // This forms a new aggregate resource pool for further pairing.
    const combinedResourcePool = modifiedPrimaryValue + secondaryRemainder;

    // Step 5: Calculate additional shares from this combined resource pool.
    // These are pairs derived from the combination of primary and secondary leftovers.
    const additionalCombinedPairs = Math.floor(combinedResourcePool / 2);

    // Step 6: The grand total number of shares is the sum of initial secondary pairs and additional combined pairs.
    const grandTotalPairs = initialSecondaryPairs + additionalCombinedPairs;

    // Output the final computed result to the standard output.
    console.log(grandTotalPairs);

    // The function also returns the computed value, making it potentially more useful in other contexts.
    return grandTotalPairs;
}

// This section handles standard input/output operations, reading data from stdin.
// It should not be altered as it manages how the program interacts with its environment.
// It reads the entire standard input asynchronously, converts it to a UTF-8 string,
// and then invokes our primary data processing function with the collected input.
calculateProcessedValue(require("fs").readFileSync("/dev/stdin", "utf8"));