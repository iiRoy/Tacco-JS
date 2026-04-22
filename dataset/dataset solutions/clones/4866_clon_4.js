const dataFeed = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const readNextLine = () => dataFeed.shift();

const printResult = (message) => console.log(message);

const dataParser = (value, operationCode) => {
  const converters = {
    1: (v) => parseInt(v),
    2: (v) => v.split(" "),
    4: (v) => v.split(" ").map(Number),
    6: (v) => v.split(""),
    7: (v) => v.split("").map(Number),
    8: (v) => v.join(" "),
    9: (v) => v.join("\n"),
    0: (v) => v.join(""),
  };
  return (converters[operationCode] || ((v) => v))(value);
};

const fetchChar = (r, c, numRows, numCols, layout) => {
  if (r < 0 || r >= numRows || c < 0 || c >= numCols) {
    return '#';
  }
  return layout[r][c];
};

const determinePathExistence = (layout, numRows, numCols) => {
  const startR = numRows - 1;
  const startC = numCols - 1;

  if (layout[startR][startC] === '#') {
    return false;
  }

  const memoizationTable = new Map();

  const traceCorridor = (currentR, currentC, cameFromAbove) => {
    const stateKey = `${currentR},${currentC},${cameFromAbove ? 1 : 0}`;
    if (memoizationTable.has(stateKey)) {
      return memoizationTable.get(stateKey);
    }

    if (currentR === 0 && currentC === 0) {
      const rightCell = fetchChar(currentR, currentC + 1, numRows, numCols, layout);
      const downCell = fetchChar(currentR + 1, currentC, numRows, numCols, layout);
      const result = (rightCell !== '#' && downCell !== '#');
      memoizationTable.set(stateKey, result);
      return result;
    }

    if (layout[currentR][currentC] === '#') {
      memoizationTable.set(stateKey, false);
      return false;
    }

    const cellAbove = fetchChar(currentR - 1, currentC, numRows, numCols, layout);
    const cellBelow = fetchChar(currentR + 1, currentC, numRows, numCols, layout);
    const cellLeft = fetchChar(currentR, currentC - 1, numRows, numCols, layout);
    const cellRight = fetchChar(currentR, currentC + 1, numRows, numCols, layout);

    let pathFound = false;

    if (currentC === 0) {
      if (cellAbove === '#' && cellRight !== '#' && cellBelow !== '#') {
        pathFound = traceCorridor(currentR - 1, currentC, true);
      }
    } else if (currentR === 0) {
      if (cellLeft === '#' && cellBelow !== '#' && cellRight !== '#') {
        pathFound = traceCorridor(currentR, currentC - 1, false);
      }
    } else if (currentR === startR || currentC === startC) {
      const cornerCondition = (cellAbove === '#' && cellLeft === '.') || (cellLeft === '#' && cellAbove === '.');
      if (cornerCondition) {
        if (cellAbove === '#') {
          pathFound = traceCorridor(currentR, currentC - 1, false);
        } else {
          pathFound = traceCorridor(currentR - 1, currentC, true);
        }
      }
    } else {
      const innerWallPattern = (cellAbove === '#' && cellLeft === '.') || (cellLeft === '#' && cellAbove === '.');

      if (cameFromAbove) {
        if (innerWallPattern && cellRight !== '#') {
          if (cellAbove === '#') {
            pathFound = traceCorridor(currentR, currentC - 1, false);
          } else {
            pathFound = traceCorridor(currentR - 1, currentC, true);
          }
        }
      } else {
        if (innerWallPattern && cellBelow !== '#') {
          if (cellAbove === '#') {
            pathFound = traceCorridor(currentR, currentC - 1, false);
          } else {
            pathFound = traceCorridor(currentR - 1, currentC, true);
          }
        }
      }
    }

    memoizationTable.set(stateKey, pathFound);
    return pathFound;
  };

  let firstStepR, firstStepC;
  let firstStepCameFromAbove;

  const initialUpCell = fetchChar(startR - 1, startC, numRows, numCols, layout);
  
  if (initialUpCell === '#') {
    firstStepR = startR - 1;
    firstStepC = startC;
    firstStepCameFromAbove = true;
  } else {
    firstStepR = startR;
    firstStepC = startC - 1;
    firstStepCameFromAbove = false;
  }

  if (firstStepR < 0 || firstStepC < 0 || layout[firstStepR][firstStepC] === '#') {
    return false;
  }

  return traceCorridor(firstStepR, firstStepC, firstStepCameFromAbove);
};

const runProgram = () => {
  const dimensions = dataParser(readNextLine(), 4);
  const dimensionRow = dimensions[0];
  const dimensionCol = dimensions[1];

  const gridMap = new Array(dimensionRow);
  for (let i = 0; i < dimensionRow; i++) {
    gridMap[i] = dataParser(readNextLine(), 6);
  }

  if (determinePathExistence(gridMap, dimensionRow, dimensionCol)) {
    printResult("Possible");
  } else {
    printResult("Impossible");
  }
};

runProgram();