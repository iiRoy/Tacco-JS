function ProcessInputData(rawDataString) {
    // Split the raw input string into individual lines, filtering out any empty lines
    // that might result from trailing newlines in the input.
    const sourceLines = rawDataString.split("\n").filter(line => line.trim() !== '');

    // Extract configuration parameters from the first line of the input.
    // This line typically contains the total number of switches and lamps.
    const configurationTokens = sourceLines[0].split(" ");
    const totalSwitches = Number(configurationTokens[0]); // Total available switches (0-indexed)
    const totalLamps = Number(configurationTokens[1]);     // Total lamps to be controlled

    // Extract the target (expected) parity states for each lamp from the last line.
    // These values indicate whether each lamp should be ON (1) or OFF (0) based on switch states.
    const targetParities = sourceLines[sourceLines.length - 1].split(" ").map(Number);

    // Prepare the list of lamp circuit descriptions.
    // These lines describe which switches are connected to each lamp.
    // We slice the array to exclude the configuration line (first) and the target parities line (last).
    const lampCircuitDescriptions = sourceLines.slice(1, sourceLines.length - 1);

    // Initialize a counter for switch configurations that match the target lamp parities.
    let matchingConfigurationsCount = 0;

    // Calculate the total number of possible ON/OFF combinations for the switches.
    // If there are N switches, there are 2^N combinations.
    const totalCombinations = 1 << totalSwitches; // Equivalent to Math.pow(2, totalSwitches)

    // Iterate through every possible combination of switch states.
    // 'currentSwitchBitmask' represents a unique combination where each bit corresponds to a switch's state (1 for ON, 0 for OFF).
    for (let currentSwitchBitmask = 0; currentSwitchBitmask < totalCombinations; currentSwitchBitmask++) {
        // This array will store the calculated parity state for each lamp under the current switch combination.
        let calculatedLampParities = [];

        // For each lamp, determine its state based on the current switch combination.
        for (let lampIdx = 0; lampIdx < lampCircuitDescriptions.length; lampIdx++) {
            const currentCircuitData = lampCircuitDescriptions[lampIdx]; // The string describing connections for this lamp
            
            // Call a helper function to calculate the lamp's parity state.
            const lampState = determineLightState(currentCircuitData, currentSwitchBitmask);
            calculatedLampParities.push(lampState);
        }

        // After calculating parities for all lamps, compare them with the expected target parities.
        // A dedicated helper function is used for robust array comparison.
        if (areArraysEqual(targetParities, calculatedLampParities)) {
            matchingConfigurationsCount++; // Increment if the configurations match
        }
    }

    // Output the final count of matching switch configurations.
    console.log(matchingConfigurationsCount);

    /**
     * Helper function to compare two arrays element by element for equality.
     * @param {Array<Number>} arr1 - The first array to compare.
     * @param {Array<Number>} arr2 - The second array to compare.
     * @returns {boolean} True if arrays are identical in length and content, false otherwise.
     */
    function areArraysEqual(arr1, arr2) {
        // Pre-check for different lengths for early exit.
        if (arr1.length !== arr2.length) {
            return false;
        }
        // Iterate through elements and compare them.
        for (let k = 0; k < arr1.length; k++) {
            if (arr1[k] !== arr2[k]) {
                return false; // Found a mismatch
            }
        }
        return true; // All elements matched
    }

    /**
     * Determines the parity state (0 or 1) of a single lamp based on its connected switches
     * and the current ON/OFF states of all switches.
     * @param {string} circuitDescription - A string describing the lamp's connections (e.g., "3 0 1 2").
     * @param {number} activeSwitchesBitmask - An integer where each bit represents the state of a switch (1=ON, 0=OFF).
     * @returns {number} The parity (0 or 1) of active connections for this lamp.
     */
    function determineLightState(circuitDescription, activeSwitchesBitmask) {
        // Split the description string into tokens to get the count and switch IDs.
        const circuitTokens = circuitDescription.split(" ");
        // The first token is the count of switches connected to this lamp.
        const numberOfConnectedSwitches = Number(circuitTokens[0]);

        let activeConnectionsCounter = 0; // Counts how many connected switches are currently ON.

        // Iterate through the specified connected switches for this lamp.
        // Note: The original logic iterates from index 1 up to (but not including) `numberOfConnectedSwitches`.
        // This behavior is preserved for cloning purposes.
        for (let switchConnectionIdx = 1; switchConnectionIdx < numberOfConnectedSwitches; switchConnectionIdx++) {
            // Convert the switch ID from string to number.
            const connectedSwitchId = Number(circuitTokens[switchConnectionIdx]);

            // Check if the specific switch (identified by connectedSwitchId) is ON in the current 'activeSwitchesBitmask'.
            // The bitwise AND with 1 checks if the bit at 'connectedSwitchId' position is set.
            const isSwitchCurrentlyActive = (activeSwitchesBitmask >> connectedSwitchId) & 1;

            if (isSwitchCurrentlyActive) {
                activeConnectionsCounter++;
            }
        }
        // The lamp's state is determined by the parity (even or odd) of active connections.
        return activeConnectionsCounter % 2;
    }
}

// Below this line is standard boilerplate for competitive programming environments.
// It handles reading input from /dev/stdin and passing it to the main processing function.
// This section should typically remain unedited to ensure compatibility with judging systems.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));