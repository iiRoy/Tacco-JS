const create2DArray = (rows, cols, fillValue) => {
  return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
};

const parseGridDimensions = (dimensionLine) => {
  const parts = dimensionLine.split(" ");
  return {
    height: parseInt(parts[0], 10),
    width: parseInt(parts[1], 10)
  };
};

function processGridData(rawData) {
  const lines = rawData.split("\n");
  const { height: gridHeight, width: gridWidth } = parseGridDimensions(lines[0]);

  const gridCells = lines.slice(1, gridHeight + 1).map(rowStr => rowStr.split(""));

  const finalHorizontalLengths = create2DArray(gridHeight, gridWidth, 0);
  const finalVerticalLengths = create2DArray(gridHeight, gridWidth, 0);

  const leftPassLengths = create2DArray(gridHeight, gridWidth, 0);
  const rightPassLengths = create2DArray(gridHeight, gridWidth, 0);

  for (let rIdx = 0; rIdx < gridHeight; rIdx++) {
    for (let cIdx = 0; cIdx < gridWidth; cIdx++) {
      leftPassLengths[rIdx][cIdx] = (gridCells[rIdx][cIdx] === '#') ? 0 : (cIdx === 0 ? 1 : leftPassLengths[rIdx][cIdx - 1] + 1);
    }

    for (let cIdx = gridWidth - 1; cIdx >= 0; cIdx--) {
      rightPassLengths[rIdx][cIdx] = (gridCells[rIdx][cIdx] === '#') ? 0 : (cIdx === gridWidth - 1 ? 1 : rightPassLengths[rIdx][cIdx + 1] + 1);
    }
  }

  for (let rIdx = 0; rIdx < gridHeight; rIdx++) {
    for (let cIdx = 0; cIdx < gridWidth; cIdx++) {
      if (gridCells[rIdx][cIdx] === '#') {
        finalHorizontalLengths[rIdx][cIdx] = 0;
      } else {
        finalHorizontalLengths[rIdx][cIdx] = leftPassLengths[rIdx][cIdx] + rightPassLengths[rIdx][cIdx] - 1;
      }
    }
  }

  const topPassLengths = create2DArray(gridHeight, gridWidth, 0);
  const bottomPassLengths = create2DArray(gridHeight, gridWidth, 0);

  for (let cIdx = 0; cIdx < gridWidth; cIdx++) {
    for (let rIdx = 0; rIdx < gridHeight; rIdx++) {
      topPassLengths[rIdx][cIdx] = (gridCells[rIdx][cIdx] === '#') ? 0 : (rIdx === 0 ? 1 : topPassLengths[rIdx - 1][cIdx] + 1);
    }

    for (let rIdx = gridHeight - 1; rIdx >= 0; rIdx--) {
      bottomPassLengths[rIdx][cIdx] = (gridCells[rIdx][cIdx] === '#') ? 0 : (rIdx === gridHeight - 1 ? 1 : bottomPassLengths[rIdx + 1][cIdx] + 1);
    }
  }

  for (let rIdx = 0; rIdx < gridHeight; rIdx++) {
    for (let cIdx = 0; cIdx < gridWidth; cIdx++) {
      if (gridCells[rIdx][cIdx] === '#') {
        finalVerticalLengths[rIdx][cIdx] = 0;
      } else {
        finalVerticalLengths[rIdx][cIdx] = topPassLengths[rIdx][cIdx] + bottomPassLengths[rIdx][cIdx] - 1;
      }
    }
  }

  let maxLightPath = 0;
  for (let rIdx = 0; rIdx < gridHeight; rIdx++) {
    for (let cIdx = 0; cIdx < gridWidth; cIdx++) {
      if (gridCells[rIdx][cIdx] === '.') {
        maxLightPath = Math.max(maxLightPath, finalHorizontalLengths[rIdx][cIdx] + finalVerticalLengths[rIdx][cIdx] - 1);
      }
    }
  }

  console.log('%s', maxLightPath);
  return maxLightPath;
}

function testSolution(n) {
  var input = document.getElementById("input" + n).value;
  var ans = processGridData(input);
  var result = "WA";
  if (ans == document.getElementById("output" + n).value.split("\n")[0]) {
    result = "AC";
  }
  document.getElementById("result" + n).innerHTML = result;
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
