function ProcessInput(rawData) {
    // Normalize the input: trim whitespace, split into lines, then split each line by spaces.
    rawData = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Declare variables to store parsed configuration and results.
    let configParams = []; // Stores N (number of switches) and M (number of light bulbs).
    let expectedParities = []; // Stores the required parity for each light bulb.
    let unusedVector = []; // This variable is declared but not utilized in the original logic.
    let switchConfigurations = []; // Stores the switch connections for each light bulb.
    let validCombinationsCount = 0; // Counter for successful switch combinations.

    // Declare temporary variables used within loops.
    let currentBinaryString; // Represents a switch combination as a binary string.
    let tempIndex; // An unused temporary index variable, kept for structural consistency.
    let currentBitValue; // The state (0 or 1) of an individual switch.
    let currentSwitchSum; // Accumulates the sum of active switches for parity checks.

    // Parse the first line of input to get N and M.
    configParams = rawData[0].map(element => parseInt(element, 10));

    // Parse the line containing the expected parities for each light bulb.
    // The index is M+1 because the first line is N,M and then M lines for switch configurations.
    expectedParities = rawData[configParams[1] + 1].map(element => parseInt(element, 10));

    // Populate the switch configurations array.
    // Each entry describes a light bulb's connections: first element is count, rest are switch indices.
    for (let configIndex = 1; configIndex <= configParams[1]; configIndex++) {
        switchConfigurations.push(rawData[configIndex].map(element => parseInt(element, 10)));
    }

    // Iterate through all possible switch combinations.
    // There are 2^N combinations. The loop range is chosen to easily get N-bit binary strings
    // by converting 'i' to binary and taking a substring from the second character.
    for (let combinationIterator = Math.pow(2, configParams[0]); combinationIterator < Math.pow(2, configParams[0]) * 2; combinationIterator++) {

        // Convert the current iteration number to its binary representation,
        // then remove the leading '1' to get an N-bit string (e.g., 1010 -> 010).
        currentBinaryString = combinationIterator.toString(2).substr(1);

        // Initialize the cumulative sum of active switches for the current combination.
        currentSwitchSum = 0;

        // Label for breaking out of the inner loop if a parity mismatch is found.
        configurationCheckLoop:
        // Iterate through each light bulb's configuration.
        for (let configIndex = 1; configIndex <= configParams[1]; configIndex++) {

            // For the current light bulb, iterate through its connected switches.
            // The first element of `switchConfigurations[configIndex - 1]` is the count of switches.
            for (let switchPosition = 1; switchPosition <= switchConfigurations[configIndex - 1][0]; switchPosition++) {
                // Get the state (0 or 1) of the specific switch from the binary string.
                // Switch indices are 1-based in input, so adjust to 0-based for string access.
                currentBitValue = parseInt(currentBinaryString[switchConfigurations[configIndex - 1][switchPosition] - 1], 10);
                // Add the switch's state to the running total.
                currentSwitchSum += currentBitValue;
            }

            // Check if the parity of the cumulative sum of active switches (up to this bulb)
            // matches the expected parity for this light bulb.
            // If not, this combination is invalid; break to the next combination.
            if (currentSwitchSum % 2 !== expectedParities[configIndex - 1]) {
                break configurationCheckLoop;
            }

            // If this is the last light bulb and all previous parity checks passed,
            // then this combination of switches is valid.
            if (configIndex === configParams[1]) {
                validCombinationsCount++;
            }
        }
    }

    // Output the total number of valid switch combinations found.
    console.log(validCombinationsCount);
}

// Read the entire standard input, decode it as UTF-8, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
