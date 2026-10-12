function processArrayOperations(inputString) {
  const rawLines = inputString.split("\n");
  const elementCount = Number(rawLines[0].split(" ")[0]);
  const initialValues = rawLines[1].split(" ").map(Number);

  let workingArray = [...initialValues];
  let operationLog = [];

  const initialStats = {
    minVal: Number.MAX_SAFE_INTEGER,
    maxVal: Number.MIN_SAFE_INTEGER,
    minIdx: -1,
    maxIdx: -1
  };

  const stats = workingArray.reduce((acc, val, currentIdx) => {
    if (val > acc.maxVal) {
      acc.maxVal = val;
      acc.maxIdx = currentIdx;
    }
    if (val < acc.minVal) {
      acc.minVal = val;
      acc.minIdx = currentIdx;
    }
    return acc;
  }, initialStats);

  const { minVal, maxVal, minIdx, maxIdx } = stats;

  const applyPositiveAscending = (arrRef, opsRef, count) => {
    Array.from({ length: count }, (_, idx) => idx).forEach(idx => {
      if (idx > 0 && arrRef[idx] < arrRef[idx - 1]) {
        opsRef.push([idx + 1, idx + 2]);
        arrRef[idx] = arrRef[idx - 1] + arrRef[idx];
      }
    });
  };

  const applyNegativeDescending = (arrRef, opsRef, count) => {
    Array.from({ length: count }, (_, k) => count - 1 - k).forEach(idx => {
      if (idx < count - 1 && arrRef[idx] > arrRef[idx + 1]) {
        opsRef.push([idx + 2, idx + 1]);
        arrRef[idx] = arrRef[idx + 1] + arrRef[idx];
      }
    });
  };

  const applyPositiveDominated = (arrRef, opsRef, count, currentMaxVal, currentMaxIdx) => {
    Array.from({ length: count }, (_, idx) => idx).forEach(idx => {
      if (currentMaxIdx !== idx) {
        opsRef.push([currentMaxIdx + 1, idx + 1]);
        arrRef[idx] = arrRef[idx] + currentMaxVal;
      }
    });

    Array.from({ length: count }, (_, idx) => idx).forEach(idx => {
      if (idx > 0 && arrRef[idx] < arrRef[idx - 1]) {
        opsRef.push([idx, idx + 1]);
        arrRef[idx] = arrRef[idx - 1] + arrRef[idx];
      }
    });
  };

  const applyNegativeDominated = (arrRef, opsRef, count, currentMinVal, currentMinIdx) => {
    Array.from({ length: count }, (_, idx) => idx).forEach(idx => {
      if (currentMinIdx !== idx) {
        opsRef.push([currentMinIdx + 1, idx + 1]);
        arrRef[idx] = arrRef[idx] + currentMinVal;
      }
    });

    Array.from({ length: count }, (_, k) => count - 1 - k).forEach(idx => {
      if (idx < count - 1 && arrRef[idx] > arrRef[idx + 1]) {
        opsRef.push([idx + 2, idx + 1]);
        arrRef[idx] = arrRef[idx + 1] + arrRef[idx];
      }
    });
  };

  if (minVal >= 0) {
    applyPositiveAscending(workingArray, operationLog, elementCount);
  } else if (maxVal < 0) {
    applyNegativeDescending(workingArray, operationLog, elementCount);
  } else if (maxVal > Math.abs(minVal)) {
    applyPositiveDominated(workingArray, operationLog, elementCount, maxVal, maxIdx);
  } else if (Math.abs(minVal) > maxVal) {
    applyNegativeDominated(workingArray, operationLog, elementCount, minVal, minIdx);
  }

  let resultOutput = operationLog.length.toString();
  operationLog.forEach(opEntry => {
    resultOutput += "\n" + opEntry[0] + " " + opEntry[1];
  });

  console.log('%s', resultOutput);
}

processArrayOperations(require("fs").readFileSync("/dev/stdin", "utf8"));
