"use strict";

// Renamed and slightly modified splitNum function
function parseNumbersFromString(inputSegment) {
  // Determine if the input is already an array of string segments or a single string to be split
  const stringSegments = Array.isArray(inputSegment) ? inputSegment : inputSegment.split(/\s+/);
  
  // Convert each string segment to an integer, ensuring base 10
  const numericValues = stringSegments.map(function (str) {
    return parseInt(str, 10);
  });
  
  return numericValues;
}

// Helper function to encapsulate the parsing of a single light's configuration line
function createLightConfiguration(lineText, lightIndex) {
  const parsedValues = parseNumbersFromString(lineText);
  
  // Extract 'k' (number of switches for this light) and 's' (array of connected switch indices)
  const switchCountForLight = parsedValues.shift(); // 'k' is the first element
  const connectedSwitchIndices = parsedValues;     // 's' is the rest of the elements
  
  return {
    k: switchCountForLight,
    s: connectedSwitchIndices,
    li: lightIndex // Store the original light index for parity lookup
  };
}

// Helper function to determine if a given switch combination satisfies all light conditions
function checkCombinationValidity(currentCombinationState, allLightConfigs, requiredParities) {
  // Iterate through each light's configuration
  for (const lightSetting of allLightConfigs) {
    const connectedSwitches = lightSetting.s;
    const lightIdentifier = lightSetting.li;
    
    let activeSwitchCountForLight = 0;
    
    // For each switch connected to the current light, check if it's active in the current combination
    for (const switchId of connectedSwitches) {
      // Switch IDs are 1-indexed, so adjust to 0-indexed bit position
      const switchBitPosition = switchId - 1;
      
      // Check if the bit corresponding to this switch is set in the current combination state
      const isSwitchActive = (currentCombinationState & (1 << switchBitPosition)) !== 0;
      
      if (isSwitchActive) {
        activeSwitchCountForLight++;
      }
    }
    
    // Compare the parity of active switches with the required parity for this light
    const currentLightParity = activeSwitchCountForLight % 2;
    const expectedLightParity = requiredParities[lightIdentifier];
    
    if (currentLightParity !== expectedLightParity) {
      return false; // If any light's condition is not met, this combination is invalid
    }
  }
  
  return true; // All lights' conditions are met for this combination
}


(function () {
  // Read the entire input from stdin
  const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
  const inputLines = rawInputData.split("\n");

  // Parse N (number of switches) and M (number of lights) from the first line
  const firstLineNumbers = parseNumbersFromString(inputLines[0]);
  const numSwitches = firstLineNumbers[0];
  const numLights = firstLineNumbers[1];

  // Parse all light configurations from subsequent lines
  const lightConfigurations = inputLines.slice(1, numLights + 1).map(function (lineContent, idx) {
    return createLightConfiguration(lineContent, idx);
  });

  // Parse the required parity for each light from the line after light configurations
  const expectedParities = parseNumbersFromString(inputLines[numLights + 1]);

  let validCombinationsCounter = 0;

  // Calculate the total number of possible switch combinations (2^N)
  const totalPossibleCombinations = 1 << numSwitches; // Bit shift is equivalent to Math.pow(2, numSwitches)

  // Iterate through every possible combination of switch states
  for (let combinationIndex = 0; combinationIndex < totalPossibleCombinations; combinationIndex++) {
    // Check if the current combination satisfies all light conditions using the helper function
    if (checkCombinationValidity(combinationIndex, lightConfigurations, expectedParities)) {
      validCombinationsCounter++; // Increment counter if the combination is valid
    }
  }

  // Output the final count of valid switch combinations
  console.log(validCombinationsCounter);
})();
