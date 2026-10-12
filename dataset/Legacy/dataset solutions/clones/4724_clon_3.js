const createInputReader = () => {
  const fileContentLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
  let currentIndex = 0;
  const totalLines = fileContentLines.length;

  const hasMoreLines = () => currentIndex < totalLines;
  const getNextLine = () => {
    if (!hasMoreLines()) {
      throw new Error("ArrayIndexOutOfBoundsException: No more lines to read.");
    }
    return fileContentLines[currentIndex++];
  };

  return { hasMoreLines, getNextLine };
};

const inputReader = createInputReader();

const dataConverters = {
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (arr) => arr.join(" "),
  9: (arr) => arr.join("\n"),
  0: (arr) => arr.join(""),
};

const processInputData = (inputVal, conversionType) => {
  try {
    const converter = dataConverters[conversionType];
    return converter ? converter(inputVal) : inputVal;
  } catch (e) {
    return inputVal;
  }
};

const readInt = () => processInputData(inputReader.getNextLine(), 1);
const readStrArr = () => processInputData(inputReader.getNextLine(), 2);
const readIntArr = () => processInputData(inputReader.getNextLine(), 4);
const readCharArr = () => processInputData(inputReader.getNextLine(), 6);

const printOutput = (data) => console.log(data);
const printError = (data) => console.error(data);

const create3DArray = (dim1, dim2, dim3, initialValue = undefined) => {
  const arr = new Array(dim1);
  for (let i = 0; i < dim1; i++) {
    arr[i] = new Array(dim2);
    for (let j = 0; j < dim2; j++) {
      arr[i][j] = new Array(dim3).fill(initialValue);
    }
  }
  return arr;
};

const solveProblem = () => {
  const [numItems, targetA, targetB] = readIntArr();

  const itemDataList = [];
  for (let i = 0; i < numItems; i++) {
    itemDataList.push(readIntArr());
  }

  const maxDimensionVal = 151;
  const memoTable = create3DArray(numItems + 1, maxDimensionVal, maxDimensionVal);
  memoTable[0][0][0] = 0;

  for (let i = 1; i <= numItems; i++) {
    const currentItem = itemDataList[i - 1];
    const [itemA, itemB, itemCost] = currentItem;

    for (let j = 0; j < maxDimensionVal; j++) {
      for (let k = 0; k < maxDimensionVal; k++) {
        if (memoTable[i - 1][j][k] !== undefined) {
          memoTable[i][j][k] = memoTable[i - 1][j][k];
        }
      }
    }

    for (let j = 0; j < maxDimensionVal; j++) {
      for (let k = 0; k < maxDimensionVal; k++) {
        const prevCost = memoTable[i - 1][j][k];
        if (prevCost !== undefined) {
          const newA = j + itemA;
          const newB = k + itemB;

          if (newA >= maxDimensionVal || newB >= maxDimensionVal) {
            continue;
          }

          const potentialNewCost = prevCost + itemCost;
          const existingCost = memoTable[i][newA][newB];

          if (existingCost === undefined) {
            memoTable[i][newA][newB] = potentialNewCost;
          } else {
            memoTable[i][newA][newB] = Math.min(potentialNewCost, existingCost);
          }
        }
      }
    }
  }

  let minCostResult = Infinity;

  for (let ratioMultiplier = 1; ; ratioMultiplier++) {
    const currentTargetA = targetA * ratioMultiplier;
    const currentTargetB = targetB * ratioMultiplier;

    if (currentTargetA >= maxDimensionVal || currentTargetB >= maxDimensionVal) {
      break;
    }

    const finalCost = memoTable[numItems][currentTargetA][currentTargetB];
    if (finalCost !== undefined) {
      minCostResult = Math.min(minCostResult, finalCost);
    }
  }

  if (minCostResult === Infinity) {
    printOutput(-1);
  } else {
    printOutput(minCostResult);
  }
};

solveProblem();
