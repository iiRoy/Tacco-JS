const AXIS_CHOICES = {
  UNASSIGNED: 0,
  X_AXIS_FIXED: 1,
  Y_AXIS_FIXED: 2,
};

const EXTREME_VALUE = Number.MAX_SAFE_INTEGER;

function assessArrangement(totalPoints, pointLocations, pointSelections) {
  let accumulatedCost = 0;

  const fixedXCoordinates = []; 
  const fixedYCoordinates = []; 

  for (let i = 0; i < totalPoints; ++i) {
    if (pointSelections[i] === AXIS_CHOICES.Y_AXIS_FIXED) {
      fixedXCoordinates.push(pointLocations[i].xCoord);
    } else if (pointSelections[i] === AXIS_CHOICES.X_AXIS_FIXED) {
      fixedYCoordinates.push(pointLocations[i].yCoord);
    }
  }

  for (let i = 0; i < totalPoints; ++i) {
    if (pointSelections[i] === AXIS_CHOICES.UNASSIGNED) {
      const currentPoint = pointLocations[i];
      let individualPointCost = EXTREME_VALUE;

      individualPointCost = Math.min(
        individualPointCost,
        Math.abs(currentPoint.xCoord) * currentPoint.weight
      );
      individualPointCost = Math.min(
        individualPointCost,
        Math.abs(currentPoint.yCoord) * currentPoint.weight
      );

      for (const refX of fixedXCoordinates) {
        individualPointCost = Math.min(
          individualPointCost,
          Math.abs(currentPoint.xCoord - refX) * currentPoint.weight
        );
      }

      for (const refY of fixedYCoordinates) {
        individualPointCost = Math.min(
          individualPointCost,
          Math.abs(currentPoint.yCoord - refY) * currentPoint.weight
        );
      }
      accumulatedCost += individualPointCost;
    }
  }

  return accumulatedCost;
}

function calculateOptimalCosts(count, coordinatesData) {
  const resultCollection = Array(count + 1).fill(EXTREME_VALUE);
  const totalCombinations = Math.pow(3, count);

  for (let currentMask = 0; currentMask < totalCombinations; ++currentMask) {
    const currentSelections = new Array(count);
    let tempMask = currentMask;
    let fixedCount = 0;

    for (let i = 0; i < count; ++i) {
      const choice = tempMask % 3;
      currentSelections[i] = choice;
      if (choice !== AXIS_CHOICES.UNASSIGNED) {
        fixedCount++;
      }
      tempMask = Math.floor(tempMask / 3);
    }

    const totalCost = assessArrangement(
      count,
      coordinatesData,
      currentSelections
    );
    resultCollection[fixedCount] = Math.min(resultCollection[fixedCount], totalCost);
  }

  return resultCollection;
}