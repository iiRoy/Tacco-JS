let globalCount;

function CountSort(sourceArray, destArray, maxValue) {
  let countRegister = new Array(maxValue + 1);

  for (let idx1 = 0; idx1 <= maxValue; idx1++) {
    countRegister[idx1] = 0;
  }

  for (let idx2 = 0; idx2 < globalCount; idx2++) {
    countRegister[sourceArray[idx2]]++;
  }

  for (let idx1 = 1; idx1 <= maxValue; idx1++) {
    countRegister[idx1] += countRegister[idx1 - 1];
  }

  for (let idx2 = 0; idx2 < globalCount; idx2++) {
    destArray[--countRegister[sourceArray[idx2]]] = sourceArray[idx2];
  }
}

function ProcessInput(rawData) {
  rawData = rawData.split("\n");
  globalCount = parseInt(rawData[0], 10);

  let unsortedValues = new Array(globalCount);
  let sortedValues = new Array(globalCount);

  rawData[1] = rawData[1].split(" ");

  for (let idx1 = 0; idx1 < globalCount; idx1++) {
    unsortedValues[idx1] = parseInt(rawData[1][idx1], 10);
  }

  CountSort(unsortedValues, sortedValues, 10000);

  let matchCount = 0;
  let posMap = new Array(globalCount);
  let revPosMap = new Array(globalCount);

  for (let idx1 = 0; idx1 < globalCount; idx1++) {
    matchCount += (unsortedValues[idx1] === sortedValues[idx1]);
  }

  for (let idx1 = 0; idx1 < globalCount; idx1++) {
    for (let idx2 = 0; idx2 < globalCount; idx2++) {
      if (unsortedValues[idx1] === sortedValues[idx2]) {
        posMap[idx1] = idx2;
        revPosMap[idx2] = idx1;
      }
    }
  }

  let tempVal;
  let totalCost = 0;

  for (let idx1 = 0; idx1 < globalCount; idx1++) {
    if (posMap[posMap[idx1]] === idx1 && posMap[idx1] !== idx1) {
      matchCount += 2;
      totalCost += unsortedValues[idx1] + unsortedValues[posMap[idx1]];

      tempVal = unsortedValues[idx1];
      unsortedValues[idx1] = unsortedValues[posMap[idx1]];
      unsortedValues[posMap[idx1]] = tempVal;

      tempVal = revPosMap[idx1];
      revPosMap[idx1] = revPosMap[posMap[idx1]];
      revPosMap[tempVal] = tempVal;

      tempVal = posMap[idx1];
      posMap[idx1] = posMap[posMap[idx1]];
      posMap[tempVal] = tempVal;
    }
  }

  while (matchCount < globalCount) {
    let minVal = 1000000;
    let minIdx;

    for (let idx1 = 0; idx1 < globalCount; idx1++) {
      if (minVal > unsortedValues[idx1] && posMap[idx1] !== idx1) {
        minVal = unsortedValues[idx1];
        minIdx = idx1;
      }
    }

    while (posMap[minIdx] !== minIdx) {
      totalCost += unsortedValues[minIdx] + unsortedValues[revPosMap[minIdx]];

      tempVal = unsortedValues[minIdx];
      unsortedValues[minIdx] = unsortedValues[revPosMap[minIdx]];
      unsortedValues[revPosMap[minIdx]] = tempVal;

      tempVal = posMap[minIdx];
      posMap[minIdx] = posMap[revPosMap[minIdx]];
      posMap[revPosMap[minIdx]] = tempVal;

      tempVal = revPosMap[minIdx];
      revPosMap[posMap[revPosMap[minIdx]]] = revPosMap[minIdx];
      revPosMap[minIdx] = minIdx;
      minIdx = tempVal;
      matchCount++;
    }
    matchCount++;
  }

  console.log(totalCost);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));