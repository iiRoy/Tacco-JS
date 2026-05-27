function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  const lineSegments = rawData.split("\n");

  // Parse the first line to get the number of entries
  const numEntries = parseInt(lineSegments[0], 10);

  // Extract the travel log entries from the second line onwards
  const travelLog = lineSegments.slice(1, numEntries + 1);

  let finalVerdict; // Variable to store the final result ("YES" or "NO")
  let isPossible;   // Flag to track if the travel is possible (1 for possible, undefined otherwise)

  // Iterate through the travel log, comparing consecutive entries
  for (let idx = 0; idx < numEntries - 1; idx++) {
    // Parse the current and next travel records
    const [timeA, coordXA, coordYA] = parseTravelRecord(travelLog[idx]);
    const [timeB, coordXB, coordYB] = parseTravelRecord(travelLog[idx + 1]);

    // Calculate the time difference between the two points
    const timeDiff = timeB - timeA;

    // Calculate the Manhattan distance between the two points
    const manhattanDistance = Math.abs(coordXB + coordYB - coordXA - coordYA);

    // Check if the travel is physically possible within the given time
    if (manhattanDistance <= timeDiff) {
      // Check if the parity of distance and time difference match
      // (a necessary condition for reaching the target in integer steps)
      if (manhattanDistance % 2 === timeDiff % 2) {
        isPossible = 1; // Mark as possible if conditions are met
      } else {
        // If parity doesn't match, it's impossible, so we can break early
        isPossible = undefined; // Reset flag to indicate impossibility
        break;
      }
    } else {
      // If distance is greater than time difference, it's impossible
      isPossible = undefined; // Reset flag to indicate impossibility
      break;
    }
  }

  // Determine the final verdict based on the 'isPossible' flag
  finalVerdict = isPossible ? "YES" : "NO";

  // Output the result to the console
  console.log(finalVerdict);
}

// Helper function to parse a single travel record string
function parseTravelRecord(logEntry) {
  // Split the log entry string by space to get individual components
  const parts = logEntry.split(" ");

  // Parse time, x-coordinate, and y-coordinate as integers
  const parsedTime = parseInt(parts[0], 10);
  const parsedX = parseInt(parts[1], 10);
  const parsedY = parseInt(parts[2], 10);

  // Return them as an array
  return [parsedTime, parsedX, parsedY];
}

// This line handles reading from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
