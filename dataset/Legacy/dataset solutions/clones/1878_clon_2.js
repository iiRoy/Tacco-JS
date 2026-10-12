function processInput(rawData) {
  // Split the raw input string into an array of lines, after removing any leading or trailing whitespace.
  const dataRows = rawData.trim().split('\n');

  // Parse the first line to extract the total number of cities and the number of travel steps.
  let [cityCountString, travelStepsString] = dataRows[0].split(' ');
  // Convert the city count string to a numeric type.
  let cityCount = +cityCountString;
  // Convert the travel steps string to a BigInt to handle potentially very large numbers of steps.
  let travelSteps = BigInt(travelStepsString);

  // Parse the second line, which contains the connections for each city.
  // The problem uses 1-indexed cities, so we will convert these to 0-indexed internally by subtracting 1 later.
  const cityConnections = dataRows[1].split(' ').map(Number);

  // Initialize an array to store the sequence of visited locations, starting at city 0 (0-indexed).
  const pathHistory = [0];
  // Set the initial current location to city 0.
  let currentLocation = 0;

  // Continue traversing as long as there are remaining travel steps.
  while (travelSteps > 0n) { // Use 0n for BigInt comparison.
    // Move to the next city based on the current location's connection.
    // Subtract 1 to convert the 1-indexed city number from input to a 0-indexed array position.
    currentLocation = cityConnections[currentLocation] - 1;
    // Decrement the count of remaining travel steps.
    travelSteps--;

    // Check if the current location has been visited before in the current path.
    const cycleStartIndex = pathHistory.indexOf(currentLocation);

    // If the current location is found in the path history, a cycle has been detected.
    if (cycleStartIndex !== -1) {
      // Calculate the length of the detected cycle.
      const cycleLength = BigInt(pathHistory.length - cycleStartIndex);

      // Optimize the remaining travel steps by utilizing the cycle.
      while (travelSteps > 0n) {
        // If the remaining steps are less than the cycle length, traverse step by step.
        if (travelSteps < cycleLength) {
          currentLocation = cityConnections[currentLocation] - 1;
          travelSteps--;
        } else {
          // Otherwise, use the modulo operator to effectively skip full cycles.
          travelSteps %= cycleLength;
        }
      }
    } else {
      // If the current location is new, add it to the path history.
      pathHistory.push(currentLocation);
    }
  }

  // Output the final location, converting it back to 1-indexed as per problem requirements.
  console.log(currentLocation + 1);
}

// Read the entire input from standard input (usually /dev/stdin in competitive programming environments)
// and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
