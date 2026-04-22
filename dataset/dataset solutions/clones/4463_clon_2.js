"use strict";

// Main entry point for the application
function ExecuteProgram(rawData) {
  // Process the raw input to extract map and connection details
  const parsedMapDetails = extractMapInfo(rawData);

  // Determine if the target island is reachable from a starting point
  let reachabilityOutcome = determineConnectivity(parsedMapDetails[0], parsedMapDetails[1]);

  // Output the final status based on reachability
  reportStatus(reachabilityOutcome);
}

// Function to parse initial configuration and connection data
let extractMapInfo = (sourceString) => {
  // Split the entire input string into individual lines
  const textLines = sourceString.split('\n');

  // Parse the first line to get key parameters
  const initialConfig = textLines[0].split(' ');

  // Store the identifier for the final destination node
  const destinationNode = parseInt(initialConfig[0], 10);

  // Store the total number of available connections
  const connectionQuantity = parseInt(initialConfig[1], 10);

  // Parse all connection specifications from the input lines
  let connectionDetails = readConnectionData(connectionQuantity, textLines);

  // Return the processed connection details and the destination node
  return [connectionDetails, destinationNode];
};

// Function to verify if the destination is reachable via connections
let determineConnectivity = (linkConfigurations, targetNodeId) => {
  // Iterate through each available link configuration
  for (let firstLinkIdx = 0; firstLinkIdx < linkConfigurations.length; firstLinkIdx++) {
    // Log the starting point of the current link for debugging (optional)
    console.log(linkConfigurations[firstLinkIdx][0]);

    // Check if the current link starts from node "1" (assumed starting island)
    if (linkConfigurations[firstLinkIdx][0] === "1") {
      // If it does, iterate through all links again to find a path
      for (let secondLinkIdx = 0; secondLinkIdx < linkConfigurations.length; secondLinkIdx++) {
        // Check if the start of the second link matches the end of the first link
        if (parseInt(linkConfigurations[secondLinkIdx][0]) === parseInt(linkConfigurations[firstLinkIdx][1])) {
          // If a continuous path is found, check if the end of the second link is the target island
          if (parseInt(linkConfigurations[secondLinkIdx][1]) === targetNodeId) {
            // If the target is reached, return true immediately
            return true;
            // This break statement is unreachable due to the return above, but kept for structural similarity.
            break;
          }
        }
      }
    }
  }
  // If no path to the target island is found after checking all possibilities
  return false;
};

// Function to output the reachability status to console
const reportStatus = (isReachable) => {
  // Check the boolean flag for reachability
  if (isReachable) {
    console.log('POSSIBLE'); // Output if connection is established
  } else {
    console.log('IMPOSSIBLE'); // Output if no connection is found
  }
};

// Function to parse and store connection records from input lines
const readConnectionData = (connectionQuantity, inputLineArray) => {
  // Initialize an array to hold all parsed connection records
  const connectionRecords = new Array(connectionQuantity);

  // Loop through the input lines to extract each connection
  for (let k = 0; k < connectionQuantity; k++) {
    // Each connection record is obtained by splitting a line (starting from the second line)
    connectionRecords[k] = inputLineArray[k + 1].split(' ');
  }

  // Return the array containing all connection details
  return connectionRecords;
};

// Execute the main program with input from standard input
ExecuteProgram(require('node:fs').readFileSync('/dev/stdin', 'utf8'));