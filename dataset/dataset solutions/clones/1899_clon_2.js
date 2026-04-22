const fileSystemOperations = require('fs');

const sourceInputLines = fileSystemOperations.readFileSync('/dev/stdin', 'utf8') .split('\n');

const [totalLocations, connectionQuantity] = sourceInputLines[0] .split(' ') .map(Number);

const elevationData = sourceInputLines[1] .split(' ') .map(Number);

let goodViewpointFlags = new Array(totalLocations) .fill(true); // All locations are initially considered potential good viewpoints

for ( let roadIteration = 0 ; roadIteration < connectionQuantity ; roadIteration++ )
{
  const [pointAlpha, pointBeta] = sourceInputLines[roadIteration + 2] .split(' ') .map(strVal => Number(strVal) - 1); // Parse connected points, adjust to 0-indexed

  if (elevationData[pointAlpha] < elevationData[pointBeta])
  {
    goodViewpointFlags[pointAlpha] = false; // If Alpha is lower, it's not a good viewpoint
  }
  else if (elevationData[pointBeta] < elevationData[pointAlpha])
  {
    goodViewpointFlags[pointBeta] = false; // If Beta is lower, it's not a good viewpoint
  }
  else
  {
    goodViewpointFlags[pointAlpha] = goodViewpointFlags[pointBeta] = false; // If elevations are equal, neither can be a good viewpoint
  }
}

// Count how many locations remain marked as good viewpoints and display the result
console.log(goodViewpointFlags .filter(status => status) .length);