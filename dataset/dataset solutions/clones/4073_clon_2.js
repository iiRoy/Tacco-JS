// This module handles input processing and determines path validity for a sequence of events.
function ProcessInput(rawData) {
  // Split the entire raw input string into an array of individual lines.
  let lines = rawData.split('\n');

  // Extract the total number of records (events) from the first line.
  // When parseInt is called on an array, it implicitly converts the array to a string
  // (e.g., "5,1 2 3,4 5 6") and then parses the leading numerical part.
  let recordCount = parseInt(lines, 10);

  // Isolate the actual event log entries, starting from the second line up to the record count.
  let eventLog = lines.slice(1, recordCount + 1);

  // A string variable to hold the final determination: "YES" or "NO".
  let resultStatus;

  // A boolean flag to track if a valid movement path has been identified.
  let isValidPath = false; // Initialized to false, similar to an unassigned variable being falsy.

  // Iterate through the event log, examining pairs of consecutive events.
  for (let idx = 0; idx < recordCount - 1; ++idx) {
    // Parse the time and coordinates for the current event.
    const [timeA, coordXA, coordYA] = parseEntry(eventLog[idx]);

    // Parse the time and coordinates for the subsequent event.
    const [timeB, coordXB, coordYB] = parseEntry(eventLog[idx + 1]);

    // Calculate the temporal difference between the two events.
    const timeDiff = timeB - timeA;

    // Compute the Manhattan distance (L1 distance) between the two spatial coordinates.
    const manhattanDistance = Math.abs(coordXB + coordYB - coordXA - coordYA);

    // Check if the physical distance is traversable within the available time.
    if (manhattanDistance <= timeDiff) {
      // Additionally, verify if the parity (even/odd) of the distance matches the parity of the time difference.
      // This condition is necessary for movement on a grid where each step changes the sum of coordinates by 1.
      if (manhattanDistance % 2 == timeDiff % 2) {
        isValidPath = true; // If both conditions are met, the path segment is valid.
      }
    }
  }

  // Assign the final status string based on whether any valid path segment was found.
  resultStatus = isValidPath ? "YES" : "NO";

  // Display the determined outcome to the console.
  console.log(resultStatus);
}

// Auxiliary function to parse a single string entry from the log into its numerical components.
function parseEntry(logEntry) {
  // Divide the input string by spaces to separate its constituent parts.
  const entryParts = logEntry.split(' ');

  // Convert the first part to an integer, representing time.
  const parsedTime = parseInt(entryParts[0], 10);

  // Convert the second part to an integer, representing the X-coordinate.
  const parsedX = parseInt(entryParts[1], 10);

  // Convert the third part to an integer, representing the Y-coordinate.
  const parsedY = parseInt(entryParts[2], 10);

  // Return an array containing the three parsed numerical values.
  return [parsedTime, parsedX, parsedY];
}

// This segment is responsible for handling the standard input and invoking the main processing function.
// It should not be altered as it manages the operational environment.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));