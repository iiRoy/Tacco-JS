function ProcessInputEntities(rawDataString) {
  // Normalize input string: trim whitespace, split into lines, then split each line by space.
  let parsedInputLines = rawDataString.trim().split("\n").map( function(singleLine) {
    return singleLine.split(" ");
  } );

  // Extract the total count of data points from the first line.
  let entityCount = parseInt(parsedInputLines[0][0], 10);

  // Initialize an array to store coordinates and movement directions.
  // Each element will be [x_coord, y_coord, direction_char].
  let entityCoordinatesAndDirections = [];

  // Populate the entity data array.
  for (let currentIdx = 0; currentIdx < entityCount; currentIdx++) {
    let xValue = parseInt(parsedInputLines[currentIdx + 1][0], 10);
    let yValue = parseInt(parsedInputLines[currentIdx + 1][1], 10);
    let directionValue = parsedInputLines[currentIdx + 1][2];
    entityCoordinatesAndDirections.push([xValue, yValue, directionValue]);
  }

  // Initialize the minimum time to collision to a very large number (infinity).
  let shortestEncounterDuration = Number.POSITIVE_INFINITY;

  /*
   * First set of collision checks:
   * Sorting by (x + y) sum, then by x-coordinate.
   * This helps in detecting collisions along a diagonal line (constant x+y).
   */
  entityCoordinatesAndDirections.sort(function(firstEntity, secondEntity) {
    const sumA = firstEntity[0] + firstEntity[1];
    const sumB = secondEntity[0] + secondEntity[1];

    if (sumA < sumB) {
      return -1;
    }
    if (sumA > sumB) {
      return 1;
    }

    // If sums are equal, sort by x-coordinate.
    if (firstEntity[0] < secondEntity[0]) {
      return -1;
    }
    if (firstEntity[0] > secondEntity[0]) {
      return 1;
    }
    return 0;
  });

  let currentDiagonalSum = -1; // Sentinel value for the first group.
  let referenceXCoord;         // Stores the x-coordinate of the last 'R' direction entity.
  let activeDiagonalDirection = 'U'; // 'U' or 'R' in this pass.

  // Iterate through sorted entities to find potential collisions.
  for (let pointIterator = 0; pointIterator < entityCoordinatesAndDirections.length; pointIterator++) {
    let currentPointData = entityCoordinatesAndDirections[pointIterator];
    let currentPointX = currentPointData[0];
    let currentPointY = currentPointData[1];
    let currentPointDir = currentPointData[2];

    if (currentDiagonalSum === (currentPointX + currentPointY)) {
      // We are in the same diagonal group.
      if (activeDiagonalDirection === 'R') {
        // If the previous relevant entity was moving 'R', check for 'U' collision.
        if (currentPointDir === 'U') {
          activeDiagonalDirection = 'U'; // Reset or change state.
          // Calculate potential collision time and update minimum.
          shortestEncounterDuration = Math.min(shortestEncounterDuration, Math.abs(currentPointX - referenceXCoord) * 10);
        } else if (currentPointDir === 'R') {
          // If another 'R' entity, update the reference x-coordinate.
          referenceXCoord = currentPointX;
        }
      } else {
        // If active direction is 'U' (or initially), look for 'R' to start a collision sequence.
        if (currentPointDir === 'R') {
          activeDiagonalDirection = 'R';
          referenceXCoord = currentPointX;
        }
      }
    } else {
      // New diagonal group. Reset tracking.
      currentDiagonalSum = currentPointX + currentPointY;
      if (currentPointDir === 'R') {
        activeDiagonalDirection = 'R';
        referenceXCoord = currentPointX;
      } else {
        activeDiagonalDirection = 'U';
      }
    }
  }

  // Re-initialize for the next set of checks (different directions 'L'/'D').
  currentDiagonalSum = -1;
  activeDiagonalDirection = 'L'; // 'L' or 'D' in this pass.

  for (let pointIter = 0; pointIter < entityCoordinatesAndDirections.length; pointIter++) {
    let currentPoint = entityCoordinatesAndDirections[pointIter];
    let ptX = currentPoint[0];
    let ptY = currentPoint[1];
    let ptDir = currentPoint[2];

    if (currentDiagonalSum === (ptX + ptY)) {
      if (activeDiagonalDirection === 'D') {
        if (ptDir === 'L') {
          activeDiagonalDirection = 'L';
          shortestEncounterDuration = Math.min(shortestEncounterDuration, Math.abs(ptX - referenceXCoord) * 10);
        } else if (ptDir === 'D') {
          referenceXCoord = ptX;
        }
      } else {
        if (ptDir === 'D') {
          activeDiagonalDirection = 'D';
          referenceXCoord = ptX;
        }
      }
    } else {
      currentDiagonalSum = ptX + ptY;
      if (ptDir === 'D') {
        activeDiagonalDirection = 'D';
        referenceXCoord = ptX;
      } else {
        activeDiagonalDirection = 'L';
      }
    }
  }


  /*
   * Second set of collision checks:
   * Sorting by (y - x) difference, then by x-coordinate.
   * This helps in detecting collisions along another diagonal line (constant y-x).
   */
  entityCoordinatesAndDirections.sort( function(itemA, itemB) {
    const diffA = itemA[1] - itemA[0];
    const diffB = itemB[1] - itemB[0];

    if (diffA < diffB) return -1;
    if (diffA > diffB) return 1;

    // If differences are equal, sort by x-coordinate.
    if (itemA[0] < itemB[0]) return -1;
    if (itemA[0] > itemB[0]) return 1;
    return 0;
  });

  let currentDifferenceKey = Number.POSITIVE_INFINITY; // Sentinel for the first group.
  referenceXCoord = undefined;                         // Reset.
  activeDiagonalDirection = 'D';                       // 'D' or 'R' in this pass.

  for (let processingIndex = 0; processingIndex < entityCoordinatesAndDirections.length; processingIndex++) {
    let currentItem = entityCoordinatesAndDirections[processingIndex];
    let itemX = currentItem[0];
    let itemY = currentItem[1];
    let itemDirection = currentItem[2];

    if (currentDifferenceKey === (itemY - itemX)) {
      if (activeDiagonalDirection === 'R') {
        if (itemDirection === 'D') {
          activeDiagonalDirection = 'D';
          shortestEncounterDuration = Math.min(shortestEncounterDuration, Math.abs(itemX - referenceXCoord) * 10);
        } else if (itemDirection === 'R') {
          referenceXCoord = itemX;
        }
      } else {
        if (itemDirection === 'R') {
          activeDiagonalDirection = 'R';
          referenceXCoord = itemX;
        }
      }
    } else {
      currentDifferenceKey = itemY - itemX;
      if (itemDirection === 'R') {
        activeDiagonalDirection = 'R';
        referenceXCoord = itemX;
      } else {
        activeDiagonalDirection = 'D';
      }
    }
  }

  // Re-initialize for the next set of checks (different directions 'L'/'U').
  currentDifferenceKey = Number.POSITIVE_INFINITY;
  activeDiagonalDirection = 'L'; // 'L' or 'U' in this pass.

  for (let procIdx = 0; procIdx < entityCoordinatesAndDirections.length; procIdx++) {
    let currentEnt = entityCoordinatesAndDirections[procIdx];
    let entX = currentEnt[0];
    let entY = currentEnt[1];
    let entDir = currentEnt[2];

    if (currentDifferenceKey === (entY - entX)) {
      if (activeDiagonalDirection === 'U') {
        if (entDir === 'L') {
          activeDiagonalDirection = 'L';
          shortestEncounterDuration = Math.min(shortestEncounterDuration, Math.abs(entX - referenceXCoord) * 10);
        } else if (entDir === 'U') {
          referenceXCoord = entX;
        }
      } else {
        if (entDir === 'U') {
          activeDiagonalDirection = 'U';
          referenceXCoord = entX;
        }
      }
    } else {
      currentDifferenceKey = entY - entX;
      if (entDir === 'U') {
        activeDiagonalDirection = 'U';
        referenceXCoord = entX;
      } else {
        activeDiagonalDirection = 'L';
      }
    }
  }


  /*
   * Third set of collision checks:
   * Sorting by x-coordinate, then by y-coordinate.
   * This helps in detecting collisions along vertical lines.
   */
  entityCoordinatesAndDirections.sort(function(itemOne, itemTwo) {
    if (itemOne[0] < itemTwo[0]) return -1;
    if (itemOne[0] > itemTwo[0]) return 1;

    // If x-coordinates are equal, sort by y-coordinate.
    if (itemOne[1] < itemTwo[1]) return -1;
    if (itemOne[1] > itemTwo[1]) return 1;
    return 0;
  });

  let currentXCoordinate = -1; // Sentinel for the first group.
  let referenceYCoord;         // Stores the y-coordinate of the last 'U' direction entity.
  let activeVerticalDirection = 'D'; // 'D' or 'U' in this pass.

  for (let entryIndex = 0; entryIndex < entityCoordinatesAndDirections.length; entryIndex++) {
    let currentEntry = entityCoordinatesAndDirections[entryIndex];
    let entryX = currentEntry[0];
    let entryY = currentEntry[1];
    let entryDirection = currentEntry[2];

    if (currentXCoordinate === entryX) {
      if (activeVerticalDirection === 'U') {
        if (entryDirection === 'D') {
          activeVerticalDirection = 'D';
          // Collision time calculated using y-coordinates and multiplier 5.
          shortestEncounterDuration = Math.min(shortestEncounterDuration, Math.abs(entryY - referenceYCoord) * 5);
        } else if (entryDirection === 'U') {
          referenceYCoord = entryY;
        }
      } else {
        if (entryDirection === 'U') {
          activeVerticalDirection = 'U';
          referenceYCoord = entryY;
        }
      }
    } else {
      currentXCoordinate = entryX;
      if (entryDirection === 'U') {
        activeVerticalDirection = 'U';
        referenceYCoord = entryY;
      } else {
        activeVerticalDirection = 'D';
      }
    }
  }


  /*
   * Fourth set of collision checks:
   * Sorting by y-coordinate, then by x-coordinate.
   * This helps in detecting collisions along horizontal lines.
   */
  entityCoordinatesAndDirections.sort(function(objectA, objectB) {
    if (objectA[1] < objectB[1]) return -1;
    if (objectA[1] > objectB[1]) return 1;

    // If y-coordinates are equal, sort by x-coordinate.
    if (objectA[0] < objectB[0]) return -1;
    if (objectA[0] > objectB[0]) return 1;
    return 0;
  });

  let currentYCoordinate = -1; // Sentinel for the first group.
  referenceXCoord = undefined; // Stores the x-coordinate of the last 'R' direction entity.
  let activeHorizontalDirection = 'L'; // 'L' or 'R' in this pass.

  for (let recordIndex = 0; recordIndex < entityCoordinatesAndDirections.length; recordIndex++) {
    let currentRecord = entityCoordinatesAndDirections[recordIndex];
    let recordX = currentRecord[0];
    let recordY = currentRecord[1];
    let recordDirection = currentRecord[2];

    if (currentYCoordinate === recordY) {
      if (activeHorizontalDirection === 'R') {
        if (recordDirection === 'L') {
          activeHorizontalDirection = 'L';
          // Collision time calculated using x-coordinates and multiplier 5.
          shortestEncounterDuration = Math.min(shortestEncounterDuration, Math.abs(recordX - referenceXCoord) * 5);
        } else if (recordDirection === 'R') {
          referenceXCoord = recordX;
        }
      } else {
        if (recordDirection === 'R') {
          activeHorizontalDirection = 'R';
          referenceXCoord = recordX;
        }
      }
    } else {
      currentYCoordinate = recordY; // Update the current group key.
      if (recordDirection === 'R') {
        activeHorizontalDirection = 'R';
        referenceXCoord = recordX;
      } else {
        activeHorizontalDirection = 'L';
      }
    }
  }

  // Determine the final output string.
  let finalResult = shortestEncounterDuration === Number.POSITIVE_INFINITY ? "SAFE" : shortestEncounterDuration;
  console.log(finalResult);
}


// Read input from standard input and process it.
ProcessInputEntities(require("fs").readFileSync("/dev/stdin", "utf8"));