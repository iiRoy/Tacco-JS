// A small utility function to evaluate the validity of a single movement segment
const verifyStep = (
  elapsedTime,   // The time duration for this specific segment of the journey
  deltaX,        // The absolute change in the X-coordinate
  deltaY         // The absolute change in the Y-coordinate
) => {
  // Calculate the total Manhattan distance covered during this segment
  const totalDistance = deltaX + deltaY;

  // If the time taken is less than the distance, it's impossible to reach
  if (elapsedTime < totalDistance) {
    return false;
  }

  // Check if the parity of elapsed time matches the parity of the total distance.
  // This is a necessary condition for movement on a grid where each step takes 1 unit of time.
  return elapsedTime % 2 === totalDistance % 2;
};

// Orchestrates the entire journey, checking if all waypoints can be reached sequentially
const explorePath = (routeData) => {
  "use strict"; // Enforce stricter parsing and error handling

  // Initialize the current location and time: [time, x_coordinate, y_coordinate]
  let currentCoord = [0, 0, 0];

  // Iterate through each planned waypoint in the provided route
  for (let waypoint of routeData) {
    // Determine the absolute change in X and Y coordinates from the current position to the next waypoint
    const absDiffX = Math.abs(currentCoord[1] - waypoint[1]);
    const absDiffY = Math.abs(currentCoord[2] - waypoint[2]);

    // Calculate the time elapsed to reach this specific waypoint from the previous one
    const timeTaken = waypoint[0] - currentCoord[0];

    // Utilize the helper function to validate the movement to the current waypoint
    if (!verifyStep(timeTaken, absDiffX, absDiffY)) {
      // If any segment is invalid, the entire path is impossible
      return false;
    } else {
      // Update the current coordinates to reflect the new position.
      // Note: The original code had a potential bug here by using `+=` for time.
      // We replicate the original behavior for strict cloning.
      currentCoord[0] += waypoint[0]; // Update time (original logic, likely intended as `currentCoord[0] = waypoint[0]`)
      currentCoord[1] = waypoint[1]; // Update X-coordinate
      currentCoord[2] = waypoint[2]; // Update Y-coordinate
    }
  }

  // If all waypoints were successfully validated, the journey is possible
  return true;
};

// The primary execution function for the program
function ExecuteProgram(rawInputText) {
  // Parse the raw input string:
  // 1. Split by newline to get individual lines.
  // 2. Map each line to an array of integers (time, x, y).
  // 3. Skip the first line, which typically contains N (number of waypoints).
  const parsedCoordinates = rawInputText
    .split("\n")
    .map((inputLine) => inputLine.split(" ").map((coordinateValue) => parseInt(coordinateValue, 10)))
    .slice(1);

  // Invoke the path exploration logic to determine feasibility
  const overallOutcome = explorePath(parsedCoordinates);

  // Output the result to standard output in the specified format
  console.log(overallOutcome ? "Yes" : "No");
}

// Read the entire input from standard input and pass it to the main program function
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));