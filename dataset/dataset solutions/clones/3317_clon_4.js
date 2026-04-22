function executeSolution(problemData) {
  const linesOfInput = problemData.split('\n').filter(Boolean);
  const [numRows, numCols] = linesOfInput[0].split(' ').map(Number);
  const obstacleLayout = linesOfInput.slice(1, numRows + 1).map(rowString => rowString.split(''));

  const ARITHMETIC_PRIME = 1000000007;

  // Initialize a memoization table with a sentinel value (-1)
  const pathCounts = Array.from({ length: numRows }, () => Array(numCols).fill(-1));

  // Recursive function to determine the number of valid paths
  function findAccessibleRoutes(rowCoord, colCoord) {
    // Boundary conditions
    if (rowCoord < 0 || colCoord < 0) {
      return 0;
    }
    // Obstacle check
    if (obstacleLayout[rowCoord][colCoord] === '#') {
      return 0;
    }
    // Base case: starting point
    if (rowCoord === 0 && colCoord === 0) {
      return 1;
    }

    // Check memoization table
    if (pathCounts[rowCoord][colCoord] !== -1) {
      return pathCounts[rowCoord][colCoord];
    }

    // Recursive step: sum paths from above and from the left
    const pathsFromUp = findAccessibleRoutes(rowCoord - 1, colCoord);
    const pathsFromLeft = findAccessibleRoutes(rowCoord, colCoord - 1);

    // Store the result in the memoization table and apply modulo
    pathCounts[rowCoord][colCoord] = (pathsFromUp + pathsFromLeft) % ARITHMETIC_PRIME;
    return pathCounts[rowCoord][colCoord];
  }

  // Initiate the path calculation from the destination cell
  const totalRoutes = findAccessibleRoutes(numRows - 1, numCols - 1);

  // Output the final count
  console.log(totalRoutes);
}

// Entry point for execution
executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));