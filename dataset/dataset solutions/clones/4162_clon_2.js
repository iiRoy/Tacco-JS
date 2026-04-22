// The entire input data is provided in the 'rawData' parameter
function ProcessInput(rawData) {
  // Split the input string into separate lines based on newline characters.
  const textLines = rawData.split("\r\n");

  // The first line contains the movement path string.
  let pathString = textLines[0];

  // The second line contains the target coordinates as space-separated values.
  const targetCoordsStr = textLines[1].split(" ");

  // Divide the path string into segments based on the 'T' character.
  const segments = pathString.split("T");

  // The length of the first segment determines the initial X-axis movement.
  const initialMovement = segments[0].length;

  // Calculate the absolute target position, adjusting for the initial movement.
  // The first coordinate is adjusted by the initial movement.
  // The second coordinate remains as is.
  const goalPosition = [
    Math.abs(Number(targetCoordsStr[0]) - initialMovement),
    Math.abs(Number(targetCoordsStr[1])),
  ];

  // Arrays to store lengths of horizontal and vertical movement segments.
  const horizontalMoves = [];
  const verticalMoves = [];

  // Accumulators for the total possible horizontal and vertical distances.
  let totalHorizontalDistance = 0;
  let totalVerticalDistance = 0;

  // Iterate through the segments starting from the second one (index 1).
  // Segments alternate between horizontal and vertical movements.
  for (let idx = 1; idx < segments.length; idx++) {
    if (idx % 2 === 0) {
      // Even-indexed segments contribute to horizontal movement.
      horizontalMoves.push(segments[idx].length);
      totalHorizontalDistance += segments[idx].length;
    } else {
      // Odd-indexed segments contribute to vertical movement.
      verticalMoves.push(segments[idx].length);
      totalVerticalDistance += segments[idx].length;
    }
  }

  // Sort the horizontal movement segments in ascending order.
  horizontalMoves.sort(function (valA, valB) {
    return valA - valB;
  });

  // Sort the vertical movement segments in ascending order.
  verticalMoves.sort(function (valA, valB) {
    return valA - valB;
  });

  // This helper function determines if a specific coordinate can be reached
  // given a set of movement options and their total sum.
  const checkReachability = function (
    movementsArray,
    targetCoord,
    totalPossibleDistance
  ) {
    // If the target coordinate is less than the total possible distance,
    // we might need to "subtract" some movements.
    if (targetCoord < totalPossibleDistance) {
      // If the difference is odd, it's impossible to reach the target.
      if ((totalPossibleDistance - targetCoord) % 2 === 1) {
        console.log("No");
        return false;
      } else {
        // Calculate the value that needs to be "removed" from the total sum.
        const remainingSteps = (totalPossibleDistance - targetCoord) / 2;

        // An array to store all possible sums that can be formed by a subset
        // of the 'movementsArray'.
        const reachableSums = [];

        // Iterate through each movement option to find subsets that sum to 'remainingSteps'.
        for (let kdx = 0; kdx < movementsArray.length; kdx++) {
          // If the current movement option exceeds 'remainingSteps', no further
          // combinations with it can possibly sum to 'remainingSteps'.
          if (movementsArray[kdx] > remainingSteps) {
            break; // Exit the loop early
          }

          const currentLength = reachableSums.length;
          reachableSums.push(movementsArray[kdx]); // Add the current movement itself

          // If the current movement itself equals 'remainingSteps', we found a solution.
          if (movementsArray[kdx] === remainingSteps) {
            return true;
          }

          // Combine the current movement with previously found sums.
          for (let ldx = 0; ldx < currentLength; ldx++) {
            const combinedSum = movementsArray[kdx] + reachableSums[ldx];
            reachableSums.push(combinedSum); // Add the new combined sum

            // If a combined sum equals 'remainingSteps', we found a solution.
            if (combinedSum === remainingSteps) {
              return true;
            }
          }
        }
        // If after checking all combinations, 'remainingSteps' is not found, it's unreachable.
        return false;
      }
    } else if (targetCoord === totalPossibleDistance) {
      // If the target coordinate is exactly the total possible distance, it's reachable.
      return true;
    } else {
      // If the target coordinate is greater than the total possible distance, it's unreachable.
      return false;
    }
  }; // End of checkReachability function

  // --- Main logic to determine overall reachability ---

  // If either target coordinate exceeds its respective total possible distance, it's impossible.
  if (goalPosition[0] > totalHorizontalDistance || goalPosition[1] > totalVerticalDistance) {
    console.log("No");
    return false;
  }
  // If both target coordinates exactly match their total possible distances, it's reachable.
  else if (goalPosition[0] === totalHorizontalDistance && goalPosition[1] === totalVerticalDistance) {
    console.log("Yes");
    return false; // The problem statement implies we should return false after printing Yes/No.
  }
  // Otherwise, we need to use the checkReachability function for each dimension.
  else {
    // If both dimensions are reachable independently, then the overall target is reachable.
    if (
      checkReachability(horizontalMoves, goalPosition[0], totalHorizontalDistance) &&
      checkReachability(verticalMoves, goalPosition[1], totalVerticalDistance)
    ) {
      console.log("Yes");
      return false;
    }
    // If at least one dimension is not reachable, then the overall target is not reachable.
    else {
      console.log("No");
      return false;
    }
  }
}

// Do not modify the following line; it handles standard input/output.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));