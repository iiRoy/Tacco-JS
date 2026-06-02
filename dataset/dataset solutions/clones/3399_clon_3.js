function processInput(rawData) {
  const lines = rawData.split("\n");

  const arrayLength = parseInt(lines[0], 10);

  const inputValues = new Array(arrayLength);

  const tempStringParts = lines[1].split(" ");

  for (let outerIndex = 0; outerIndex < arrayLength; outerIndex++) {
    inputValues[outerIndex] = parseInt(tempStringParts[outerIndex], 10);
  }

  const dynamicSequence = new Array(inputValues[0]).fill(1);

  let finalResult = 0;

  const analyzeSequenceState = (sequence) => {
    if (sequence.length === 0) {
      return { maxVal: 0, isHomogeneous: true };
    }
    let currentMax = sequence[0];
    let allSame = true;
    for (let k = 1; k < sequence.length; k++) {
      if (sequence[k] !== sequence[0]) {
        allSame = false;
      }
      if (sequence[k] > currentMax) {
        currentMax = sequence[k];
      }
    }
    return { maxVal: currentMax, isHomogeneous: allSame };
  };

  for (let outerIndex = 1; outerIndex < arrayLength; outerIndex++) {
    const currentAValue = inputValues[outerIndex];
    const previousAValue = inputValues[outerIndex - 1];

    const { maxVal: maxElementInB, isHomogeneous: allElementsEqual } = analyzeSequenceState(dynamicSequence);

    if (currentAValue > previousAValue) {
      const elementsToAdd = currentAValue - previousAValue;
      for (let innerIndex = 0; innerIndex < elementsToAdd; innerIndex++) {
        dynamicSequence.push(1);
      }
    } else if (allElementsEqual) {
      dynamicSequence[currentAValue - 1]++;
      dynamicSequence.length = currentAValue;
    } else {
      dynamicSequence.length = currentAValue;
      for (let innerIndex = currentAValue - 1; innerIndex >= 0; innerIndex--) {
        if (dynamicSequence[innerIndex] !== maxElementInB) {
          dynamicSequence[innerIndex]++;
          break;
        }
      }
    }
  }

  for (let outerIndex = 0; outerIndex < dynamicSequence.length; outerIndex++) {
    finalResult = Math.max(finalResult, dynamicSequence[outerIndex]);
  }

  console.log('%s', finalResult);
}

function runDebugExample() {
  const inputElement = document.getElementById("input");
  if (inputElement) {
    processInput(inputElement.value);
  } else {
    console.error("Input element not found for debug function.");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
