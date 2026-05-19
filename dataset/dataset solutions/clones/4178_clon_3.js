const LARGE_MAGNITUDE = Math.pow(10, 6);
const INITIAL_MAX_VALUE = -LARGE_MAGNITUDE - 1;
const INITIAL_MIN_VALUE = LARGE_MAGNITUDE + 1;

function parseIntegerArray(stringArray) {
  return stringArray.map(str => parseInt(str, 10));
}

function recordOperation(operationsList, sourceIndex, targetIndex) {
  operationsList.push([sourceIndex + 1, targetIndex + 1]);
}

function processInputData(rawData) {
  const lines = rawData.split("\n");

  const elementCount = parseInt(lines[0].split(" ")[0], 10);

  let dataArray = parseIntegerArray(lines[1].split(" "));

  let currentMaxValue = INITIAL_MAX_VALUE;
  let currentMinValue = INITIAL_MIN_VALUE;

  for (let idx = 0; idx < elementCount; idx++) {
    const value = dataArray[idx];
    currentMaxValue = Math.max(value, currentMaxValue);
    currentMinValue = Math.min(value, currentMinValue);
  }

  let operationList = [];

  const absMinValue = Math.abs(currentMinValue);

  if (currentMaxValue >= absMinValue) {
    const maxValIndex = dataArray.indexOf(currentMaxValue);

    for (let idx = 0; idx < elementCount; idx++) {
      if (maxValIndex !== idx) {
        recordOperation(operationList, maxValIndex, idx);
        dataArray[idx] += currentMaxValue;
      }
    }

    for (let idx = 1; idx < elementCount; idx++) {
      if (dataArray[idx] < dataArray[idx - 1]) {
        recordOperation(operationList, idx - 1, idx);
        dataArray[idx] += dataArray[idx - 1];
      }
    }
  } else {
    const minValIndex = dataArray.indexOf(currentMinValue);

    for (let idx = 0; idx < elementCount; idx++) {
      if (minValIndex !== idx) {
        recordOperation(operationList, minValIndex, idx);
        dataArray[idx] += currentMinValue;
      }
    }

    for (let idx = elementCount - 2; idx >= 0; idx--) {
      if (dataArray[idx] > dataArray[idx + 1]) {
        recordOperation(operationList, idx + 1, idx);
        dataArray[idx] += dataArray[idx + 1];
      }
    }
  }

  let resultOutput = operationList.length.toString();
  for (const op of operationList) {
    resultOutput += "\n" + op[0] + " " + op[1];
  }

  console.log('%s', resultOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
