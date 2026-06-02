"use strict"; // Enforce strict parsing and error handling

/**
 * Processes input data to calculate a modified robot count.
 * @param {string} inputData - The raw input string containing robot specifications.
 */
function ProcessInput(inputData) {
  // Split the entire input string into individual lines.
  const lineSegments = inputData.split('\n');

  // The first line contains the initial count of robots.
  let robotCount = Number(lineSegments[0]);

  // The remaining lines contain the specifications for each robot.
  const robotSpecs = lineSegments.slice(1, lineSegments.length);

  // Sort the robot specifications based on their center coordinate (first number).
  // This uses a custom comparison function to ensure numerical sorting.
  const sortedRobots = robotSpecs.sort((firstSpec, secondSpec) => {
    const firstCoord = Number(firstSpec.split(' ')[0]);
    const secondCoord = Number(secondSpec.split(' ')[0]);
    return firstCoord < secondCoord ? -1 : 1;
  });

  // This array will store the maximum reach encountered so far.
  // The original code's use of `Math.max(null, currentReach)` implies
  // it's trying to get the maximum value from the array, treating `null` as 0.
  // If `currentReach` is empty, `Math.max(null, [])` evaluates to 0.
  let currentReach = [];

  // Iterate through each sorted robot specification.
  for (let idx = 0; idx < robotSpecs.length; ++idx) {
    // Parse the center coordinate (x) and length (l) for the current robot.
    const centerCoord = Number(sortedRobots[idx].split(' ')[0]);
    const lengthVal = Number(sortedRobots[idx].split(' ')[1]);

    // Calculate the minimum and maximum reach points for the current robot.
    const minReach = centerCoord - lengthVal;
    const maxReach = centerCoord + lengthVal;

    // Check if the current robot's minimum reach overlaps with the
    // maximum reach established by previously processed robots.
    // `Math.max(null, ...currentReach)` effectively gets the largest number in `currentReach`,
    // or 0 if `currentReach` is empty or contains only non-numeric values.
    if (Math.max(null, ...currentReach) >= minReach) {
      // If there's an overlap, add the current robot's min and max reach to the array.
      // This also means this robot is "covered" or "merged", so decrement the count.
      currentReach.push(minReach, maxReach);
      robotCount = robotCount - 1;
    }
  }

  // Output the final calculated robot count.
  console.log(robotCount);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
