const processInput = (inputString) => {
  // Parse the raw input string into an array of lines
  const processedLines = inputString.trim().split('\n');

  // Extract the first line containing N, M, and X
  const [totalPoints, numCosts, startPoint] = processedLines[0].split(' ').map(val => parseInt(val, 10));

  // Initialize an array (though not used in this specific logic, it maintains structural similarity)
  const pointMap = Array(totalPoints + 1);

  // Extract the second line containing the list of costly points
  const costlyPoints = processedLines[1].split(' ').map(val => parseInt(val, 10));

  // Calculate the cost to move towards the left (decreasing index)
  let costToLeft = 0;
  // Iterate from the point just before X down to 1
  for (let currentPointIndex = startPoint - 1; currentPointIndex > 0; currentPointIndex--) {
    // If the current point is in the list of costly points, increment the cost
    if (costlyPoints.includes(currentPointIndex)) {
      costToLeft++;
    }
  }

  // Calculate the cost to move towards the right (increasing index)
  let costToRight = 0;
  // Iterate from X up to N-1
  for (let currentPointIndex = startPoint; currentPointIndex < totalPoints; currentPointIndex++) {
    // If the current point is in the list of costly points, increment the cost
    if (costlyPoints.includes(currentPointIndex)) {
      costToRight++;
    }
  }

  // Output the minimum of the two calculated costs
  console.log(Math.min(costToLeft, costToRight));
};

// Read input from standard input using Node.js file system module
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
