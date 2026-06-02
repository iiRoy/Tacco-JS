class GridStateContainer {
  constructor(rows, columns) {
    this.totalRows = rows;
    this.totalColumns = columns;
    this.stateMap = new Map();
  }

  retrieveStates(row, column) {
    if (row < 0 || row >= this.totalRows || column < 0 || column >= this.totalColumns) {
      return [0, 0, 0, 0];
    }
    const key = `${row}_${column}`;
    return this.stateMap.get(key) || [0, 0, 0, 0];
  }

  modifyState(row, column, stateIndex, newValue) {
    if (row < 0 || row >= this.totalRows || column < 0 || column >= this.totalColumns) {
      return;
    }
    const key = `${row}_${column}`;
    let currentStates = this.stateMap.get(key) || [0, 0, 0, 0];
    currentStates[stateIndex] = Math.max(currentStates[stateIndex], newValue);
    this.stateMap.set(key, currentStates);
  }
}

function processGridData(inputContent) {
  const dataLines = inputContent.trim().split("\n");
  const [gridDimR, gridDimC, itemQuantity] = dataLines.shift().split(" ").map(Number);

  const itemPositions = new Map();
  dataLines.map(line => line.split(" ").map(Number))
           .forEach(([itemRow, itemCol, itemVal]) => {
               itemPositions.set(`${itemRow - 1}_${itemCol - 1}`, itemVal);
           });

  const dynamicProgGrid = new GridStateContainer(gridDimR, gridDimC);

  const allCellCoords = Array.from({ length: gridDimR }, (_, rIndex) =>
    Array.from({ length: gridDimC }, (_, cIndex) => ({ r: rIndex, c: cIndex }))
  ).flat();

  allCellCoords.forEach(({ r, c }) => {
    const currentCellItemValue = itemPositions.get(`${r}_${c}`) || 0;

    const statesFromUpperCell = dynamicProgGrid.retrieveStates(r - 1, c);
    for (let kIndex = 0; kIndex < 4; kIndex++) {
      dynamicProgGrid.modifyState(r, c, 0, statesFromUpperCell[kIndex]);
    }

    const statesFromLeftCell = dynamicProgGrid.retrieveStates(r, c - 1);
    for (let kIndex = 0; kIndex < 4; kIndex++) {
      dynamicProgGrid.modifyState(r, c, kIndex, statesFromLeftCell[kIndex]);
    }

    const currentCellAccumulatedStates = dynamicProgGrid.retrieveStates(r, c);
    for (let kIndex = 2; kIndex >= 0; kIndex--) {
      dynamicProgGrid.modifyState(r, c, kIndex + 1, currentCellAccumulatedStates[kIndex] + currentCellItemValue);
    }
  });

  let finalResult = 0;
  const lastCellFinalStates = dynamicProgGrid.retrieveStates(gridDimR - 1, gridDimC - 1);
  for (let kIndex = 0; kIndex < 4; kIndex++) {
    finalResult = Math.max(finalResult, lastCellFinalStates[kIndex]);
  }
  console.log(finalResult);
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
