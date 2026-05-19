const validateMovement = (elapsedTime, deltaXCoord, deltaYCoord) => {
  // Calculate the total Manhattan distance for the segment
  const totalDistance = deltaXCoord + deltaYCoord;

  // If the elapsed time is less than the total distance, it's impossible
  if (elapsedTime < totalDistance) {
    return false;
  }

  // Check if the parity of elapsed time matches the parity of total distance
  // This ensures that the remaining time (elapsedTime - totalDistance) is even,
  // allowing for "wasted" moves (e.g., moving back and forth)
  return elapsedTime % 2 === totalDistance % 2;
};

const simulateJourney = (routeSegments) => {
  'use strict'; // Enforce strict mode for cleaner code

  // Initialize the current position and time: [time, x, y]
  let currentPosition = [0, 0, 0];

  // Iterate through each planned destination point in the route
  for (let destinationPoint of routeSegments) {
    // Calculate the absolute horizontal distance to the next point
    const horizontalDistance = Math.abs(currentPosition[1] - destinationPoint[1]);

    // Calculate the absolute vertical distance to the next point
    const verticalDistance = Math.abs(currentPosition[2] - destinationPoint[2]);

    // Calculate the time elapsed to reach this destination point from the current one
    const timeElapsed = destinationPoint[0] - currentPosition[0];

    // Check if the movement to the next point is valid according to the rules
    if (!validateMovement(timeElapsed, horizontalDistance, verticalDistance)) {
      return false; // If any segment is invalid, the entire journey is impossible
    } else {
      // If valid, update the current position to the new destination point
      currentPosition[0] = destinationPoint[0];
      currentPosition[1] = destinationPoint[1];
      currentPosition[2] = destinationPoint[2];
    }
  }

  // If all segments were valid, the journey is feasible
  return true;
};

function ProcessInput(rawData) {
  // Parse the input string into an array of number arrays (the plan)
  // Skip the first line (often contains N, the number of segments)
  const routeSegments = rawData.split('\n')
                               .map(segmentLine => segmentLine.split(' ')
                                                              .map(coordinateValue => parseInt(coordinateValue, 10)))
                               .slice(1);

  // Determine if the entire journey is feasible
  const journeyFeasible = simulateJourney(routeSegments);

  // Output 'Yes' if feasible, 'No' otherwise
  console.log(journeyFeasible ? 'Yes' : 'No');
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
