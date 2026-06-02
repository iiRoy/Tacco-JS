function solveProblem(rawInputContent) {
  const rawInputLines = rawInputContent.split("\n");
  const gridDimension = parseInt(rawInputLines[0], 10);

  const dataLines = rawInputLines.slice(1, gridDimension + 1);

  const extendedGrid = new Array(gridDimension * 2);
  
  for (let k = 0; k < gridDimension; k++) {
    const originalLineSegment = dataLines[k];
    const duplicatedLineSegment = originalLineSegment + originalLineSegment;
    extendedGrid[k] = duplicatedLineSegment;
    extendedGrid[k + gridDimension] = duplicatedLineSegment;
  }

  let symmetricConfigurations = 0;

  for (let rowShift = 0; rowShift < gridDimension; rowShift++) {
    for (let colShift = 0; colShift < gridDimension; colShift++) {
      symmetricConfigurations += checkSubgridSymmetry(rowShift, colShift);
    }
  }

  console.log(symmetricConfigurations);

  function checkSubgridSymmetry(currentShiftRow, currentShiftCol) {
    for (let subGridRow = 0; subGridRow < gridDimension; subGridRow++) {
      for (let subGridCol = subGridRow + 1; subGridCol < gridDimension; subGridCol++) {
        const effectiveRowA = subGridRow + currentShiftRow;
        const effectiveColA = subGridCol + currentShiftCol;
        const effectiveRowB = subGridCol + currentShiftCol;
        const effectiveColB = subGridRow + currentShiftRow;

        const charAtPosA = extendedGrid[effectiveRowA][effectiveColA];
        const charAtPosB = extendedGrid[effectiveRowB][effectiveColB];

        if (charAtPosA !== charAtPosB) {
          return 0;
        }
      }
    }
    return 1;
  }
}

const INPUT_FILE_PATH = "/dev/stdin";
const fileContent = require("fs").readFileSync(INPUT_FILE_PATH, "utf8");
solveProblem(fileContent);
