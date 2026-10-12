function readInputString() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function printOutput(resultValue) {
  console.log(resultValue);
}

function processInputConversion(inputData, conversionMode) {
  const numericValueMapper = (item) => Number(item);

  switch (conversionMode) {
    case 0:
      return inputData;
    case 1:
      return parseInt(inputData, 10);
    case 2:
      return inputData.split(" ");
    case 3:
      return inputData.split("\n");
    case 4:
      return inputData.split(" ").map(numericValueMapper);
    case 5:
      return inputData.split("\n").map(numericValueMapper);
    case 6:
      return inputData.split("");
    case 7:
      return inputData.split("").map(numericValueMapper);
  }
}

function processSequence(sequenceStr) {
  const charArray = processInputConversion(sequenceStr, 6);
  const trackerArrayLength = charArray.length + 1;
  const valueTracker = Array(trackerArrayLength).fill(null);

  const firstChar = charArray[0];
  if (firstChar === "<") {
    valueTracker[0] = 0;
  }

  const lastCharIndex = charArray.length - 1;
  const lastChar = charArray[lastCharIndex];
  if (lastChar === ">") {
    valueTracker[charArray.length] = 0;
  }

  for (let k = 1; k < charArray.length; ++k) {
    const previousChar = charArray[k - 1];
    const currentChar = charArray[k];

    if (previousChar === ">" && currentChar === "<") {
      valueTracker[k] = 0;
    } else if (previousChar === "<" && currentChar === ">") {
      valueTracker[k] = "x";
    }
  }

  for (let k = 0; k < valueTracker.length; ++k) {
    if (k === 0) {
      if (valueTracker[0] === null) {
        valueTracker[0] = 1;
      }
      continue;
    }

    if (valueTracker[k] === 0) {
      continue;
    }

    const previousTrackerValue = valueTracker[k - 1];

    if (previousTrackerValue === 0) {
      valueTracker[k] = 1;
    } else if (valueTracker[k] === "x") {
      valueTracker[k] = previousTrackerValue + 1;
      const nextIndex = k + 1;
      if (nextIndex < valueTracker.length && valueTracker[nextIndex] !== 0) {
        valueTracker[nextIndex] = 1;
      }
      k++;
      continue;
    } else {
      valueTracker[k] = previousTrackerValue + 1;
    }
  }

  let totalSum = 0;
  for (const trackedValue of valueTracker) {
    totalSum += trackedValue;
  }

  printOutput(totalSum);
}

processSequence(readInputString());
