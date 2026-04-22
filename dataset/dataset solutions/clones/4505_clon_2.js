"use strict"; 

/*
 *  This script processes a sequence of numbers to simulate a path traversal.
 *  It identifies if a specific target node (value 2) is reachable within a given graph structure,
 *  while also detecting cycles.
 */
var dataProcessor = function processGraphSequence(incomingText) {
  // Divide the entire input string into an array of strings,
  // where each element represents a line from the input.
  var textLines = incomingText.split('\n');

  // The first line of the input specifies the total number of subsequent elements.
  // Parse this string into an integer, ensuring base-10 interpretation.
  var totalElementsCount = parseInt(textLines[0], 10);

  // Initialize an empty array to store the numerical sequence representing connections.
  var connectionPath = [];

  // Iterate from the second line of the input up to the total specified count.
  // Each line is parsed as an integer and added to the connectionPath array.
  for (var currentIdx = 1; currentIdx <= totalElementsCount; currentIdx++) {
    connectionPath.push(parseInt(textLines[currentIdx], 10));
  }

  // Define the fixed starting point for the traversal process.
  var traversalStart = 1;

  // The very first connection in the array dictates the initial 'next' step.
  var currentWaypoint = connectionPath[0];

  // An array to keep track of all the nodes that have been visited during the traversal.
  var visitedWaypoints = [];
  // Mark the initial traversalStart node as visited at the beginning.
  visitedWaypoints.push(1);

  // A boolean flag to indicate whether the target node (value 2) has been reached.
  var targetReached = false;

  // A counter to keep track of the number of steps taken during the pathfinding.
  var stepCount = 0;

  // Begin the traversal loop. It continues as long as the current waypoint
  // is not the original starting point (which would indicate a cycle back to start).
  while (currentWaypoint !== traversalStart) {
    // Increment the step counter for each movement.
    stepCount++;

    // Update the current waypoint based on the value found in the connectionPath array.
    // Note: Array indices are zero-based, so we subtract 1 from the waypoint value.
    currentWaypoint = connectionPath[currentWaypoint - 1];

    // Check if the current waypoint is the specific target node (value 2).
    if (currentWaypoint === 2) {
      targetReached = true; // If target found, set the flag.
      break; // Exit the loop immediately as the goal is achieved.
    }

    // Check if the current waypoint has already been visited.
    // If it has, it implies a cycle has been detected before reaching the target.
    if (visitedWaypoints.indexOf(currentWaypoint) >= 0) {
      break; // Exit the loop due to cycle detection.
    } else {
      // If the waypoint is new, add it to the list of visited waypoints.
      visitedWaypoints.push(currentWaypoint);
    }
  }

  // After the traversal loop concludes, determine the final output.
  if (targetReached) {
    // If the target node (2) was successfully reached, output the total steps taken
    // plus one (to account for the final step to node 2 itself).
    console.log(stepCount + 1);
  } else {
    // If the target node was not reached (either due to a cycle or other termination),
    // output -1 as per the problem's requirements.
    console.log(-1);
  }
};


// Execute the graph processing function by reading input from standard input.
// It uses Node.js's 'fs' module to read the file '/dev/stdin' and decodes it as UTF-8.
dataProcessor(require('fs').readFileSync('/dev/stdin', 'utf-8'));