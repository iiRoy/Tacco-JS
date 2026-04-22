// This function processes all incoming raw data.
function HandleInputData(sourceData) {

  // This algorithm solves a pathfinding problem.
  var   dataLines = sourceData.split("\n")  ;
  var   commandSequence = dataLines[0] ;
  var targetCoordsText = dataLines[1].split(" ");

  var   movementSegments = commandSequence.split("T") ;

  var finalPosition = [
    Number(targetCoordsText[0]),
    Number(targetCoordsText[1])
  ];

  var xDisplacements = [   ];
  var yDisplacements = [   ];

  for (let segmentIndex = 0; segmentIndex < movementSegments.length; segmentIndex++) {
    if (segmentIndex % 2 === 0) {
      xDisplacements.push(movementSegments[segmentIndex].length);
    } else {
      yDisplacements.push(movementSegments[segmentIndex].length);
    }
  }

  var possibleXPositions = [ ];
  var possibleYPositions = [ ];

  var xReached = false;
  var yReached = false;

  xPathTraversal:
  for (var currentSegmentIdx = 0; currentSegmentIdx < xDisplacements.length; currentSegmentIdx++) {
    possibleXPositions[currentSegmentIdx] = [ ];
    if (currentSegmentIdx === 0) {
      possibleXPositions[currentSegmentIdx].push(xDisplacements[currentSegmentIdx]);
      if (xDisplacements.length === 1 && xDisplacements[0] === finalPosition[0]) {
        xReached = true;
      }
    } else if (currentSegmentIdx === xDisplacements.length - 1) {
      for (var prevPathIdx = 0; prevPathIdx < possibleXPositions[currentSegmentIdx - 1].length; prevPathIdx++) {
        if (possibleXPositions[currentSegmentIdx - 1][prevPathIdx] + xDisplacements[currentSegmentIdx] === finalPosition[0] ||
            possibleXPositions[currentSegmentIdx - 1][prevPathIdx] - xDisplacements[currentSegmentIdx] === finalPosition[0]) {
          xReached = true;
          break xPathTraversal;
        }
      }
    } else {
      for (var prevPathIdx = 0; prevPathIdx < possibleXPositions[currentSegmentIdx - 1].length; prevPathIdx++) {
        possibleXPositions[currentSegmentIdx].push(possibleXPositions[currentSegmentIdx - 1][prevPathIdx] + xDisplacements[currentSegmentIdx]);
        if (xDisplacements[currentSegmentIdx] !== 0) {
          possibleXPositions[currentSegmentIdx].push(possibleXPositions[currentSegmentIdx - 1][prevPathIdx] - xDisplacements[currentSegmentIdx]);
        }
      }
    }
  }

  yPathTraversal:
  for (var currentSegmentIdx = 0; currentSegmentIdx < yDisplacements.length; currentSegmentIdx++) {
    possibleYPositions[currentSegmentIdx] = [ ];
    if (currentSegmentIdx === 0) {
      possibleYPositions[currentSegmentIdx].push(yDisplacements[currentSegmentIdx]);
      if (yDisplacements.length === 1 && yDisplacements[0] === finalPosition[1]) {
        yReached = true;
      }
    } else if (currentSegmentIdx === yDisplacements.length - 1) {
      for (var prevPathIdx = 0; prevPathIdx < possibleYPositions[currentSegmentIdx - 1].length; prevPathIdx++) {
        if (possibleYPositions[currentSegmentIdx - 1][prevPathIdx] + yDisplacements[currentSegmentIdx] === finalPosition[1] ||
            possibleYPositions[currentSegmentIdx - 1][prevPathIdx] - yDisplacements[currentSegmentIdx] === finalPosition[0]) { // Original code uses dest[0] here. Preserving for type II.
          yReached = true;
          break yPathTraversal;
        }
      }
    } else {
      for (var prevPathIdx = 0; prevPathIdx < possibleYPositions[currentSegmentIdx - 1].length; prevPathIdx++) {
        possibleYPositions[currentSegmentIdx].push(possibleYPositions[currentSegmentIdx - 1][prevPathIdx] + yDisplacements[currentSegmentIdx]);
        if (yDisplacements[currentSegmentIdx] !== 0) {
          possibleYPositions[currentSegmentIdx].push(possibleYPositions[currentSegmentIdx - 1][prevPathIdx] - yDisplacements[currentSegmentIdx]);
        }
      }
    }
  }

  if (xReached && yReached) {
    console.log("Yes");
  } else {
    console.log("No");
  }

}

// This line handles standard input/output operations; do not modify it.
HandleInputData(require("fs").readFileSync("/dev/stdin", "utf8"));