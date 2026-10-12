function Main(input) {
  const rawLines = input.trim().split('\n');
  const dimensions = rawLines[0].split(' ');
  const gridHeight = parseInt(dimensions[0], 10);
  const gridWidth = parseInt(dimensions[1], 10);

  const obstacleSet = new Set(); // Stores obstacle coordinates as "r,c" strings
  for (let rIdx = 0; rIdx < gridHeight; rIdx++) {
    const rowContent = rawLines[rIdx + 1]; // This is the string for the current row
    for (let cIdx = 0; cIdx < gridWidth; cIdx++) {
      if (rowContent[cIdx] === '#') {
        obstacleSet.add(`${rIdx},${cIdx}`);
      }
    }
  }

  const MODULO_CONST = 1e9 + 7;
  const pathAccumulator = new Map(); // Stores path counts, key "r,c"

  // Handle the starting cell (0,0)
  if (obstacleSet.has("0,0")) {
    console.log(0);
    return;
  }
  pathAccumulator.set("0,0", 1);

  // Iterate diagonally, replicating the original loop structure and bounds
  // 'i_sum' represents the sum of coordinates (row + col)
  // 'j_row' represents the row index
  for (let i_sum = 1; i_sum < gridHeight + gridWidth - 1; i_sum++) {
    // Calculate the bounds for the row index 'j_row' based on the original logic
    const lowerBoundRow = Math.max(0, i_sum - gridHeight);
    const upperBoundRow = Math.min(i_sum, gridHeight - 1);

    for (let j_row = lowerBoundRow; j_row <= upperBoundRow; j_row++) {
      const k_col = i_sum - j_row; // 'k_col' represents the column index

      // Skip if the current cell (j_row, k_col) is an obstacle
      if (obstacleSet.has(`${j_row},${k_col}`)) {
        continue;
      }

      let pathsFromUp = 0;
      let pathsFromLeft = 0;

      // Replicate the original conditional logic for boundary cases
      if (j_row > 0 && k_col > 0) {
        // Paths can come from the cell directly above or directly to the left
        pathsFromUp = pathAccumulator.get(`${j_row - 1},${k_col}`) || 0;
        pathsFromLeft = pathAccumulator.get(`${j_row},${k_col - 1}`) || 0;
      } else if (j_row > 0) { // This implies k_col === 0 (first column)
        // Paths can only come from the cell directly above
        pathsFromUp = pathAccumulator.get(`${j_row - 1},${k_col}`) || 0;
      } else { // This implies j_row === 0 (first row) and k_col > 0
        // Paths can only come from the cell directly to the left
        pathsFromLeft = pathAccumulator.get(`${j_row},${k_col - 1}`) || 0;
      }

      // Store the total paths to the current cell, applying modulo
      pathAccumulator.set(`${j_row},${k_col}`, (pathsFromUp + pathsFromLeft) % MODULO_CONST);
    }
  }

  // The final result is the number of paths to the bottom-right cell (gridHeight-1, gridWidth-1)
  const finalPaths = pathAccumulator.get(`${gridHeight - 1},${gridWidth - 1}`) || 0;
  console.log(finalPaths);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
