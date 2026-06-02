function ProcessInput(rawData) {
  // Divide the incoming data into individual lines.
  var inputLines = rawData.split("\r\n");

  // Extract the movement path string from the first line.
  var pathString = inputLines[0];

  // Parse the target coordinates from the second line.
  var targetCoordsStr = inputLines[1].split(" ");

  // Break down the path string by 'T' to get segments.
  var segments = pathString.split("T");

  // Calculate the initial forward movement based on the first segment.
  var initialMovement = segments[0].length;

  // Determine the absolute target coordinates, adjusting for the initial movement.
  var finalTarget = [
    Math.abs(Number(targetCoordsStr[0]) - initialMovement),
    Math.abs(Number(targetCoordsStr[1])),
  ];

  // Arrays to store lengths of movements along X and Y axes.
  var xMovements = [];
  var yMovements = [];

  // Accumulators for total distances along X and Y axes.
  var totalXDistance = 0;
  var totalYDistance = 0;

  // Iterate through the segments starting from the second one.
  // Even-indexed segments (after the first) contribute to X, odd-indexed to Y.
  for (var idx = 1; idx < segments.length; idx++) {
    if (idx % 2 === 0) {
      xMovements.push(segments[idx].length);
      totalXDistance += segments[idx].length;
    } else {
      yMovements.push(segments[idx].length);
      totalYDistance += segments[idx].length;
    }
  }

  // Sort the movement lengths for easier processing in the reachability check.
  xMovements.sort(function (a, b) {
    return a - b;
  });
  yMovements.sort(function (a, b) {
    return a - b;
  });

  // Helper function to determine if a target value can be reached
  // given a set of distances and their total sum.
  var checkReachability = function (distances, targetVal, totalSum) {
    // If the target is less than the total possible sum.
    if (targetVal < totalSum) {
      // If the difference is odd, it's impossible to reach.
      if ((totalSum - targetVal) % 2 === 1) {
        console.log("No");
        return false;
      } else {
        // Calculate the required 'backwards' step to adjust the sum to the target.
        var requiredAdjustment = (totalSum - targetVal) / 2;
        var possibleSums = []; // Stores all possible sums achievable with a subset of distances.

        // Iterate through each distance.
        for (var outerIdx = 0; outerIdx < distances.length; outerIdx++) {
          // If the current distance exceeds the required adjustment,
          // further distances (since sorted) won't help.
          if (distances[outerIdx] > requiredAdjustment) {
            break;
          }

          var currentLength = possibleSums.length;
          possibleSums.push(distances[outerIdx]); // Add the current distance itself.

          // If the current distance alone equals the required adjustment, we found a way.
          if (distances[outerIdx] === requiredAdjustment) {
            return true;
          }

          // Combine the current distance with previously found possible sums.
          for (var innerIdx = 0; innerIdx < currentLength; innerIdx++) {
            possibleSums.push(distances[outerIdx] + possibleSums[innerIdx]);
            // If a combination equals the required adjustment, we found a way.
            if (distances[outerIdx] + possibleSums[innerIdx] === requiredAdjustment) {
              return true;
            }
          }
        }
        // If no combination was found after checking all distances.
        return false;
      }
    } else if (targetVal === totalSum) {
      // If the target is exactly the total sum, it's reachable.
      return true;
    } else {
      // If the target is greater than the total sum, it's impossible.
      return false;
    }
  };

  // Check initial conditions for reachability.
  if (finalTarget[0] > totalXDistance || finalTarget[1] > totalYDistance) {
    console.log("No");
    return false;
  } else if (finalTarget[0] === totalXDistance && finalTarget[1] === totalYDistance) {
    // If both targets are exactly their respective total sums, it's reachable.
    console.log("Yes");
    return false;
  } else {
    // Otherwise, use the helper function to check reachability for both axes independently.
    if (
      checkReachability(xMovements, finalTarget[0], totalXDistance) &&
      checkReachability(yMovements, finalTarget[1], totalYDistance)
    ) {
      console.log("Yes");
      return false;
    } else {
      console.log("No");
      return false;
    }
  }
}

// The following line should not be modified (reads from standard input and calls ProcessInput).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
