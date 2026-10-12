function solveGridPath(rawInputString) {
  rawInputString = rawInputString.trim();
  const inputLinesArray = rawInputString.split("\n");

  // Helper to parse initial configuration and grid
  const parseGameData = (lines) => {
    const configParams = lines.slice(0, 3).map(line => line.split(" ").map(Number));
    
    const [gridRows, gridCols] = configParams[0];
    const [startY, startX] = configParams[1];
    const [goalY, goalX] = configParams[2];

    const gridLayout = lines.slice(3).map(line => line.split(""));

    return {
      gridRows,
      gridCols,
      currentAgentRow: startY - 1,
      currentAgentCol: startX - 1,
      targetRow: goalY - 1,
      targetCol: goalX - 1,
      gridLayout
    };
  };

  const {
    gridRows,
    gridCols,
    currentAgentRow: initialAgentRow,
    currentAgentCol: initialAgentCol,
    targetRow,
    targetCol,
    gridLayout: initialGridLayout
  } = parseGameData(inputLinesArray);

  let currentAgentRow = initialAgentRow;
  let currentAgentCol = initialAgentCol;
  let teleportJumps = 0;
  let gridLayout = JSON.parse(JSON.stringify(initialGridLayout)); // Deep copy for mutable grid

  // Helper for deep cloning a 2D array
  const deepClone2DArray = (arr) => JSON.parse(JSON.stringify(arr));

  const AGENT_MARKER = "@";
  const GOAL_MARKER = "G";
  const PATH_TILE = ".";

  const renderCurrentGrid = () => {
    const visualGridCopy = deepClone2DArray(gridLayout);
    visualGridCopy[currentAgentRow][currentAgentCol] = AGENT_MARKER;
    visualGridCopy[targetRow][targetCol] = GOAL_MARKER;

    const gridDisplayString = visualGridCopy.map(row => row.join("")).join("\n");
    // console.log(gridDisplayString); // Original had this commented out
  };

  const attemptMovement = () => {
    const canMoveRight = currentAgentCol + 1 < gridCols && gridLayout[currentAgentRow][currentAgentCol + 1] === PATH_TILE;
    const canMoveDown = currentAgentRow + 1 < gridRows && gridLayout[currentAgentRow + 1][currentAgentCol] === PATH_TILE;

    const isTargetCloseEnoughForWarp = 
      Math.abs(targetRow - currentAgentRow) <= 2 && 
      Math.abs(targetCol - currentAgentCol) <= 2;

    if (targetCol > currentAgentCol && canMoveRight) {
      currentAgentCol++;
    } else if (targetRow > currentAgentRow && canMoveDown) {
      currentAgentRow++;
    } else if (isTargetCloseEnoughForWarp) {
      currentAgentRow = targetRow;
      currentAgentCol = targetCol;
      teleportJumps++;
    }
    renderCurrentGrid();
  };

  let hasReachedGoal = false;
  while (!hasReachedGoal) {
    if (currentAgentRow === targetRow && currentAgentCol === targetCol) {
      console.log(teleportJumps);
      hasReachedGoal = true;
    } else {
      attemptMovement();
    }
  }
}

solveGridPath(require("fs").readFileSync("/dev/stdin", "utf8"));
