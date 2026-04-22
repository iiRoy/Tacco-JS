function processGridData(sourceContent) {
  const contentLines = sourceContent.split("\n");

  const gridDimensions = contentLines[0].split(" ").map(Number);
  const extentRows = gridDimensions[0]; // Corresponds to original H
  const extentCols = gridDimensions[1]; // Corresponds to original W

  const markedPositions = new Set();
  contentLines.slice(1).forEach(lineItem => {
    if (lineItem.trim() === "") return;
    const [rowIdx, colIdx] = lineItem.split(" ").map(val => Number(val) - 1); // Convert to 0-indexed
    markedPositions.add(`${rowIdx},${colIdx}`);
  });

  const tallyBins = Array(10).fill(0); // To store counts for 0 to 9 marked cells in a 3x3 square

  // Iterate through every possible center for a 3x3 subgrid
  // A 3x3 subgrid centered at (r, c) spans from (r-1, c-1) to (r+1, c+1)
  // For the entire 3x3 subgrid to be within bounds, the center (r, c) must satisfy:
  // 1 <= r < extentRows - 1  (for 0-indexed, centerRow from 1 to extentRows - 2)
  // 1 <= c < extentCols - 1 (for 0-indexed, centerCol from 1 to extentCols - 2)
  for (let centerRowIdentifier = 1; centerRowIdentifier < extentRows - 1; centerRowIdentifier++) {
    for (let centerColIdentifier = 1; centerColIdentifier < extentCols - 1; centerColIdentifier++) {
      let currentMarkedCount = 0;

      // Check all 9 cells within the 3x3 subgrid
      for (let rOffset = -1; rOffset <= 1; rOffset++) {
        for (let cOffset = -1; cOffset <= 1; cOffset++) {
          const checkKey = `${centerRowIdentifier + rOffset},${centerColIdentifier + cOffset}`;
          if (markedPositions.has(checkKey)) {
            currentMarkedCount++;
          }
        }
      }
      tallyBins[currentMarkedCount]++;
    }
  }

  console.log(tallyBins.join("\n"));
}

// This line handles reading from standard input and invoking the processing function.
processGridData(require("node:fs").readFileSync("/dev/stdin", "utf8"));