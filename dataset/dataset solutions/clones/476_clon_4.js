function absoluteValue(val) {
  return Math.abs(val);
}

function createCoordinate(xVal, yVal) {
  return [xVal, yVal];
}

function measureSeparation(coordA, coordB) {
  return absoluteValue(coordA[0] - coordB[0]) + absoluteValue(coordA[1] - coordB[1]);
}

function findLesser(valA, valB) {
  return Math.min(valA, valB);
}

function processAllGames(dataLines) {
  let linePointer = 0;
  const limitlessReach = Number.MAX_SAFE_INTEGER;

  while (true) {
    const dimensions = dataLines[linePointer].split(' ').map(Number);
    const gridWidth = dimensions[0];
    const gridHeight = dimensions[1];

    if (gridWidth === 0 && gridHeight === 0) {
      break;
    }

    let initialPoint;
    let finalPoint;
    const itemLocations = [[], [], [], [], []];

    for (let currentGridRow = gridHeight; currentGridRow > 0; currentGridRow--) {
      linePointer++;
      const rowContent = dataLines[linePointer];

      for (let currentGridCol = gridWidth; currentGridCol > 0; currentGridCol--) {
        const cellContent = rowContent[gridWidth - currentGridCol];

        if (cellContent === '.') {
          // Empty cell, do nothing
        } else if (cellContent === 'S') {
          initialPoint = createCoordinate(gridWidth - currentGridCol, gridHeight - currentGridRow);
        } else if (cellContent === 'G') {
          finalPoint = createCoordinate(gridWidth - currentGridCol, gridHeight - currentGridRow);
        } else {
          const itemCategory = Number(cellContent) - 1;
          itemLocations[itemCategory].push(createCoordinate(gridWidth - currentGridCol, gridHeight - currentGridRow));
        }
      }
    }

    let optimalCategory = -1;
    let minimalJourney = limitlessReach;

    for (let primaryStartingCategory = 0; primaryStartingCategory < 5; primaryStartingCategory++) {
      const pathCosts = Array(5).fill(null).map(() => []);
      for (let categoryIdx = 0; categoryIdx < 5; categoryIdx++) {
        pathCosts[categoryIdx] = Array(itemLocations[categoryIdx].length).fill(limitlessReach);
      }

      const firstVisitCategory = (primaryStartingCategory + 1) % 5;

      for (let itemIdx = 0; itemIdx < itemLocations[firstVisitCategory].length; itemIdx++) {
        pathCosts[firstVisitCategory][itemIdx] = measureSeparation(initialPoint, itemLocations[firstVisitCategory][itemIdx]);
      }

      for (let sequenceStep = 0; sequenceStep < 3; sequenceStep++) {
        const currentCategory = (firstVisitCategory + sequenceStep) % 5;
        const subsequentCategory = (currentCategory + 1) % 5;

        for (let currentItemIdx = 0; currentItemIdx < itemLocations[currentCategory].length; currentItemIdx++) {
          const costThroughCurrent = pathCosts[currentCategory][currentItemIdx];
          if (costThroughCurrent === limitlessReach) continue;

          for (let subsequentItemIdx = 0; subsequentItemIdx < itemLocations[subsequentCategory].length; subsequentItemIdx++) {
            const travelCost = measureSeparation(
              itemLocations[currentCategory][currentItemIdx],
              itemLocations[subsequentCategory][subsequentItemIdx]
            );

            pathCosts[subsequentCategory][subsequentItemIdx] = findLesser(
              pathCosts[subsequentCategory][subsequentItemIdx],
              costThroughCurrent + travelCost
            );
          }
        }
      }

      const finalVisitCategory = (firstVisitCategory + 3) % 5;
      for (let itemIdx = 0; itemIdx < itemLocations[finalVisitCategory].length; itemIdx++) {
        const candidateJourney = pathCosts[finalVisitCategory][itemIdx] + measureSeparation(itemLocations[finalVisitCategory][itemIdx], finalPoint);

        if (candidateJourney < minimalJourney) {
          minimalJourney = candidateJourney;
          optimalCategory = primaryStartingCategory + 1;
        }
      }
    }

    if (minimalJourney === limitlessReach) {
      console.log("NA");
    } else {
      console.log(optimalCategory + " " + minimalJourney);
    }

    linePointer++;
  }
}

let dataAccumulator = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  dataAccumulator += chunk;
});
process.stdin.on('end', function() {
  const parsedDataLines = dataAccumulator.split('\n');
  processAllGames(parsedDataLines);
});