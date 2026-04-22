// A utility function to process raw input from a file system source.
// This function determines the number of switches (N), lights (M),
// the connections between them, and the required parity for each light.
function evaluateSwitchConfigurations(rawInputText) {
    // 1. Initial data preparation: Clean and segment the incoming text.
    //    Remove leading/trailing whitespace and split into individual lines.
    const inputLines = rawInputText.trim().split('\n');

    // 2. Extract core system parameters: N (number of switches) and M (number of lights).
    //    The first line contains these two space-separated integers.
    //    Using destructuring for clarity.
    const [numSwitches, numLights] = inputLines[0].split(' ').map(Number);

    // 3. Parse switch-to-light connection details.
    //    Each light (from 1 to M) has its own line describing connected switches.
    //    The format is 'k s_1 s_2 ... s_k', where 'k' is the count of connected switches.
    const lightSwitchMaps = [];
    // Loop through the lines corresponding to light connections.
    // These are lines 1 through M (inclusive) in the 0-indexed inputLines array.
    for (let currentLightLineIdx = 1; currentLightLineIdx <= numLights; currentLightLineIdx++) {
        // Parse each line into an array of numbers.
        const connectionData = inputLines[currentLightLineIdx].split(' ').map(Number);
        // The first element is the count 'k', the rest are switch indices.
        lightSwitchMaps.push(connectionData);
    }

    // 4. Parse the expected parity for each light.
    //    This data is found on the line immediately following the light connection details.
    //    It's line M + 1 (0-indexed) in the inputLines array.
    const desiredLightParities = inputLines[numLights + 1].split(' ').map(Number);

    // Initialize a counter for switch configurations that satisfy all light parities.
    let totalValidConfigurations = 0;

    // Helper function to check if a single light's parity condition is met.
    // This encapsulates the logic for evaluating one light given a switch state.
    const checkSingleLightParity = (
        lightIndex,                 // The 0-indexed index of the light being checked.
        currentSwitchStatesString,  // A binary string representing the state of all switches (e.g., "0101").
        connectionsRegistry,        // The parsed light-to-switch connection data.
        targetParities              // The desired parity (0 or 1) for each light.
    ) => {
        // Extract connection details for the current light.
        // The first element of connectionsRegistry[lightIndex] is 'k' (count of switches).
        // The rest are the 1-indexed switch numbers.
        const connectedSwitchIndices = connectionsRegistry[lightIndex].slice(1);
        const numberOfConnectedSwitches = connectionsRegistry[lightIndex][0];

        let illuminatedSwitchCount = 0; // Counts how many connected switches are 'on' (state 1).

        // Iterate through each switch connected to this specific light.
        for (let connIdx = 0; connIdx < numberOfConnectedSwitches; connIdx++) {
            const switchIdentifier = connectedSwitchIndices[connIdx]; // This is 1-indexed.
            // Retrieve the state of the switch from the binary string.
            // Remember to adjust for 0-indexed string access: switchIdentifier - 1.
            const switchState = parseInt(currentSwitchStatesString[switchIdentifier - 1], 10);
            illuminatedSwitchCount += switchState;
        }

        // Compare the calculated parity (sum % 2) with the desired parity for this light.
        return (illuminatedSwitchCount % 2) === targetParities[lightIndex];
    };


    // 5. Main loop: Iterate through all possible combinations of switch states.
    //    There are 2^N possible combinations for N switches.
    //    We iterate from 0 up to (2^N - 1).
    //    The `1 << numSwitches` expression is a bitwise way to calculate 2^N.
    const totalCombinations = 1 << numSwitches;
    for (let configValue = 0; configValue < totalCombinations; configValue++) {
        // Convert the current integer 'configValue' into its binary representation.
        // Pad with leading zeros to ensure it always has 'numSwitches' length.
        // This binary string represents the states of all switches (e.g., "010" for N=3).
        const currentSwitchStatesBinary = configValue.toString(2).padStart(numSwitches, '0');

        let configurationIsValid = true; // Assume valid until proven otherwise.

        // Iterate through each light to check if its parity condition is met.
        for (let lightIdx = 0; lightIdx < numLights; lightIdx++) {
            // Use the helper function to determine if the current light's condition is satisfied.
            if (!checkSingleLightParity(lightIdx, currentSwitchStatesBinary, lightSwitchMaps, desiredLightParities)) {
                // If even one light's parity is not met, this entire switch configuration is invalid.
                configurationIsValid = false;
                break; // No need to check other lights for this configuration.
            }
        }

        // If after checking all lights, the configuration is still deemed valid, increment the counter.
        if (configurationIsValid) {
            totalValidConfigurations++;
        }
    }

    // 6. Output the final count of valid switch configurations.
    console.log(totalValidConfigurations);
}

// Entry point: Read input from standard input and pass it to the main processing function.
evaluateSwitchConfigurations(require("fs").readFileSync("/dev/stdin", "utf8"));