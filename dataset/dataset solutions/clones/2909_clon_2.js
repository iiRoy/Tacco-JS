function ProcessSystemInput(rawSystemData) {
  // Split the entire input string into an array of lines.
  var processedLines = rawSystemData.split("\n");
  // Remove the last element, which is often an empty string due to trailing newline.
  processedLines.pop();

  // The first line contains system configuration parameters.
  var systemConfig = processedLines[0].split(" ");
  // Parse the total number of switches from the configuration.
  var totalSwitches = parseInt(systemConfig[0]);
  // Parse the total number of lights from the configuration (this variable is not used further in the logic).
  var totalLights = parseInt(systemConfig[1]);
  
  // The last line contains the expected parity states for each light.
  var expectedLightStates = processedLines[processedLines.length - 1].split(" ");
  
  // Remove the configuration line and the expected states line from the main data array.
  processedLines.shift(); // Remove the first line (system configuration)
  processedLines.pop();   // Remove the last line (expected light states)
  
  // Initialize a counter for switch configurations that match the expected light states.
  var matchingConfigurations = 0;
  
  // Iterate through all possible combinations of switch states.
  // (1 << totalSwitches) calculates 2 raised to the power of totalSwitches,
  // representing all binary combinations for the switches.
  for (var currentSwitchCombination = 0; currentSwitchCombination < (1 << totalSwitches); currentSwitchCombination++) {
    // Array to store the calculated parity states for the current switch combination.
    var calculatedLightStates = [];
    
    // For each light circuit definition in the processed lines:
    for (var lightCircuitIndex = 0; lightCircuitIndex < processedLines.length; lightCircuitIndex++) {
      // Calculate the parity state for the current light circuit.
      calculatedLightStates.push(determineLightState(processedLines[lightCircuitIndex], currentSwitchCombination));
    }
    
    // Compare the string representation of the calculated light states with the expected states.
    // If they are identical, increment the matching configurations counter.
    if (expectedLightStates.toString() == calculatedLightStates.toString()) {
      matchingConfigurations++;
    }
  }
  
  // Output the final count of matching switch configurations.
  console.log(matchingConfigurations);
  
  /**
   * Determines the parity state (0 for even, 1 for odd) of a single light circuit.
   * @param {string} circuitDefinition - A string describing the light's connections (e.g., "3 0 1 2").
   * @param {number} activeSwitchMask - A bitmask representing which switches are currently 'on'.
   * @returns {number} The parity (0 or 1) of active connections for this light.
   */
  function determineLightState(circuitDefinition, activeSwitchMask) {
    // Split the circuit definition string into its components.
    var connectionParts = circuitDefinition.split(' ');
    // The first element indicates the number of switches connected to this light.
    var connectedSwitchCount = parseInt(connectionParts[0]);
    
    var activeConnectionCounter = 0; // Counter for how many connected switches are 'on'.
    
    // Iterate through the switch indices listed in the circuit definition.
    // The loop starts from index 1 because index 0 is the count itself.
    // It goes up to (but not including) connectedSwitchCount, processing indices 1 to connectedSwitchCount-1.
    for (var connectionIterator = 1; connectionIterator < connectedSwitchCount + 1; connectionIterator++) { // Corrected loop bound to match original logic's intent for data[i]
      // Get the identifier of the current switch.
      var switchIdentifier = parseInt(connectionParts[connectionIterator]);
      // Check if the bit corresponding to this switchIdentifier is set in the activeSwitchMask.
      // (activeSwitchMask >> switchIdentifier) shifts the relevant bit to the rightmost position.
      // & 1 checks if that bit is 1 (meaning the switch is 'on').
      if ((activeSwitchMask >> switchIdentifier) & 1) {
        activeConnectionCounter++;
      }
    }
    // Return the parity of the active connections (0 if even, 1 if odd).
    return activeConnectionCounter % 2;
  }  
}

// Do not modify the following line (it handles reading from standard input and invoking the main processing function).
ProcessSystemInput(require("fs").readFileSync("/dev/stdin", "utf8"));
