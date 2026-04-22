function calculateFinalPosition(rawStringData) {
  // Process the raw input string into an array of lines
  const parsedRows = rawStringData.trim().split('\n');

  // Extract initial parameters: total entities and remaining steps
  let [totalEntities, remainingSteps] = parsedRows[0].split(' ');
  // Convert the totalEntities string to an integer
  totalEntities = parseInt(totalEntities, 10);
  // Convert the remainingSteps string to a BigInt for large numbers
  remainingSteps = BigInt(remainingSteps);

  // Parse the second line to get the array of teleport destinations
  const teleportLocations = parsedRows[1].split(' ').map(val => parseInt(val, 10));

  // Initialize a list to keep track of visited locations to detect cycles
  const journeyHistory = [0];
  // Set the starting location index
  let currentLocationIndex = 0;

  // Loop as long as there are steps remaining
  while (remainingSteps > BigInt(0)) {
    // Move to the next location based on the current one
    currentLocationIndex = teleportLocations[currentLocationIndex] - 1;
    // Decrement the step counter
    remainingSteps--;

    // Check if the current location has been visited before
    const historyEntryIndex = journeyHistory.indexOf(currentLocationIndex);

    if (historyEntryIndex !== -1) {
      // A cycle has been detected!
      // Calculate the length of the detected cycle
      const pathLoopLength = BigInt(journeyHistory.length - historyEntryIndex);

      // Optimize remaining steps by using the cycle length
      while (remainingSteps > BigInt(0)) {
        if (remainingSteps < pathLoopLength) {
          // If remaining steps are less than cycle length, traverse normally
          currentLocationIndex = teleportLocations[currentLocationIndex] - 1;
          remainingSteps--;
        } else {
          // Otherwise, jump through cycles using modulo arithmetic
          remainingSteps %= pathLoopLength;
        }
      }
    } else {
      // If the location is new, add it to the history
      journeyHistory.push(currentLocationIndex);
    }
  }

  // Output the final 1-indexed position
  console.log(currentLocationIndex + 1);
}

// Read input from standard input and pass it to the processing function
calculateFinalPosition(require('node:fs').readFileSync('/dev/stdin', 'utf8'));