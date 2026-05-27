function processPathfinding(rawInput) {
  const inputLines = rawInput.trim().split("\n");

  const [gridRows, gridCols] = inputLines[0].split(" ").map(Number);
  const [initialY, initialX] = inputLines[1].split(" ").map(s => Number(s) - 1);
  const [finalY, finalX] = inputLines[2].split(" ").map(s => Number(s) - 1);

  const gridMatrix = inputLines.slice(3).map(line => line.split(""));

  const advancePath = (currentState) => {
    const { y: currentY, x: currentX, teleports: currentTeleports } = currentState;

    const rightwardOption = finalX > currentX &&
                            currentY >= 0 && currentY < gridRows &&
                            currentX + 1 >= 0 && currentX + 1 < gridCols &&
                            gridMatrix[currentY][currentX + 1] === '.';

    const downwardOption = finalY > currentY &&
                           currentY + 1 >= 0 && currentY + 1 < gridRows &&
                           currentX >= 0 && currentX < gridCols &&
                           gridMatrix[currentY + 1][currentX] === '.';

    const teleportOption = Math.abs(finalY - currentY) <= 2 &&
                           Math.abs(finalX - currentX) <= 2;

    if (rightwardOption) {
      return { y: currentY, x: currentX + 1, teleports: currentTeleports };
    } else if (downwardOption) {
      return { y: currentY + 1, x: currentX, teleports: currentTeleports };
    } else if (teleportOption) {
      return { y: finalY, x: finalX, teleports: currentTeleports + 1 };
    } else {
      return currentState; // Should not be reached if a solution always exists
    }
  };

  let pathState = { y: initialY, x: initialX, teleports: 0 };

  while (pathState.y !== finalY || pathState.x !== finalX) {
    pathState = advancePath(pathState);
  }

  console.log(pathState.teleports);
}

processPathfinding(require("fs").readFileSync("/dev/stdin", "utf8"));
