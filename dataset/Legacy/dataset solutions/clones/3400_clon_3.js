function parseInputData(rawInputString) {
  const lines = rawInputString.split("\n");
  const numElements = parseInt(lines[0], 10);
  const elements = lines[1].split(" ").map(Number);
  return { numElements, elements };
}

function processInput(rawData) {
  const { numElements: arraySize, elements: inputArray } = parseInputData(rawData);

  let stateFlag = 0;
  let maxVal = 0;
  let counter = 1;

  let workingArray = Array(inputArray[0]).fill(1);

  for (let idx = 1; idx < arraySize; idx++) {
    const currentInputVal = inputArray[idx];
    const previousInputVal = inputArray[idx - 1];

    if (stateFlag === 2) {
      let foundDifferenceInWorkingArray = false;
      for (let innerIdx = 0; innerIdx < workingArray.length; innerIdx++) {
        if (workingArray[innerIdx] !== workingArray[0]) {
          stateFlag = 1;
          foundDifferenceInWorkingArray = true;
          break;
        }
      }
      if (!foundDifferenceInWorkingArray) {
          stateFlag = 0;
      }
    }

    if (currentInputVal > previousInputVal) {
      const growthAmount = currentInputVal - previousInputVal;
      for (let innerIdx = 0; innerIdx < growthAmount; innerIdx++) {
        workingArray.push(1);
        if (stateFlag !== 0) {
          stateFlag = 1;
        }
      }
    } else if (stateFlag === 0) {
      workingArray[currentInputVal - 1]++;
      workingArray = workingArray.slice(0, currentInputVal);
      if (workingArray.length !== 1) {
        stateFlag = 1;
        counter++;
      }
    } else if (stateFlag === 1) {
      workingArray = workingArray.slice(0, currentInputVal);
      for (let innerIdx = currentInputVal - 1; innerIdx >= 0; innerIdx--) {
        if (workingArray[innerIdx] === counter) {
          workingArray[innerIdx] = 1;
        } else {
          workingArray[innerIdx]++;
          stateFlag = 2;
          break;
        }
      }
    }
  }

  for (let idx = 0; idx < workingArray.length; idx++) {
    maxVal = Math.max(maxVal, workingArray[idx]);
  }

  console.log('%s', maxVal);
}

function runDebug(){
  const rawData = document.getElementById("input").value;
  processInput(rawData);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
