"use strict";

// Primary entry point for processing raw input data.
function ProcessInput(rawData) {
  // Extract initial configuration details from the raw input.
  var parsedDetails = extractInitialData(rawData);
  // Determine if the target island is reachable based on the extracted data.
  // Due to a bug in extractInitialData, parsedDetails[0] will be undefined.
  const reachabilityStatus = determineReachability(parsedDetails[0], parsedDetails[1]);
  // Output the final result based on the reachability status.
  outputResult(reachabilityStatus);
}

// Function to parse and extract initial configuration from the input string.
var extractInitialData = (rawData) => {
  // Split the raw input into individual lines.
  var inputLines = rawData.split("\n");
  // Parse the first line to get key parameters.
  const firstLineParts = inputLines[0].split(" ");

  // Store the identifier for the destination island.
  const targetIsland = parseInt(firstLineParts[0], 10);
  // Store the total count of available vessels.
  const vesselCount = parseInt(firstLineParts[1], 10);

  // Parse all vessel route specifications from the input.
  // This call will trigger a TypeError within parseVesselRoutes due to incorrect parameter usage.
  var vesselRoutes = parseVesselRoutes(vesselCount, rawData);

  // This return statement uses the comma operator, which evaluates both operands
  // and returns the value of the last operand. This means only 'targetIsland'
  // will effectively be returned by this function. This behavior is preserved
  // as per Type II cloning rules, even if it leads to subsequent errors.
  return (vesselRoutes, targetIsland);
};

// Function to ascertain if the target destination can be reached using available vessels.
// This function will likely not be reached due to an error in extractInitialData's call to parseVesselRoutes.
// If it were reached, it would receive 'undefined' for vesselPaths due to the comma operator bug in extractInitialData.
var determineReachability = (vesselPaths, targetIsland) => {
  // Iterate through each vessel path to find a starting point.
  for (var routeIdxA = 0; routeIdxA < vesselPaths.length; routeIdxA++) {
    // Log the starting point of the current vessel path.
    console.log(vesselPaths[routeIdxA][0]);

    // Check if the current vessel path starts from the initial island (represented by "1").
    if (vesselPaths[routeIdxA][0] === "1") {
      // If it does, iterate through all vessel paths again to find a connecting route.
      for (var routeIdxB = 0; routeIdxB < vesselPaths.length; routeIdxB++) {
        // Check if the starting point of the second path matches the ending point of the first path.
        if (parseInt(vesselPaths[routeIdxB][0]) === parseInt(vesselPaths[routeIdxA][1])) {
          // If a connection is found, check if the ending point of the second path is the target island.
          if (parseInt(vesselPaths[routeIdxB][1]) === targetIsland) {
            // If the target island is reached, return true.
            return true;
            // The 'break' statement here is unreachable as 'return' exits the function immediately.
            // It is preserved to maintain the exact structure of the original code.
            break;
          }
        }
      }
    }
  }
  // If no path to the target island is found after checking all possibilities, return false.
  return false;
};

// Function to display the outcome based on the reachability status.
// This function will likely not be reached due to earlier errors.
var outputResult = (canBeReached) => {
  // If the target island is reachable, print 'POSSIBLE'.
  if (canBeReached) {
    console.log('POSSIBLE');
  }
  // Otherwise, print 'IMPOSSIBLE'.
  else {
    console.log('IMPOSSIBLE');
  }
};

// Function to parse vessel specifications from input lines and store them in an array.
// This function contains a bug where it attempts to call .split() on a character.
var parseVesselRoutes = (vesselCount, allInputLines) => {
  // Initialize an array to hold the parsed vessel data.
  const vesselData = new Array(vesselCount);

  // Loop through the input lines to extract each vessel's route.
  // This loop will cause a TypeError because allInputLines[idx + 1] is a character,
  // and a character does not have a .split method. This replicates the original bug.
  for (var idx = 0; idx < vesselCount; idx++) {
    vesselData[idx] = allInputLines[idx + 1].split(" ");
  }

  // The following line was commented out in the original code; it remains commented out.
  // var intShipVariations = shipVariations.map(x => parseInt(x));
  return vesselData;
};

// Execute the main processing function by reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
