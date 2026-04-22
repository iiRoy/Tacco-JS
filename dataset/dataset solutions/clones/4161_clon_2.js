// This script processes the provided input data
function ProcessInputData(rawDataString) {
  // Split the entire input string into individual lines
  var dataLinesArray = rawDataString.split("\r\n");
  // The first line contains the movement sequence
  var movementSequence = dataLinesArray[0];
  // The second line contains the target coordinates, split by space
  var targetCoordinatesText = dataLinesArray[1].split(" ");

  // Divide the movement sequence into blocks based on 'T' (turns)
  var directionBlocks = movementSequence.split("T");
  // The length of the first block represents the initial displacement along the X-axis
  var initialXDisplacement = directionBlocks[0].length;

  // Calculate the absolute target coordinates
  // The target X is adjusted by the initial X displacement
  var finalTargetAbs = [
    Math.abs(Number(targetCoordinatesText[0]) - initialXDisplacement),
    Math.abs(Number(targetCoordinatesText[1]))
  ];

  // Arrays to store lengths of movements along X and Y axes
  var xDirectionLengths = [];
  var yDirectionLengths = [];
  // Variables to accumulate total movement lengths for X and Y
  var totalXMovement = 0;
  var totalYMovement = 0;

  // Iterate through the direction blocks, starting from the second one (index 1)
  for (var blockIndex = 1; blockIndex < directionBlocks.length; blockIndex++) {
    // Blocks at even indices (1st, 3rd, 5th, etc. after the initial block) contribute to X movement
    if (blockIndex % 2 === 0) {
      xDirectionLengths.push(directionBlocks[blockIndex].length);
      totalXMovement += directionBlocks[blockIndex].length;
    }
    // Blocks at odd indices contribute to Y movement
    else {
      yDirectionLengths.push(directionBlocks[blockIndex].length);
      totalYMovement += directionBlocks[blockIndex].length;
    }
  }

  // Sort the X-movement lengths in ascending order
  xDirectionLengths.sort(function(elementA, elementB) {
    return elementA - elementB;
  });
  // Sort the Y-movement lengths in ascending order
  yDirectionLengths.sort(function(elementA, elementB) {
    return elementA - elementB;
  });

  // Helper function to determine if a target distance can be reached
  // using a given set of step lengths and their total sum
  var verifyReachability = function(availableSteps, requiredDistance, totalPossibleDistance) {
    // If the required distance is less than the total possible distance
    if (requiredDistance < totalPossibleDistance) {
      // If the difference is odd, it's impossible to reach
      if ((totalPossibleDistance - requiredDistance) % 2 === 1) {
        console.log("No");
        return false;
      } else {
        // Calculate the distance that needs to be cancelled out by opposing steps
        var cancellationDistance = (totalPossibleDistance - requiredDistance) / 2;
        // Array to store all possible cumulative distances that can be formed
        var cumulativeDistances = [];
        // Iterate through each available step length
        for (var stepIndex = 0; stepIndex < availableSteps.length; stepIndex++) {
          // If the current step itself exceeds the cancellation distance,
          // no further steps or combinations with it can form the cancellation distance
          if (availableSteps[stepIndex] > cancellationDistance) {
            break; // Exit loop if current step is too large
          }

          var currentCumulativeCount = cumulativeDistances.length;
          cumulativeDistances.push(availableSteps[stepIndex]); // Add current step as a possible sum
          if (availableSteps[stepIndex] === cancellationDistance) {
            return true; // Found the exact cancellation distance
          }

          // Combine current step with previously found cumulative distances
          for (var previousSumIndex = 0; previousSumIndex < currentCumulativeCount; previousSumIndex++) {
            var combinedSum = availableSteps[stepIndex] + cumulativeDistances[previousSumIndex];
            cumulativeDistances.push(combinedSum); // Add new combined sum
            if (combinedSum === cancellationDistance) {
              return true; // Found the exact cancellation distance
            }
          }
        }
        return false; // Cancellation distance not found
      }
    }
    // If required distance is exactly the total possible distance
    else if (requiredDistance === totalPossibleDistance) {
      return true;
    }
    // If required distance is greater than total possible distance
    else {
      return false;
    }
  };

  // Check initial conditions for reachability
  if (finalTargetAbs[0] > totalXMovement || finalTargetAbs[1] > totalYMovement) {
    console.log("No");
    return false;
  }
  // Special case: if target is exactly the total sum of movements
  else if (finalTargetAbs[0] === totalXMovement && finalTargetAbs[1] === totalYMovement) {
    console.log("Yes");
    return false;
  }
  // Otherwise, use the detailed reachability check
  else {
    if (verifyReachability(xDirectionLengths, finalTargetAbs[0], totalXMovement) &&
        verifyReachability(yDirectionLengths, finalTargetAbs[1], totalYMovement)) {
      console.log("Yes");
      return false;
    } else {
      console.log("No");
      return false;
    }
  }
}

// Do not modify the code below this line (reads from standard input and calls the main processing function)
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));