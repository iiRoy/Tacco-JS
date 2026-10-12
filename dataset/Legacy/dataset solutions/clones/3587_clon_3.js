let gridHeight = 0;
let gridWidth = 0;

function parseDimensions(firstLineContent) {
  const dimensionParts = firstLineContent.split(" ");
  return {
    height: parseInt(dimensionParts[0], 10),
    width: parseInt(dimensionParts[1], 10)
  };
}

function checkIfRowIsRemovable(rowElements) {
  return rowElements.every(cellValue => cellValue === "." || cellValue === "n");
}

function isRowCompletelyMarked(rowElements) {
  return rowElements.every(cellValue => cellValue === "n");
}

function processGridForRemoval(targetGrid, rowIndexToMark) {
  const canRowBeRemoved = checkIfRowIsRemovable(targetGrid[rowIndexToMark]);
  if (!canRowBeRemoved) {
    return targetGrid;
  }

  const modifiedGrid = targetGrid.map((currentRow, currentIdx) => {
    if (currentIdx === rowIndexToMark) {
      return currentRow.map(() => "n");
    } else {
      return [...currentRow];
    }
  });
  return modifiedGrid;
}

function transposeGrid(inputGrid) {
  const originalRows = inputGrid.length;
  if (originalRows === 0) return [];
  const originalCols = inputGrid[0].length;

  const transposedResult = Array.from({
    length: originalCols
  }, () => Array(originalRows).fill(null));

  for (let rIdx = 0; rIdx < originalRows; rIdx++) {
    for (let cIdx = 0; cIdx < originalCols; cIdx++) {
      transposedResult[cIdx][rIdx] = inputGrid[rIdx][cIdx];
    }
  }
  return transposedResult;
}

function initializeGridFromLines(rawInputLines) {
  const filteredInputLines = rawInputLines.filter(lineContent => lineContent.length > 0);
  return filteredInputLines.map(lineContent => lineContent.split(""));
}

function displayOutputGrid(outputGrid) {
  for (const displayRow of outputGrid) {
    const isRowEffectivelyEmpty = isRowCompletelyMarked(displayRow);
    if (!isRowEffectivelyEmpty) {
      console.log(displayRow.filter(cell => cell !== "n").join(""));
    }
  }
}

function mainProcessor(rawData) {
  const allInputLines = rawData.split("\n");
  const firstLine = allInputLines[0];

  const dimensions = parseDimensions(firstLine);
  gridHeight = dimensions.height;
  gridWidth = dimensions.width;

  const dataLines = allInputLines.slice(1);
  let currentGrid = initializeGridFromLines(dataLines);

  for (let r = 0; r < gridHeight; r++) {
    currentGrid = processGridForRemoval(currentGrid, r);
  }

  currentGrid = transposeGrid(currentGrid);

  for (let c = 0; c < gridWidth; c++) {
    currentGrid = processGridForRemoval(currentGrid, c);
  }

  const finalGridForDisplay = transposeGrid(currentGrid);
  displayOutputGrid(finalGridForDisplay);
}

const STDIN_FILE_PATH = "/dev/stdin";
try {
  const inputContent = require("fs").readFileSync(STDIN_FILE_PATH, "utf8");
  mainProcessor(inputContent);
} catch (error) {
  throw error;
}
