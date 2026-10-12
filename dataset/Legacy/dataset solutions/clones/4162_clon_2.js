// This function processes the input data to determine if a target can be reached.
function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  var dataLines = rawData.split("\r\n");

  // The first line contains the command string.
  var commandString = dataLines[0];
  // The second line contains the target coordinates as a space-separated string.
  var targetCoordsStr = dataLines[1].split(" ");

  // Split the command string by 'T' to get segments of 'F' movements.
  // Each 'F' represents a forward step, 'T' represents a turn.
  var moveSegments = commandString.split("T");

  // The very first segment (before any 'T') determines the initial forward movement.
  var initialMovement = moveSegments[0].length;

  // Calculate the absolute target coordinates, adjusting the X-coordinate by the initial movement.
  // The target is given as (x, y), but the robot starts at (0,0) facing +X.
  // The first 'F' segment moves it along +X.
  var finalTarget = [
    Math.abs(Number(targetCoordsStr[0]) - initialMovement),
    Math.abs(Number(targetCoordsStr[1]))
  ];

  // Arrays to store lengths of movements along X and Y axes after the initial step.
  var xMoveLengths = [];
  var yMoveLengths = [];
  // Sums of lengths for X and Y movements.
  var totalXLength = 0;
  var totalYLength = 0;

  // Iterate through the movement segments starting from the second one (after the first 'T').
  // Segments at even indices (1, 3, 5...) correspond to Y-axis movements.
  // Segments at odd indices (2, 4, 6...) correspond to X-axis movements.
  for (var idx = 1; idx < moveSegments.length; idx++) {
    if (idx % 2 === 0) {
      // Even index: X-axis movement.
      xMoveLengths.push(moveSegments[idx].length);
      totalXLength += moveSegments[idx].length;
    } else {
      // Odd index: Y-axis movement.
      yMoveLengths.push(moveSegments[idx].length);
      totalYLength += moveSegments[idx].length;
    }
  }

  // Sort the movement lengths for X and Y axes in ascending order.
  // This helps in the dynamic programming approach for reachability.
  xMoveLengths.sort(function(a, b) {
    return a - b;
  });
  yMoveLengths.sort(function(a, b) {
    return a - b;
  });

  // Helper function to check if a specific dimension (X or Y) can reach its target.
  // 'segmentLengths' are the available movement lengths for this dimension.
  // 'targetDimension' is the absolute target coordinate for this dimension.
  // 'totalDimensionSum' is the sum of all available movement lengths for this dimension.
  var checkReachability = function(segmentLengths, targetDimension, totalDimensionSum) {
    // Case 1: Target is less than the total possible movement.
    // This means some movements must be "reversed" (effectively subtracting from the total).
    if (targetDimension < totalDimensionSum) {
      // If the difference (total - target) is odd, it's impossible to reach.
      // Each move can either add or subtract its length. The parity of the sum of chosen moves
      // must match the parity of the target. If (total - target) is odd, then (total + target) is also odd.
      // Since total and target have different parities, it's impossible to reach.
      if ((totalDimensionSum - targetDimension) % 2 === 1) {
        // console.log("No"); // This is handled by the main logic
        return false;
      } else {
        // Calculate the required "backtrack" amount. This is the sum of lengths
        // that need to be effectively subtracted from the total sum to reach the target.
        var requiredBacktrack = (totalDimensionSum - targetDimension) / 2;
        // 'reachableSteps' will store all possible sums that can be formed by subsets of 'segmentLengths'.
        var reachableSteps = [];

        // Iterate through each segment length.
        for (var subIdx = 0; subIdx < segmentLengths.length; subIdx++) {
          // If the current segment length itself is greater than the required backtrack,
          // then no combination involving this segment or larger ones can sum up to 'requiredBacktrack'.
          if (segmentLengths[subIdx] > requiredBacktrack) {
            break; // Optimization: since segmentLengths is sorted, we can stop.
          }

          // Store the current number of reachable sums before adding new ones.
          var currentReachableCount = reachableSteps.length;

          // Add the current segment length itself as a reachable sum.
          reachableSteps.push(segmentLengths[subIdx]);
          if (segmentLengths[subIdx] === requiredBacktrack) {
            return true; // Found an exact match.
          }

          // Combine the current segment length with all previously found reachable sums.
          for (var innerIdx = 0; innerIdx < currentReachableCount; innerIdx++) {
            var newSum = segmentLengths[subIdx] + reachableSteps[innerIdx];
            reachableSteps.push(newSum);
            if (newSum === requiredBacktrack) {
              return true; // Found an exact match.
            }
          }
        }
        return false; // No combination found to form 'requiredBacktrack'.
      }
    } else if (targetDimension === totalDimensionSum) {
      // Case 2: Target is exactly equal to the total possible movement.
      // This means all movements are in the "forward" direction for this dimension.
      return true;
    } else {
      // Case 3: Target is greater than the total possible movement.
      // Impossible to reach.
      return false;
    }
  };

  // Check if the target X-coordinate is greater than the total possible X movement,
  // or if the target Y-coordinate is greater than the total possible Y movement.
  if (finalTarget[0] > totalXLength || finalTarget[1] > totalYLength) {
    console.log("No");
    return false;
  } else if (finalTarget[0] === totalXLength && finalTarget[1] === totalYLength) {
    // If both X and Y targets are exactly equal to their respective total sums, it's reachable.
    console.log("Yes");
    return false;
  } else {
    // Otherwise, use the 'checkReachability' function for each dimension.
    // If both X and Y dimensions can reach their targets, then the overall target is reachable.
    if (checkReachability(xMoveLengths, finalTarget[0], totalXLength) &&
      checkReachability(yMoveLengths, finalTarget[1], totalYLength)) {
      console.log("Yes");
      return false;
    } else {
      console.log("No");
      return false;
    }
  }
}

// The following line is for standard input/output handling and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
