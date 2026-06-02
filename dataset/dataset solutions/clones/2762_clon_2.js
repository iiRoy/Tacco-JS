/**
 * Processes input data to find pairs of points with integer Euclidean distances.
 * This function reads point coordinates and calculates distances between all unique pairs.
 *
 * @param {string} rawData The raw input string, typically from stdin, containing
 *                         N and D on the first line, followed by N lines of D coordinates.
 */
const ProcessInput = (rawData) => {
  // Split the entire input string into individual lines.
  rawData = rawData.split("\n");

  // Parse the first line to get the number of points (numPoints) and dimensions (dimensions).
  const firstLineParts = rawData[0].split(" ");
  const numPoints = parseInt(firstLineParts[0], 10); // Total number of data points
  const dimensions = parseInt(firstLineParts[1], 10); // Number of dimensions for each point

  // Initialize an array to store the coordinates of all points.
  let coordinates = [];
  // Loop through the input lines to populate the coordinates array.
  // Each line after the first contains the coordinates for one point.
  for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
    coordinates[pointIndex] = rawData[pointIndex + 1].split(" ");
  }

  // Initialize a counter for pairs of points that have an integer distance.
  let integerDistancePairs = 0;

  // Outer loop iterates through each point (idxA).
  for (let idxA = 0; idxA < numPoints; idxA++) {
    // Inner loop iterates through each point again (idxB).
    for (let idxB = 0; idxB < numPoints; idxB++) {
      // We only want to calculate distances between unique pairs of points,
      // and avoid calculating the distance of a point to itself.
      // The 'break' ensures we don't process (idxA, idxB) if idxA === idxB,
      // and also implicitly handles (idxB, idxA) later by the loop structure.
      if (idxA === idxB) {
        break;
      } else {
        // Array to store the squared differences for each dimension.
        let squaredDifferences = [];
        let calculatedDistance = 0;

        // Calculate the squared difference for each dimension.
        for (let dimIndex = 0; dimIndex < dimensions; dimIndex++) {
          squaredDifferences[dimIndex] = Math.pow(
            coordinates[idxA][dimIndex] - coordinates[idxB][dimIndex],
            2
          );
        }

        // Sum the squared differences and take the square root to get the Euclidean distance.
        calculatedDistance = Math.sqrt(
          squaredDifferences.reduce((accumulator, currentDiff) => {
            return accumulator + currentDiff;
          })
        );

        // Check if the calculated distance is an integer.
        if (Number.isInteger(calculatedDistance)) {
          integerDistancePairs++; // Increment the counter if it is.
        }
      }
    }
  }

  // Output the total count of pairs with integer distances.
  console.log(integerDistancePairs);
};

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
