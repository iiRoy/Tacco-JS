function processGridTraversal(rawJourneyData) {
  const numericalData = rawJourneyData.trim().match(/\d+/g).map(Number);

  const [
    gridDimensionY,
    gridDimensionX,
    initialYCoord,
    initialXCoord,
    destinationYCoord,
    destinationXCoord
  ] = numericalData;

  const gridRows = rawJourneyData.trim().split('\n').slice(3).map(row => row.split(''));

  const explorePath = (cY, cX, tY, tX, currentLayout, currentTeleports) => {
    if (cY === tY && cX === tX) {
      return currentTeleports;
    }

    const possibleMovements = [
      (currentPos, targetPos, layout, teleCount) => {
        if (targetPos.x > currentPos.x && layout[currentPos.y][currentPos.x + 1] === '.') {
          return {
            nextY: currentPos.y,
            nextX: currentPos.x + 1,
            nextTeleports: teleCount,
            executed: true
          };
        }
        return { executed: false };
      },
      (currentPos, targetPos, layout, teleCount) => {
        if (targetPos.y > currentPos.y && layout[currentPos.y + 1][currentPos.x] === '.') {
          return {
            nextY: currentPos.y + 1,
            nextX: currentPos.x,
            nextTeleports: teleCount,
            executed: true
          };
        }
        return { executed: false };
      },
      (currentPos, targetPos, layout, teleCount) => {
        const yDiff = Math.abs(targetPos.y - currentPos.y);
        const xDiff = Math.abs(targetPos.x - currentPos.x);
        if (yDiff <= 2 && xDiff <= 2) {
          return {
            nextY: targetPos.y,
            nextX: targetPos.x,
            nextTeleports: teleCount + 1,
            executed: true
          };
        }
        return { executed: false };
      }
    ];

    const currentPosition = { y: cY, x: cX };
    const targetPosition = { y: tY, x: tX };
    let chosenAction = null;

    for (const movement of possibleMovements) {
      const result = movement(currentPosition, targetPosition, currentLayout, currentTeleports);
      if (result.executed) {
        chosenAction = result;
        break;
      }
    }

    return explorePath(
      chosenAction.nextY,
      chosenAction.nextX,
      tY,
      tX,
      currentLayout,
      chosenAction.nextTeleports
    );
  };

  return explorePath(
    initialYCoord - 1,
    initialXCoord - 1,
    destinationYCoord - 1,
    destinationXCoord - 1,
    gridRows,
    0
  );
}

processGridTraversal(require("fs").readFileSync("/dev/stdin", "utf8"));