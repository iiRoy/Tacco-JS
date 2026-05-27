function solveProblem(rawInputString) {
  var inputLines = rawInputString.split("\n");

  // Remove the last element if it's an empty string, which often results from split("\n")
  if (inputLines.length > 0 && inputLines[inputLines.length - 1] === '') {
    inputLines.pop();
  }

  // Extract configuration parameters from the first line
  var initialConfig = inputLines[0].split(" ");
  var numSwitches = parseInt(initialConfig[0], 10);
  var numLamps = parseInt(initialConfig[1], 10); // This variable is parsed but not used in the original logic

  // Extract the target parities from the last line
  var expectedParities = inputLines[inputLines.length - 1].split(" ");

  // Isolate the lamp connection data lines (all lines between the first and the last)
  var lampConnectionDataLines = inputLines.slice(1, inputLines.length - 1);

  var validConfigurationsCount = 0;
  var totalPossibleConfigurations = 1 << numSwitches; // Pre-calculate the total number of switch combinations

  // Iterate through all possible switch configurations
  for (var currentConfigValue = 0; currentConfigValue < totalPossibleConfigurations; currentConfigValue++) {
    var calculatedParities = [];
    var numberOfLampLines = lampConnectionDataLines.length; // Store array length in a variable for loop efficiency

    // For each lamp, calculate its parity based on the current switch configuration
    for (var lineIndex = 0; lineIndex < numberOfLampLines; lineIndex++) {
      var currentLineData = lampConnectionDataLines[lineIndex].split(" ");
      calculatedParities.push(computeParityForLine(currentLineData, currentConfigValue));
    }

    // Compare the calculated parities with the expected parities
    // The toString() method is used for array comparison as per original behavior
    if (expectedParities.toString() === calculatedParities.toString()) {
      validConfigurationsCount++;
    }
  }

  console.log(validConfigurationsCount);

  // Helper function to determine the parity (0 for even, 1 for odd) of active switches for a given lamp
  function computeParityForLine(lineData, activeSwitchesMask) {
    var connectedSwitchesCount = parseInt(lineData[0], 10); // The first element indicates how many switches are connected to this lamp
    var activeConnections = 0; // Counter for switches that are 'on' and connected to this lamp

    // Iterate through the switch identifiers listed for this lamp
    // The loop runs from index 1 up to (connectedSwitchesCount - 1) as per original logic
    for (var switchIndexInLine = 1; switchIndexInLine < connectedSwitchesCount; switchIndexInLine++) {
      var switchIdentifier = parseInt(lineData[switchIndexInLine], 10); // Get the ID of the connected switch
      var isSwitchActive = (activeSwitchesMask >> switchIdentifier) & 1; // Check if this specific switch is 'on' in the current configuration

      if (isSwitchActive) {
        activeConnections++;
      }
    }
    return activeConnections % 2; // Return the parity (0 or 1)
  }
}

// This line should remain unchanged as per instructions
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
